import { calculatedTax, earnedIncomeDeduction, earnedIncomeTaxCredit, localIncomeTax } from "./income-tax";

const MAN = 10_000;

export type YearendInput = {
  /** 총급여 (비과세 제외) */
  totalSalary: number;
  /** 기납부 소득세 (원천징수 합계, 지방소득세 제외) */
  prepaidTax: number;
  /** 기본공제 대상 인원 (본인 포함, 1 이상) */
  dependents: number;
  /** 국민연금·건강·고용보험 본인부담 합계 */
  socialInsurance: number;
};

export type YearendResult = {
  earnedIncome: number;
  taxBase: number;
  calculatedTax: number;
  earnedIncomeCredit: number;
  standardCredit: number;
  determinedTax: number;
  localTax: number;
  /** 양수 = 환급, 음수 = 추가 납부 (지방소득세 포함) */
  refund: number;
};

/**
 * MVP 연말정산 추정: 인적 기본공제, 4대보험, 근로소득세액공제, 표준세액공제(13만)만 반영.
 * 카드·자녀·의료비·교육비·월세·연금저축 등은 docs/yearend-tax-spec.md 순서대로 추가 예정.
 */
export function estimateYearend(input: YearendInput): YearendResult {
  const { totalSalary, prepaidTax, dependents, socialInsurance } = input;
  if (!Number.isInteger(dependents) || dependents < 1) {
    throw new RangeError("기본공제 인원은 본인을 포함해 1명 이상이어야 합니다.");
  }
  if (prepaidTax < 0 || socialInsurance < 0) {
    throw new RangeError("금액은 0 이상이어야 합니다.");
  }

  const earnedIncome = totalSalary - earnedIncomeDeduction(totalSalary);
  const taxBase = Math.max(0, earnedIncome - dependents * 150 * MAN - socialInsurance);
  const calc = calculatedTax(taxBase);
  const earnedIncomeCredit = earnedIncomeTaxCredit(calc, totalSalary);
  const standardCredit = 13 * MAN;
  const determinedTax = Math.max(0, calc - earnedIncomeCredit - standardCredit);
  const localTax = localIncomeTax(determinedTax);
  const prepaidLocal = localIncomeTax(prepaidTax);

  return {
    earnedIncome,
    taxBase,
    calculatedTax: calc,
    earnedIncomeCredit,
    standardCredit,
    determinedTax,
    localTax,
    refund: prepaidTax + prepaidLocal - (determinedTax + localTax),
  };
}
