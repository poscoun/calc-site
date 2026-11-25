// 중도상환수수료와 DSR 한도. 금액은 원 단위 정수, 율은 0.001% 단위 정수 (0.55% → 550).
import { LoanInputError } from "./loan";

/** 중도상환수수료 부과 가능 기간: 대출일부터 3년 (금융소비자보호법, 금융위원회 2025.1.9 보도자료) */
export const PREPAYMENT_FEE_YEARS = 3;

export type PrepaymentFeeInput = {
  /** 중도상환 금액 */
  amount: number;
  /** 수수료율, 0.001% 단위 */
  feeRateMilli: number;
  /** 대출기간 일수 (3년 초과면 3년으로 본다) */
  loanDays: number;
  /** 상환일부터 만기(3년 초과 대출은 3년째 되는 날)까지 일수 */
  remainingDays: number;
  /** 면제 한도 (예: 부동산담보대출 매년 최초 대출금의 10%) */
  exemptAmount?: number;
};

/**
 * 중도상환수수료 = (상환금액 − 면제금액) × 수수료율 × 잔존일수 ÷ 대출기간, 원 미만 버림.
 * 출처: KB국민은행 중도상환수수료 안내(kbthink, 2026.7.10 수정).
 */
export function prepaymentFee(input: PrepaymentFeeInput): number {
  const { amount, feeRateMilli, loanDays, remainingDays, exemptAmount = 0 } = input;
  if (![amount, feeRateMilli, loanDays, remainingDays, exemptAmount].every((n) => Number.isInteger(n) && n >= 0)) {
    throw new LoanInputError("중도상환수수료 입력값은 0 이상의 정수여야 합니다.");
  }
  if (loanDays === 0 || remainingDays > loanDays) throw new LoanInputError("잔존일수는 대출기간보다 길 수 없습니다.");
  const charged = Math.max(0, amount - exemptAmount);
  return Math.floor((charged * feeRateMilli * remainingDays) / (100_000 * loanDays));
}

/**
 * DSR 한도로 빌릴 수 있는 원리금균등 대출 원금 (다른 대출이 없을 때).
 * 연 원리금 ≤ 연소득 × DSR 비율. 금리는 실제 금리 + 스트레스 금리로 계산한다.
 * 규제 비율 은행 40%·비은행 50% (금융위 고시 제2022-30호). 원 미만 버림.
 */
export function dsrMaxPrincipal(annualIncome: number, dsrPct: number, annualRateMilli: number, months: number): number {
  if (!Number.isInteger(annualIncome) || annualIncome <= 0) throw new LoanInputError("연소득은 1원 이상이어야 합니다.");
  if (!(dsrPct > 0 && dsrPct <= 100)) throw new LoanInputError("DSR 비율은 0% 초과 100% 이하입니다.");
  if (!Number.isInteger(annualRateMilli) || annualRateMilli < 0) throw new LoanInputError("금리가 올바르지 않습니다.");
  if (!Number.isInteger(months) || months < 1) throw new LoanInputError("기간이 올바르지 않습니다.");
  const monthly = (annualIncome * dsrPct) / 100 / 12;
  if (annualRateMilli === 0) return Math.floor(monthly * months);
  const r = annualRateMilli / 1_200_000;
  return Math.floor((monthly * (1 - Math.pow(1 + r, -months))) / r);
}

/** DSR(%) = 연간 원리금 상환액 ÷ 연소득 × 100, 소수 첫째 자리 반올림 */
export function dsrRatio(annualDebtService: number, annualIncome: number): number {
  if (annualIncome <= 0) throw new LoanInputError("연소득은 1원 이상이어야 합니다.");
  return Math.round((annualDebtService / annualIncome) * 1000) / 10;
}
