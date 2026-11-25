// 구직급여(실업급여) 계산. 금액은 원 단위 정수. 2026년 1월 1일 이후 이직자 기준.
import { SeveranceInputError, addMonths, parseDate } from "../severance/severance";

const DAY = 86_400_000;

/**
 * 구직급여 산정 기초 임금일액 상한 113,500원 → 1일 상한 68,100원 (113,500 × 60%).
 * 출처: 고용노동부 보도자료 「고용보험법 시행령 등 일부개정령안 국무회의 심의·의결」(2025.12.16),
 * 2026.1.1. 이후 이직자 적용 (shiftee.io 2026.3.11, bizforms 2026.3.12).
 */
export const BASE_WAGE_CEILING = 113_500;
export const DAILY_UPPER = 68_100;
/** 2026년 최저임금 시급 (고용노동부 고시). 하한 = 최저임금 × 80% × 1일 소정근로시간 (고용보험법 제46조) */
export const MIN_WAGE_2026 = 10_320;
export const BENEFIT_RATE_PCT = 60;

/**
 * 소정급여일수 (고용보험법 제50조 별표 1, 2025.2.23. 시행).
 * 행: 피보험기간 1년 미만, 1~3년, 3~5년, 5~10년, 10년 이상
 */
const DAYS_UNDER_50 = [120, 150, 180, 210, 240] as const;
const DAYS_50_PLUS = [120, 180, 210, 240, 270] as const;

export class UnemploymentInputError extends SeveranceInputError {}

export type InsuredPeriod = 0 | 1 | 2 | 3 | 4;
export const INSURED_PERIOD_LABELS: Record<InsuredPeriod, string> = {
  0: "1년 미만",
  1: "1년 이상 3년 미만",
  2: "3년 이상 5년 미만",
  3: "5년 이상 10년 미만",
  4: "10년 이상",
};

export function benefitDays(period: InsuredPeriod, age: number, disabled = false): number {
  const table = age >= 50 || disabled ? DAYS_50_PLUS : DAYS_UNDER_50;
  return table[period];
}

/** 1일 하한액. 소정근로시간은 1~8시간 (8시간 초과는 8시간) */
export function dailyLower(dailyHours = 8): number {
  return Math.floor((MIN_WAGE_2026 * 80 * Math.min(dailyHours, 8)) / 100);
}

export type UnemploymentInput = {
  /** 마지막 근무일 (이직일은 그 다음 날) */
  lastWorkDate: string;
  /** 이직 전 3개월 임금 총액 (세전, 원) */
  wages3m: number;
  /** 이직 전 1년간 상여금 (원) */
  annualBonus?: number;
  /** 이직 전 1년간 연차수당 (원) */
  annualLeavePay?: number;
  /** 이직일 기준 만 나이 */
  age: number;
  disabled?: boolean;
  insuredPeriod: InsuredPeriod;
  /** 1일 소정근로시간 (기본 8) */
  dailyHours?: number;
};

export type UnemploymentResult = {
  periodDays: number;
  /** 1일 평균임금 (원 미만 버림) */
  dailyAverageWage: number;
  /** min(평균임금, 113,500) × 60% (하한 적용 전) */
  rawDaily: number;
  dailyBenefit: number;
  limit: "upper" | "lower" | null;
  days: number;
  total: number;
  /** 30일 기준 월 환산액 */
  monthly: number;
};

export function estimateUnemployment(input: UnemploymentInput): UnemploymentResult {
  const last = parseDate(input.lastWorkDate, "마지막 근무일");
  const bonus = input.annualBonus ?? 0;
  const leave = input.annualLeavePay ?? 0;
  for (const [v, name] of [[input.wages3m, "3개월 임금"], [bonus, "상여금"], [leave, "연차수당"]] as const) {
    if (!Number.isInteger(v) || v < 0 || v > 1_000_000_000) {
      throw new UnemploymentInputError(`${name}은(는) 0원 이상 10억 원 이하로 입력해 주세요.`);
    }
  }
  if (!Number.isInteger(input.age) || input.age < 15 || input.age > 100) {
    throw new UnemploymentInputError("나이는 15세 이상 100세 이하로 입력해 주세요.");
  }
  if (![0, 1, 2, 3, 4].includes(input.insuredPeriod)) {
    throw new UnemploymentInputError("피보험기간을 선택해 주세요.");
  }
  const hours = input.dailyHours ?? 8;
  if (!Number.isInteger(hours) || hours < 1 || hours > 24) {
    throw new UnemploymentInputError("1일 소정근로시간은 1~24시간으로 입력해 주세요.");
  }

  // 평균임금: 이직 전 3개월 임금 총액(상여·연차수당은 1년치의 3/12 가산) ÷ 그 기간 총일수 (근로기준법 제2조)
  const separation = last + DAY;
  const periodDays = Math.round((separation - addMonths(separation, -3)) / DAY);
  const total12 = input.wages3m * 12 + bonus * 3 + leave * 3;
  const dailyAverageWage = Math.floor(total12 / 12 / periodDays);

  const base = Math.min(dailyAverageWage, BASE_WAGE_CEILING);
  const rawDaily = Math.floor((base * BENEFIT_RATE_PCT) / 100);
  const lower = dailyLower(hours);
  let dailyBenefit = rawDaily;
  let limit: UnemploymentResult["limit"] = null;
  if (rawDaily < lower) {
    dailyBenefit = lower;
    limit = "lower";
  } else if (dailyAverageWage > BASE_WAGE_CEILING) {
    limit = "upper"; // rawDaily는 이미 상한 68,100원
  }

  const days = benefitDays(input.insuredPeriod, input.age, input.disabled);
  return { periodDays, dailyAverageWage, rawDaily, dailyBenefit, limit, days, total: dailyBenefit * days, monthly: dailyBenefit * 30 };
}
