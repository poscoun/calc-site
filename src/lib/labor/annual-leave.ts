// 연차유급휴가 발생일수와 연차수당. 입사일 기준, 5인 이상 사업장, 출근율 80% 이상 가정.
import { addMonths, parseDate } from "../severance/severance";

export class AnnualLeaveInputError extends Error {}

/**
 * 근로기준법 제60조: 1년 미만(또는 출근율 80% 미만)은 1개월 개근마다 1일(최대 11일),
 * 1년 이상 80% 이상 출근 시 15일, 3년 이상 근속하면 최초 1년을 넘는 매 2년마다 1일 가산, 최대 25일.
 * 출처: korea.legal(2026.10.22), shiftee(2026.10.16), bizforms(2026.3.31), glasswallet.
 */
export function leaveDaysForYear(completedYears: number): number {
  if (!Number.isInteger(completedYears) || completedYears < 1) throw new AnnualLeaveInputError("근속연수는 1 이상의 정수여야 합니다.");
  return Math.min(15 + Math.floor((completedYears - 1) / 2), 25);
}

export type AnnualLeaveResult = {
  /** 기준일 현재 만 근속연수 */
  completedYears: number;
  /** 1년 미만 구간에서 개근한 개월 수 */
  completedMonths: number;
  /** 기준일 현재 이번 주기에 발생한 연차 (1년 미만이면 월 단위 누적) */
  currentDays: number;
  /** 다음 연차 발생일과 일수 */
  next: { date: string; days: number };
};

const iso = (t: number) => new Date(t).toISOString().slice(0, 10);

export function annualLeave(startDate: string, asOfDate: string): AnnualLeaveResult {
  const start = parseDate(startDate, "입사일");
  const asOf = parseDate(asOfDate, "기준일");
  if (asOf < start) throw new AnnualLeaveInputError("기준일이 입사일보다 빠릅니다.");

  let years = 0;
  while (addMonths(start, 12 * (years + 1)) <= asOf) years++;

  if (years === 0) {
    let months = 0;
    while (months < 11 && addMonths(start, months + 1) <= asOf) months++;
    const next = months < 11 ? { date: iso(addMonths(start, months + 1)), days: 1 } : { date: iso(addMonths(start, 12)), days: 15 };
    return { completedYears: 0, completedMonths: months, currentDays: months, next };
  }
  return {
    completedYears: years,
    completedMonths: 0,
    currentDays: leaveDaysForYear(years),
    next: { date: iso(addMonths(start, 12 * (years + 1))), days: leaveDaysForYear(years + 1) },
  };
}

/**
 * 연차수당 = 미사용 일수 × 1일 통상임금. 1일 통상임금 = 월 통상임금 ÷ 209시간 × 8시간 (주 40시간 기준, 원 미만 반올림).
 * 출처: bizforms(2026.3.31). 사용촉진(근로기준법 제61조)을 적법하게 했다면 지급 의무가 없다.
 */
export function annualLeavePay(monthlyOrdinaryWage: number, unusedDays: number): { dailyWage: number; pay: number } {
  if (!Number.isInteger(monthlyOrdinaryWage) || monthlyOrdinaryWage < 0 || monthlyOrdinaryWage > 1_000_000_000) {
    throw new AnnualLeaveInputError("월 통상임금은 0원 이상 10억 원 이하로 입력해 주세요.");
  }
  if (!Number.isFinite(unusedDays) || unusedDays < 0 || unusedDays > 25 || Math.round(unusedDays * 2) !== unusedDays * 2) {
    throw new AnnualLeaveInputError("남은 연차는 0~25일, 반차(0.5일) 단위로 입력해 주세요.");
  }
  const dailyWage = Math.round((monthlyOrdinaryWage * 8) / 209);
  return { dailyWage, pay: Math.floor(dailyWage * unusedDays) };
}
