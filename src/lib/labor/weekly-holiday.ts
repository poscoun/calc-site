// 주휴수당 계산. 금액은 원 단위 정수.

/** 2026년 최저임금 시급 (고용노동부 고시 제2025-41호 기준, bizforms 2026.5.4·glasswallet 2026.8.6) */
export const MIN_WAGE_2026 = 10_320;
/** 월 환산 주 수: 365일 ÷ 12개월 ÷ 7일 ≈ 4.345주 */
const DAYS_PER_YEAR = 365;

export class WeeklyHolidayInputError extends Error {}

export type WeeklyHolidayResult = {
  eligible: boolean;
  /** 주휴시간 = min(주 소정근로시간, 40) ÷ 40 × 8 */
  holidayHours: number;
  holidayPay: number;
  /** 1주 근로 임금 (주휴 제외) */
  weeklyWage: number;
  weeklyTotal: number;
  /** 월 환산 유급시간 (반올림). 주 40시간이면 209시간 */
  monthlyHours: number;
  monthlyTotal: number;
  belowMinimumWage: boolean;
};

/**
 * 주휴수당 (근로기준법 제55조, 시행령 제30조): 1주 소정근로시간 15시간 이상이고 소정근로일을 개근하면
 * 1주에 평균 1회 이상 유급휴일. 단시간 근로자의 주휴시간은 주 소정근로시간 ÷ 40 × 8 (40시간 초과는 8시간).
 * 출처: calcnara(2026.6), bizforms(2026.5.4), glasswallet(2026.8.6). 5인 미만 사업장도 적용.
 */
export function weeklyHolidayPay(hourlyWage: number, weeklyHours: number): WeeklyHolidayResult {
  if (!Number.isInteger(hourlyWage) || hourlyWage < 0 || hourlyWage > 1_000_000) {
    throw new WeeklyHolidayInputError("시급은 0원 이상 100만 원 이하의 정수로 입력해 주세요.");
  }
  if (!Number.isFinite(weeklyHours) || weeklyHours < 0 || weeklyHours > 168 || Math.round(weeklyHours * 2) !== weeklyHours * 2) {
    throw new WeeklyHolidayInputError("주 근로시간은 0~168시간, 30분 단위로 입력해 주세요.");
  }
  const eligible = weeklyHours >= 15;
  const capped = Math.min(weeklyHours, 40);
  const holidayHours = eligible ? (capped * 8) / 40 : 0;
  // 정수 연산: 시급 × 시간×2 × 8 ÷ 80
  const holidayPay = eligible ? Math.floor((hourlyWage * capped * 2 * 8) / 80) : 0;
  const weeklyWage = Math.floor((hourlyWage * weeklyHours * 2) / 2);
  const monthlyHours = Math.round(((weeklyHours + holidayHours) * DAYS_PER_YEAR) / 84);
  return {
    eligible,
    holidayHours,
    holidayPay,
    weeklyWage,
    weeklyTotal: weeklyWage + holidayPay,
    monthlyHours,
    monthlyTotal: hourlyWage * monthlyHours,
    belowMinimumWage: hourlyWage < MIN_WAGE_2026,
  };
}
