/**
 * 근로소득 종합소득세 핵심 계산 (2026년 귀속).
 * 모든 금액은 원 단위 정수. 법정 수치는 출처 조문을 함께 적는다.
 * 출시 전 국세청·법령 원문과 다시 대조할 것 (docs/yearend-tax-spec.md 참고).
 */

const MAN = 10_000;

function assertAmount(name: string, v: number): void {
  if (!Number.isFinite(v) || v < 0) {
    throw new RangeError(`${name}은(는) 0 이상의 유한한 숫자여야 합니다: ${v}`);
  }
}

/** 근로소득공제 (소득세법 제47조). 한도 2,000만원. */
export function earnedIncomeDeduction(totalSalary: number): number {
  assertAmount("총급여", totalSalary);
  const s = totalSalary;
  let d: number;
  if (s <= 500 * MAN) d = s * 0.7;
  else if (s <= 1_500 * MAN) d = 350 * MAN + (s - 500 * MAN) * 0.4;
  else if (s <= 4_500 * MAN) d = 750 * MAN + (s - 1_500 * MAN) * 0.15;
  else if (s <= 10_000 * MAN) d = 1_200 * MAN + (s - 4_500 * MAN) * 0.05;
  else d = 1_475 * MAN + (s - 10_000 * MAN) * 0.02;
  return Math.floor(Math.min(d, 2_000 * MAN));
}

/** 종합소득세 기본세율 (소득세법 제55조). [과세표준 상한, 세율, 누진공제] */
const TAX_BRACKETS: ReadonlyArray<readonly [number, number, number]> = [
  [1_400 * MAN, 0.06, 0],
  [5_000 * MAN, 0.15, 126 * MAN],
  [8_800 * MAN, 0.24, 576 * MAN],
  [15_000 * MAN, 0.35, 1_544 * MAN],
  [30_000 * MAN, 0.38, 1_994 * MAN],
  [50_000 * MAN, 0.4, 2_594 * MAN],
  [100_000 * MAN, 0.42, 3_594 * MAN],
  [Infinity, 0.45, 6_594 * MAN],
];

/** 산출세액 = 과세표준 × 세율 − 누진공제 */
export function calculatedTax(taxBase: number): number {
  assertAmount("과세표준", taxBase);
  const [, rate, progressive] = TAX_BRACKETS.find(([limit]) => taxBase <= limit)!;
  return Math.max(0, Math.floor(taxBase * rate - progressive));
}

/** 근로소득세액공제 (소득세법 제59조). 산출세액과 총급여별 한도 적용. */
export function earnedIncomeTaxCredit(calcTax: number, totalSalary: number): number {
  assertAmount("산출세액", calcTax);
  assertAmount("총급여", totalSalary);

  const credit = calcTax <= 130 * MAN ? calcTax * 0.55 : 71.5 * MAN + (calcTax - 130 * MAN) * 0.3;

  const s = totalSalary;
  let limit: number;
  if (s <= 3_300 * MAN) limit = 74 * MAN;
  else if (s <= 7_000 * MAN) limit = Math.max(74 * MAN - (s - 3_300 * MAN) * 0.008, 66 * MAN);
  else if (s <= 12_000 * MAN) limit = Math.max(66 * MAN - (s - 7_000 * MAN) * 0.5, 50 * MAN);
  else limit = Math.max(50 * MAN - (s - 12_000 * MAN) * 0.5, 20 * MAN);

  return Math.floor(Math.min(credit, limit));
}

/** 지방소득세 = 결정세액의 10% */
export function localIncomeTax(determinedTax: number): number {
  assertAmount("결정세액", determinedTax);
  return Math.floor(determinedTax * 0.1);
}
