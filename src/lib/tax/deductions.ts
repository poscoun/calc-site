/**
 * 2026년 귀속 연말정산 소득공제·세액공제 계산.
 * 금액은 원 단위. 수치 출처는 docs/yearend-tax-spec.md (출시 전 국세청 원문 대조 필요).
 */

const MAN = 10_000;
const floor = Math.floor;

function check(name: string, v: number): number {
  if (!Number.isFinite(v) || v < 0) {
    throw new RangeError(`${name}은(는) 0 이상의 유한한 숫자여야 합니다: ${v}`);
  }
  return v;
}

/* ───────────── 신용카드 등 소득공제 (조특법 제126조의2) ─────────────
 * 2026.1.1. 이후 사용분부터 자녀 1명당 기본한도 증액 (7천만 이하 50만, 초과 25만, 최대 2명).
 * 대상 자녀: 기본공제 대상 20세 이하 직계비속 (조특법 시행령). 출처: 언론 보도 2026.11.21, jptcalc.kr.
 */

export type CardSpending = {
  credit: number;
  /** 체크카드·현금영수증 */
  debitCash: number;
  /** 도서·공연·박물관·영화 등 (총급여 7천만 이하만 30%) */
  culture: number;
  traditionalMarket: number;
  publicTransit: number;
};

export function cardDeduction(totalSalary: number, spend: CardSpending, cardLimitChildren: number): number {
  check("총급여", totalSalary);
  Object.entries(spend).forEach(([k, v]) => check(k, v));
  check("자녀 수", cardLimitChildren);

  const lowIncome = totalSalary <= 7_000 * MAN;
  // 7천만 초과면 문화비는 별도 공제율이 없으므로 보수적으로 신용카드 공제율(15%) 적용
  const buckets = [
    { amount: spend.credit + (lowIncome ? 0 : spend.culture), rate: 0.15, special: false },
    { amount: spend.debitCash, rate: 0.3, special: false },
    { amount: lowIncome ? spend.culture : 0, rate: 0.3, special: true },
    { amount: spend.traditionalMarket, rate: 0.4, special: true },
    { amount: spend.publicTransit, rate: 0.4, special: true },
  ];

  // 최저사용금액(총급여 25%)은 공제율이 낮은 사용분부터 차감
  let threshold = totalSalary * 0.25;
  let total = 0;
  let special = 0;
  for (const b of buckets) {
    const used = Math.min(b.amount, threshold);
    threshold -= used;
    const d = (b.amount - used) * b.rate;
    total += d;
    if (b.special) special += d;
  }

  const kids = Math.min(Math.floor(cardLimitChildren), 2);
  const baseLimit = lowIncome ? (300 + 50 * kids) * MAN : (250 + 25 * kids) * MAN;
  if (total <= baseLimit) return floor(total);

  const extraLimit = lowIncome ? 300 * MAN : 200 * MAN;
  return floor(baseLimit + Math.min(total - baseLimit, special, extraLimit));
}

/* ───────────── 세액공제 ───────────── */

/**
 * 자녀세액공제 (소득세법 제59조의2): 1명 25만, 2명 55만, 3명부터 1명당 40만 추가.
 * 대상 나이는 법률 제21548호(2026.4.21.) 부칙 제2조로 2026년 귀속 9세 이상, 2017년생 제외.
 * 출처: 법제처 생활법령 자녀세액공제 (2026.10.15 기준). 나이 판정은 입력 단계에서 사용자가 한다.
 */
export function childTaxCredit(eligibleChildren: number): number {
  const n = Math.floor(check("자녀 수", eligibleChildren));
  if (n === 0) return 0;
  if (n === 1) return 25 * MAN;
  return 55 * MAN + (n - 2) * 40 * MAN;
}

/** 출산·입양 세액공제: 첫째 30만, 둘째 50만, 셋째 이상 70만 */
export function birthTaxCredit(birthOrders: number[]): number {
  return birthOrders.reduce((sum, order) => {
    if (!Number.isInteger(order) || order < 1) throw new RangeError(`출생 순서가 올바르지 않습니다: ${order}`);
    return sum + (order === 1 ? 30 : order === 2 ? 50 : 70) * MAN;
  }, 0);
}

/** 보장성보험료: 연 100만 한도 12% */
export function insuranceCredit(premium: number): number {
  return floor(Math.min(check("보험료", premium), 100 * MAN) * 0.12);
}

/**
 * 의료비 15%. 총급여 3% 초과분부터.
 * special = 본인·65세 이상·장애인·6세 이하 (한도 없음), general = 그 외 부양가족 (700만 한도).
 * 최저사용금액은 일반 의료비에서 먼저 차감.
 */
export function medicalCredit(totalSalary: number, special: number, general: number): number {
  check("총급여", totalSalary);
  check("본인 등 의료비", special);
  check("일반 의료비", general);
  const threshold = totalSalary * 0.03;
  const generalOver = Math.max(0, general - threshold);
  const left = Math.max(0, threshold - general);
  const specialOver = Math.max(0, special - left);
  return floor((Math.min(generalOver, 700 * MAN) + specialOver) * 0.15);
}

export type ChildEducation = { level: "preschool" | "school" | "university"; amount: number };

/** 교육비 15%. 본인 한도 없음, 취학전·초중고 1인 300만, 대학생 1인 900만 */
export function educationCredit(self: number, children: ChildEducation[]): number {
  check("본인 교육비", self);
  const kids = children.reduce((sum, c) => {
    check("자녀 교육비", c.amount);
    const limit = (c.level === "university" ? 900 : 300) * MAN;
    return sum + Math.min(c.amount, limit);
  }, 0);
  return floor((self + kids) * 0.15);
}

/** 일반 기부금: 1천만 이하 15%, 초과분 30% */
export function donationCredit(general: number): number {
  check("기부금", general);
  const base = Math.min(general, 1_000 * MAN);
  return floor(base * 0.15 + (general - base) * 0.3);
}

/** 월세: 총급여 8천만 이하 무주택 세대, 5,500만 이하 17% / 초과 15%, 연 1천만 한도 */
export function rentCredit(totalSalary: number, annualRent: number): number {
  check("총급여", totalSalary);
  check("월세", annualRent);
  if (totalSalary > 8_000 * MAN) return 0;
  const rate = totalSalary <= 5_500 * MAN ? 0.17 : 0.15;
  return floor(Math.min(annualRent, 1_000 * MAN) * rate);
}

/** 연금계좌: 연금저축 600만, IRP 합산 900만 한도. 총급여 5,500만 이하 15% / 초과 12% */
export function pensionAccountCredit(totalSalary: number, pensionSavings: number, irp: number): number {
  check("총급여", totalSalary);
  const eligible = Math.min(Math.min(check("연금저축", pensionSavings), 600 * MAN) + check("IRP", irp), 900 * MAN);
  const rate = totalSalary <= 5_500 * MAN ? 0.15 : 0.12;
  return floor(eligible * rate);
}
