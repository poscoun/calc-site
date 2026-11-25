import { describe, expect, it } from "vitest";
import { DAILY_UPPER, benefitDays, dailyLower, estimateUnemployment } from "./benefit";

const MAN = 10_000;

describe("상한·하한", () => {
  it("상한 68,100원 = 기초일액 상한 113,500원 × 60%", () => {
    expect(DAILY_UPPER).toBe(68_100);
  });
  it("하한 = 최저임금 10,320원 × 80% × 소정근로시간", () => {
    expect(dailyLower()).toBe(66_048);
    expect(dailyLower(4)).toBe(33_024);
    expect(dailyLower(10)).toBe(66_048);
  });
});

describe("소정급여일수", () => {
  it.each([
    [0, 30, 120], [1, 30, 150], [2, 30, 180], [3, 30, 210], [4, 30, 240],
    [0, 50, 120], [1, 50, 180], [2, 50, 210], [3, 50, 240], [4, 50, 270],
  ] as const)("피보험기간 구간 %i, %i세 → %i일", (p, age, days) => {
    expect(benefitDays(p, age)).toBe(days);
  });
  it("장애인은 50세 미만이어도 50세 이상 표", () => {
    expect(benefitDays(1, 35, true)).toBe(180);
  });
});

describe("estimateUnemployment", () => {
  const base = { lastWorkDate: "2026-11-30", age: 35, insuredPeriod: 2 as const };

  it("월급 300만 원이면 하한액 적용", () => {
    const r = estimateUnemployment({ ...base, wages3m: 900 * MAN });
    expect(r.periodDays).toBe(91); // 9/1~11/30
    expect(r.dailyAverageWage).toBe(98_901);
    expect(r.rawDaily).toBe(59_340);
    expect(r.dailyBenefit).toBe(66_048);
    expect(r.limit).toBe("lower");
    expect(r.days).toBe(180);
    expect(r.total).toBe(11_888_640);
  });

  it("월급 400만 원이면 상한액 적용", () => {
    const r = estimateUnemployment({ ...base, wages3m: 1_200 * MAN });
    expect(r.dailyAverageWage).toBe(131_868);
    expect(r.dailyBenefit).toBe(68_100);
    expect(r.limit).toBe("upper");
    expect(r.total).toBe(12_258_000);
    expect(r.monthly).toBe(2_043_000);
  });

  it("상한·하한 사이 구간 (평균임금 110,080원 초과 113,500원 이하)", () => {
    const r = estimateUnemployment({ ...base, wages3m: 1_030 * MAN });
    expect(r.dailyAverageWage).toBe(113_186);
    expect(r.dailyBenefit).toBe(67_911);
    expect(r.limit).toBeNull();
    expect(r.total).toBe(12_223_980);
  });

  it("단시간 근로자는 하한액이 시간에 비례", () => {
    const r = estimateUnemployment({ ...base, wages3m: 300 * MAN, dailyHours: 4 });
    expect(r.dailyBenefit).toBe(33_024);
  });

  it("50세 이상, 피보험 10년 이상이면 270일", () => {
    const r = estimateUnemployment({ ...base, age: 52, insuredPeriod: 4, wages3m: 1_200 * MAN });
    expect(r.days).toBe(270);
    expect(r.total).toBe(18_387_000);
  });

  it("잘못된 입력 거부", () => {
    expect(() => estimateUnemployment({ ...base, wages3m: -1 })).toThrow();
    expect(() => estimateUnemployment({ ...base, wages3m: 0, age: 10 })).toThrow();
    expect(() => estimateUnemployment({ ...base, wages3m: 0, lastWorkDate: "2026-02-30" })).toThrow();
  });
});
