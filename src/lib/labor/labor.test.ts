import { describe, expect, it } from "vitest";
import { annualLeave, annualLeavePay, leaveDaysForYear } from "./annual-leave";
import { MIN_WAGE_2026, weeklyHolidayPay } from "./weekly-holiday";

describe("주휴수당", () => {
  it.each([
    [40, 82_560, 209, 2_156_880],
    [25, 51_600, 130, 1_341_600],
    [20, 41_280, 104, 1_073_280],
    [15, 30_960, 78, 804_960],
  ])("최저시급, 주 %i시간 → 주휴 %i원, 월 %i시간", (h, pay, mh, mt) => {
    const r = weeklyHolidayPay(MIN_WAGE_2026, h);
    expect(r.holidayPay).toBe(pay);
    expect(r.monthlyHours).toBe(mh);
    expect(r.monthlyTotal).toBe(mt);
  });
  it("주 40시간 주급 495,360원", () => {
    expect(weeklyHolidayPay(MIN_WAGE_2026, 40).weeklyTotal).toBe(495_360);
  });
  it("40시간 넘게 일해도 주휴는 8시간", () => {
    expect(weeklyHolidayPay(MIN_WAGE_2026, 52).holidayHours).toBe(8);
  });
  it("주 15시간 미만은 주휴수당 없음", () => {
    const r = weeklyHolidayPay(MIN_WAGE_2026, 14.5);
    expect(r.eligible).toBe(false);
    expect(r.holidayPay).toBe(0);
  });
  it("30분 단위 근로시간", () => {
    expect(weeklyHolidayPay(MIN_WAGE_2026, 22.5).holidayPay).toBe(46_440);
  });
  it("최저임금 미달 표시, 잘못된 입력 거부", () => {
    expect(weeklyHolidayPay(10_000, 20).belowMinimumWage).toBe(true);
    expect(() => weeklyHolidayPay(10_320, 20.3)).toThrow();
    expect(() => weeklyHolidayPay(-1, 20)).toThrow();
  });
});

describe("연차 발생일수", () => {
  it.each([
    [1, 15], [2, 15], [3, 16], [4, 16], [5, 17], [10, 19], [20, 24], [21, 25], [30, 25],
  ])("근속 %i년 → %i일", (y, d) => {
    expect(leaveDaysForYear(y)).toBe(d);
  });

  it("1년 미만은 개근한 달마다 1일", () => {
    expect(annualLeave("2026-01-01", "2026-01-31").currentDays).toBe(0);
    expect(annualLeave("2026-01-01", "2026-02-01").currentDays).toBe(1);
    const r = annualLeave("2026-01-01", "2026-11-25");
    expect(r.currentDays).toBe(10);
    expect(r.next).toEqual({ date: "2026-12-01", days: 1 });
    expect(annualLeave("2026-01-01", "2026-12-31").next).toEqual({ date: "2027-01-01", days: 15 });
  });

  it("1년이 지나면 15일, 다음 발생일 안내", () => {
    const r = annualLeave("2023-03-02", "2026-11-25");
    expect(r.completedYears).toBe(3);
    expect(r.currentDays).toBe(16);
    expect(r.next).toEqual({ date: "2027-03-02", days: 16 });
  });

  it("기준일이 입사일보다 빠르면 거부", () => {
    expect(() => annualLeave("2026-05-01", "2026-04-30")).toThrow();
  });
});

describe("연차수당", () => {
  it("월 통상임금 300만 원, 5일 → 574,165원", () => {
    expect(annualLeavePay(3_000_000, 5)).toEqual({ dailyWage: 114_833, pay: 574_165 });
  });
  it("반차 단위", () => {
    expect(annualLeavePay(3_000_000, 2.5).pay).toBe(287_082);
  });
});

describe("해설글 수치 (weekly-holiday-pay-2026, annual-leave-days-pay)", () => {
  it("주 근로시간별 1주 합계와 월 환산", () => {
    const rows = [40, 25, 20, 15, 14.5].map((h) => {
      const r = weeklyHolidayPay(MIN_WAGE_2026, h);
      return [r.holidayPay, r.weeklyTotal, r.monthlyHours, r.monthlyTotal];
    });
    expect(rows).toEqual([
      [82_560, 495_360, 209, 2_156_880],
      [51_600, 309_600, 130, 1_341_600],
      [41_280, 247_680, 104, 1_073_280],
      [30_960, 185_760, 78, 804_960],
      [0, 149_640, 63, 650_160],
    ]);
  });
  it("최저임금 월급 기준 연차수당과 근속 5년 발생일", () => {
    expect(annualLeavePay(2_156_880, 5)).toEqual({ dailyWage: 82_560, pay: 412_800 });
    expect(annualLeave("2023-03-02", "2026-03-02").currentDays).toBe(16);
    expect(annualLeave("2023-03-02", "2028-03-02").currentDays).toBe(17);
  });
});
