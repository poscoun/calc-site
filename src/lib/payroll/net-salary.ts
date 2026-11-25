import { CHILD_CREDIT, EMPLOYMENT_EMPLOYEE_PPM, HEALTH, PENSION } from "./rates";
import { TAX_AT_10000, TAX_TABLE } from "./withholding-table";

/** amount × ppm / 1,000,000, 원 미만 버림 */
const mulPpm = (amount: number, ppm: number) => Math.floor((amount * ppm) / 1_000_000);
/** 10원 미만 버림 (보험료·원천징수 세액의 원 단위 절사) */
const floor10 = (won: number) => Math.floor(won / 10) * 10;
const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max);

export type Insurance = {
  nationalPension: number;
  health: number;
  longTermCare: number;
  employment: number;
  total: number;
};

/** 4대보험 근로자 부담금 (월). monthlyPay = 비과세를 뺀 월 보수 */
export function employeeInsurance(monthlyPay: number): Insurance {
  // 국민연금: 기준소득월액 = 천원 미만 버림 후 하한·상한 적용
  const pensionBase = clamp(Math.floor(monthlyPay / 1000) * 1000, PENSION.floor, PENSION.ceiling);
  const nationalPension = monthlyPay === 0 ? 0 : floor10(mulPpm(pensionBase, PENSION.ratePpm / 2));
  // 건강보험: 보험료의 절반. 월 보험료 하한·상한도 절반씩
  const healthHalf = clamp(mulPpm(monthlyPay, HEALTH.ratePpm / 2), HEALTH.premiumFloor / 2, HEALTH.premiumCeiling / 2);
  const health = monthlyPay === 0 ? 0 : floor10(healthHalf);
  const longTermCare = floor10(Math.floor((health * HEALTH.longTermCarePpm) / HEALTH.ratePpm));
  const employment = floor10(mulPpm(monthlyPay, EMPLOYMENT_EMPLOYEE_PPM));
  return {
    nationalPension,
    health,
    longTermCare,
    employment,
    total: nationalPension + health + longTermCare + employment,
  };
}

/** 공제대상가족 수별 금액. 11명 초과는 별표 2 비고: 11명 세액 − (10명 − 11명 세액) × 초과 인원 */
function byFamily(amounts: readonly number[], family: number, offset: number): number {
  if (family <= 11) return amounts[offset + family - 1];
  const t10 = amounts[offset + 9];
  const t11 = amounts[offset + 10];
  return Math.max(0, t11 - (t10 - t11) * (family - 11));
}

/** 월급여 1,000만원 초과분에 더하는 세액 (별표 2 계산식) */
function above10Million(pay: number): number {
  if (pay <= 14_000_000) return 25_000 + Math.floor(((pay - 10_000_000) * 343) / 1000); // 98% × 35%
  if (pay <= 28_000_000) return 1_397_000 + Math.floor(((pay - 14_000_000) * 3724) / 10_000); // 98% × 38%
  if (pay <= 30_000_000) return 6_610_600 + Math.floor(((pay - 28_000_000) * 392) / 1000); // 98% × 40%
  if (pay <= 45_000_000) return 7_394_600 + Math.floor(((pay - 30_000_000) * 40) / 100);
  if (pay <= 87_000_000) return 13_394_600 + Math.floor(((pay - 45_000_000) * 42) / 100);
  return 31_034_600 + Math.floor(((pay - 87_000_000) * 45) / 100);
}

/** 간이세액표 금액 (자녀 공제 전). monthlyPay = 비과세를 뺀 월 급여, family = 본인 포함 공제대상가족 수 */
export function taxTableAmount(monthlyPay: number, family: number): number {
  if (monthlyPay < 770_000) return 0;
  if (monthlyPay < 10_000_000) {
    const thousand = Math.floor(monthlyPay / 1000);
    let lo = 0;
    let hi = TAX_TABLE.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (TAX_TABLE[mid][0] <= thousand) lo = mid;
      else hi = mid - 1;
    }
    return byFamily(TAX_TABLE[lo], family, 2);
  }
  const base = byFamily(TAX_AT_10000, family, 0);
  return monthlyPay === 10_000_000 ? base : floor10(base + above10Million(monthlyPay));
}

/** 간이세액표 자녀 공제 (월) */
export function childCredit(children: number): number {
  if (children <= 0) return 0;
  if (children === 1) return CHILD_CREDIT.one;
  return CHILD_CREDIT.two + CHILD_CREDIT.perExtra * (children - 2);
}

export type NetSalaryInput = {
  /** 연봉 (원) */
  annualSalary: number;
  /** 월 비과세액 (원, 식대 등) */
  monthlyNonTaxable: number;
  /** 본인 포함 공제대상가족 수 (1 이상) */
  family: number;
  /** 8세 이상 20세 이하 자녀 수 (공제대상가족에 포함된 인원) */
  children: number;
  /** 연봉에 퇴직금이 포함돼 있으면 13으로 나눠 월급을 구한다 */
  severanceIncluded?: boolean;
  /** 원천징수 비율 (80·100·120%, 기본 100) */
  taxRatio?: 80 | 100 | 120;
};

export type NetSalaryResult = {
  monthlyGross: number;
  taxablePay: number;
  insurance: Insurance;
  incomeTax: number;
  localIncomeTax: number;
  totalDeduction: number;
  monthlyNet: number;
  annualNet: number;
};

export class NetSalaryInputError extends Error {}

function requireInt(value: number, name: string, min: number, max: number): number {
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new NetSalaryInputError(`${name}은(는) ${min}~${max} 사이의 정수여야 합니다.`);
  }
  return value;
}

/** 연봉 실수령액 (월 기준, 매달 같은 금액을 받는다고 가정) */
export function estimateNetSalary(input: NetSalaryInput): NetSalaryResult {
  const annual = requireInt(input.annualSalary, "연봉", 0, 100_000_000_000);
  const nonTaxable = requireInt(input.monthlyNonTaxable, "비과세액", 0, 100_000_000);
  const family = requireInt(input.family, "공제대상가족 수", 1, 50);
  const children = requireInt(input.children, "자녀 수", 0, family - 1);
  const ratio = input.taxRatio ?? 100;
  if (ratio !== 80 && ratio !== 100 && ratio !== 120) {
    throw new NetSalaryInputError("원천징수 비율은 80, 100, 120 중 하나여야 합니다.");
  }

  const monthlyGross = Math.floor(annual / (input.severanceIncluded ? 13 : 12));
  const taxablePay = Math.max(0, monthlyGross - nonTaxable);
  const insurance = employeeInsurance(taxablePay);

  const afterChild = Math.max(0, taxTableAmount(taxablePay, family) - childCredit(children));
  const incomeTax = floor10((afterChild * ratio) / 100);
  const localIncomeTax = floor10(incomeTax / 10);

  const totalDeduction = insurance.total + incomeTax + localIncomeTax;
  const monthlyNet = monthlyGross - totalDeduction;
  return {
    monthlyGross,
    taxablePay,
    insurance,
    incomeTax,
    localIncomeTax,
    totalDeduction,
    monthlyNet,
    annualNet: monthlyNet * 12,
  };
}
