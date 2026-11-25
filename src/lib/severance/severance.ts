// 퇴직금과 퇴직소득세. 금액은 원 단위 정수, 날짜는 "YYYY-MM-DD" 문자열 (UTC 기준 일수 계산).

const DAY = 86_400_000;

export class SeveranceInputError extends Error {}

export function parseDate(s: string, name: string): number {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) throw new SeveranceInputError(`${name}을(를) YYYY-MM-DD 형식으로 입력해 주세요.`);
  const t = Date.UTC(+m[1], +m[2] - 1, +m[3]);
  const d = new Date(t);
  if (d.getUTCMonth() !== +m[2] - 1 || d.getUTCDate() !== +m[3]) throw new SeveranceInputError(`${name}이(가) 올바른 날짜가 아닙니다.`);
  return t;
}

/** t에서 n개월 이동 (말일 보정: 5/31 − 3개월 = 2/28·29) */
export function addMonths(t: number, n: number): number {
  const d = new Date(t);
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth() + n;
  const last = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  return Date.UTC(y, m, Math.min(d.getUTCDate(), last));
}

/**
 * 퇴직소득세 근속연수: 입사일부터 퇴직일 전날까지, 1년 미만 기간은 1년으로 본다
 * (소득세법 시행령 제105조).
 */
export function serviceYears(startMs: number, retireMs: number): number {
  let y = 0;
  while (addMonths(startMs, 12 * (y + 1)) <= retireMs) y++;
  return addMonths(startMs, 12 * y) < retireMs ? y + 1 : y;
}

/** 근속연수공제 (소득세법 제48조 제1항 제2호 가목) */
export function serviceYearsDeduction(years: number): number {
  if (years <= 5) return 1_000_000 * years;
  if (years <= 10) return 5_000_000 + 2_000_000 * (years - 5);
  if (years <= 20) return 15_000_000 + 2_500_000 * (years - 10);
  return 40_000_000 + 3_000_000 * (years - 20);
}

/** 환산급여공제 (소득세법 제48조 제1항 제2호 나목) */
export function convertedPayDeduction(converted: number): number {
  if (converted <= 8_000_000) return converted;
  if (converted <= 70_000_000) return 8_000_000 + Math.floor(((converted - 8_000_000) * 60) / 100);
  if (converted <= 100_000_000) return 45_200_000 + Math.floor(((converted - 70_000_000) * 55) / 100);
  if (converted <= 300_000_000) return 61_700_000 + Math.floor(((converted - 100_000_000) * 45) / 100);
  return 151_700_000 + Math.floor(((converted - 300_000_000) * 35) / 100);
}

// 종합소득세 기본세율 (소득세법 제55조 제1항, 2023년 이후)
const BRACKETS: [limit: number, rate: number, progressive: number][] = [
  [14_000_000, 6, 0],
  [50_000_000, 15, 1_260_000],
  [88_000_000, 24, 5_760_000],
  [150_000_000, 35, 15_440_000],
  [300_000_000, 38, 19_940_000],
  [500_000_000, 40, 25_940_000],
  [1_000_000_000, 42, 35_940_000],
  [Infinity, 45, 65_940_000],
];

function basicTax(base: number): number {
  if (base <= 0) return 0;
  const [, rate, prog] = BRACKETS.find(([limit]) => base <= limit)!;
  return Math.floor((base * rate) / 100) - prog;
}

export type RetirementTax = {
  years: number;
  serviceDeduction: number;
  convertedPay: number;
  convertedDeduction: number;
  taxBase: number;
  convertedTax: number;
  incomeTax: number;
  localTax: number;
};

/** 퇴직소득세 (소득세법 제48조·제55조 제2항, 연분연승) */
export function retirementTax(severance: number, years: number): RetirementTax {
  const serviceDeduction = serviceYearsDeduction(years);
  const afterService = Math.max(0, severance - serviceDeduction);
  const convertedPay = Math.floor((afterService * 12) / years);
  const convertedDeduction = convertedPayDeduction(convertedPay);
  const taxBase = convertedPay - convertedDeduction;
  const convertedTax = basicTax(taxBase);
  const incomeTax = Math.floor((convertedTax * years) / 12);
  const localTax = Math.floor(incomeTax / 10);
  return { years, serviceDeduction, convertedPay, convertedDeduction, taxBase, convertedTax, incomeTax, localTax };
}

export type SeveranceInput = {
  /** 입사일 */
  startDate: string;
  /** 마지막 근무일 (퇴직일은 그 다음 날) */
  lastWorkDate: string;
  /** 퇴직 전 3개월 임금 총액 (세전, 원) */
  wages3m: number;
  /** 퇴직 전 1년간 상여금 총액 (원) */
  annualBonus: number;
  /** 퇴직 전 1년간 연차수당 (원) */
  annualLeavePay: number;
};

export type SeveranceResult = {
  serviceDays: number;
  eligible: boolean;
  periodDays: number;
  /** 1일 평균임금 (원, 소수점 2자리 반올림 표시용) */
  dailyAverageWage: number;
  severance: number;
  tax: RetirementTax | null;
  net: number;
};

/**
 * 퇴직금 = 1일 평균임금 × 30일 × 재직일수 / 365 (근로자퇴직급여 보장법 제8조).
 * 평균임금 = 퇴직 전 3개월 임금 총액(상여금·연차수당은 3/12 가산) ÷ 그 기간 총일수 (근로기준법 제2조 제1항 제6호).
 * 계속근로 1년 미만이면 퇴직금이 없다.
 */
export function estimateSeverance(input: SeveranceInput): SeveranceResult {
  const start = parseDate(input.startDate, "입사일");
  const last = parseDate(input.lastWorkDate, "마지막 근무일");
  if (last < start) throw new SeveranceInputError("마지막 근무일이 입사일보다 빠릅니다.");
  for (const [v, name] of [[input.wages3m, "3개월 임금"], [input.annualBonus, "상여금"], [input.annualLeavePay, "연차수당"]] as const) {
    if (!Number.isInteger(v) || v < 0 || v > 1_000_000_000) throw new SeveranceInputError(`${name}은(는) 0원 이상 10억 원 이하로 입력해 주세요.`);
  }

  const retire = last + DAY; // 퇴직일 = 마지막 근무일 다음 날
  const serviceDays = Math.round((retire - start) / DAY);
  const periodStart = Math.max(start, addMonths(retire, -3));
  const periodDays = Math.round((retire - periodStart) / DAY);

  // 정수 연산: (임금×12 + 상여×3 + 연차×3) / 12 를 3개월 임금 총액으로 쓴다
  const wageTotal12 = input.wages3m * 12 + input.annualBonus * 3 + input.annualLeavePay * 3;
  const dailyAverageWage = Math.round((wageTotal12 / 12 / periodDays) * 100) / 100;
  const eligible = serviceDays >= 365;
  const severance = eligible ? Math.floor((wageTotal12 * 30 * serviceDays) / (12 * periodDays * 365)) : 0;

  const tax = severance > 0 ? retirementTax(severance, serviceYears(start, retire)) : null;
  const net = severance - (tax ? tax.incomeTax + tax.localTax : 0);
  return { serviceDays, eligible, periodDays, dailyAverageWage, severance, tax, net };
}
