import { describe, expect, it } from "vitest";
import {
  birthTaxCredit,
  cardDeduction,
  childTaxCredit,
  donationCredit,
  educationCredit,
  insuranceCredit,
  medicalCredit,
  pensionAccountCredit,
  rentCredit,
} from "./deductions";

const MAN = 10_000;
const zero = { credit: 0, debitCash: 0, culture: 0, traditionalMarket: 0, publicTransit: 0 };

describe("신용카드 등 소득공제", () => {
  it("최저사용금액(25%) 초과분만 공제", () => {
    expect(cardDeduction(5_000 * MAN, { ...zero, credit: 2_000 * MAN }, 0)).toBe(1_125_000);
  });
  it("최저사용금액은 신용카드에서 먼저 차감", () => {
    expect(cardDeduction(5_000 * MAN, { ...zero, credit: 1_000 * MAN, debitCash: 1_000 * MAN }, 0)).toBe(225 * MAN);
  });
  it("최저사용금액 미달이면 0", () => {
    expect(cardDeduction(5_000 * MAN, { ...zero, debitCash: 1_000 * MAN }, 0)).toBe(0);
  });
  it("기본한도 300만 (7천만 이하, 자녀 없음)", () => {
    expect(cardDeduction(5_000 * MAN, { ...zero, debitCash: 3_000 * MAN }, 0)).toBe(300 * MAN);
  });
  it("한도 초과분은 대중교통 등 공제액만큼 추가", () => {
    const spend = { ...zero, debitCash: 3_000 * MAN, publicTransit: 300 * MAN };
    expect(cardDeduction(5_000 * MAN, spend, 0)).toBe(420 * MAN);
    expect(cardDeduction(5_000 * MAN, spend, 2)).toBe(520 * MAN); // 자녀 2명 기본한도 400만
    expect(cardDeduction(5_000 * MAN, spend, 5)).toBe(520 * MAN); // 자녀 증액은 2명까지
  });
  it("7천만 초과 기본한도 250만", () => {
    expect(cardDeduction(8_000 * MAN, { ...zero, debitCash: 4_000 * MAN }, 0)).toBe(250 * MAN);
    expect(cardDeduction(8_000 * MAN, { ...zero, debitCash: 4_000 * MAN }, 1)).toBe(275 * MAN);
  });
  it("음수 거부", () => {
    expect(() => cardDeduction(5_000 * MAN, { ...zero, credit: -1 }, 0)).toThrow(RangeError);
  });
});

describe("자녀·출산 세액공제", () => {
  it.each([[0, 0], [1, 25], [2, 55], [3, 95], [4, 135]])("자녀 %i명 → %i만", (n, man) => {
    expect(childTaxCredit(n)).toBe(man * MAN);
  });
  it("출산 순서별", () => {
    expect(birthTaxCredit([1])).toBe(30 * MAN);
    expect(birthTaxCredit([2])).toBe(50 * MAN);
    expect(birthTaxCredit([3])).toBe(70 * MAN);
    expect(() => birthTaxCredit([0])).toThrow(RangeError);
  });
});

describe("특별세액공제", () => {
  it("보장성보험 100만 한도 12%", () => {
    expect(insuranceCredit(150 * MAN)).toBe(12 * MAN);
  });
  it("의료비: 최저사용금액은 일반 의료비에서 먼저 차감", () => {
    expect(medicalCredit(5_000 * MAN, 300 * MAN, 100 * MAN)).toBe(375_000);
  });
  it("의료비: 일반 부양가족 700만 한도", () => {
    expect(medicalCredit(5_000 * MAN, 0, 1_000 * MAN)).toBe(105 * MAN);
  });
  it("교육비: 초중고 300만, 대학 900만 한도, 본인 무제한", () => {
    expect(
      educationCredit(100 * MAN, [
        { level: "school", amount: 400 * MAN },
        { level: "university", amount: 1_000 * MAN },
      ]),
    ).toBe(195 * MAN);
  });
  it("기부금: 1천만 초과분 30%", () => {
    expect(donationCredit(1_200 * MAN)).toBe(210 * MAN);
  });
});

describe("월세·연금계좌", () => {
  it("월세 1천만 한도, 총급여별 공제율", () => {
    expect(rentCredit(5_000 * MAN, 1_200 * MAN)).toBe(170 * MAN);
    expect(rentCredit(6_000 * MAN, 1_200 * MAN)).toBe(150 * MAN);
    expect(rentCredit(9_000 * MAN, 1_200 * MAN)).toBe(0);
  });
  it("연금저축 600만, IRP 합산 900만 한도", () => {
    expect(pensionAccountCredit(5_000 * MAN, 700 * MAN, 400 * MAN)).toBe(135 * MAN);
    expect(pensionAccountCredit(6_000 * MAN, 700 * MAN, 400 * MAN)).toBe(108 * MAN);
    expect(pensionAccountCredit(5_000 * MAN, 700 * MAN, 0)).toBe(90 * MAN);
  });
});
