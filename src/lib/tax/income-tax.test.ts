import { describe, expect, it } from "vitest";
import { calculatedTax, earnedIncomeDeduction, earnedIncomeTaxCredit, localIncomeTax } from "./income-tax";

const MAN = 10_000;

describe("근로소득공제", () => {
  it.each([
    [0, 0],
    [500 * MAN, 350 * MAN],
    [1_500 * MAN, 750 * MAN],
    [4_500 * MAN, 1_200 * MAN],
    [7_000 * MAN, 1_325 * MAN], // taxcut.kr 예시값과 일치
    [10_000 * MAN, 1_475 * MAN],
    [100_000 * MAN, 2_000 * MAN], // 한도
  ])("총급여 %i → %i", (salary, expected) => {
    expect(earnedIncomeDeduction(salary)).toBe(expected);
  });

  it("음수나 NaN은 거부", () => {
    expect(() => earnedIncomeDeduction(-1)).toThrow(RangeError);
    expect(() => earnedIncomeDeduction(Number.NaN)).toThrow(RangeError);
  });
});

describe("산출세액", () => {
  it.each([
    [0, 0],
    [1_400 * MAN, 84 * MAN],
    [4_042 * MAN, 4_803_000], // taxcut.kr 예시 480만원
    [5_000 * MAN, 624 * MAN],
    [8_800 * MAN, 1_536 * MAN],
  ])("과세표준 %i → %i", (base, expected) => {
    expect(calculatedTax(base)).toBe(expected);
  });

  it("구간 경계에서 연속", () => {
    for (const edge of [1_400, 5_000, 8_800, 15_000, 30_000, 50_000, 100_000]) {
      const diff = calculatedTax(edge * MAN + 1) - calculatedTax(edge * MAN);
      expect(diff).toBeLessThanOrEqual(1);
    }
  });
});

describe("근로소득세액공제", () => {
  it("taxcut.kr 예시: 총급여 7천만, 산출세액 480만 → 66만", () => {
    expect(earnedIncomeTaxCredit(480 * MAN, 7_000 * MAN)).toBe(66 * MAN);
  });
  it("산출세액 130만 이하는 55%", () => {
    expect(earnedIncomeTaxCredit(100 * MAN, 3_000 * MAN)).toBe(55 * MAN);
  });
  it("총급여 3,300만 이하 한도 74만", () => {
    expect(earnedIncomeTaxCredit(300 * MAN, 3_300 * MAN)).toBe(74 * MAN);
  });
  it("총급여 1.2억 초과 하한 20만", () => {
    expect(earnedIncomeTaxCredit(5_000 * MAN, 20_000 * MAN)).toBe(20 * MAN);
  });
});

describe("지방소득세", () => {
  it("결정세액의 10%, 원 미만 절사", () => {
    expect(localIncomeTax(1_234_567)).toBe(123_456);
  });
});
