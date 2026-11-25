import { describe, expect, it } from "vitest";
import { equalPayment, LoanInputError, loanSchedule } from "./loan";
import { dsrMaxPrincipal, dsrRatio, prepaymentFee } from "./prepayment";

const fee = (amount: number, feeRateMilli: number, remainingDays: number, exemptAmount = 0, loanDays = 1095) =>
  prepaymentFee({ amount, feeRateMilli, loanDays, remainingDays, exemptAmount });

describe("중도상환수수료 (loan-prepayment-fee 해설글)", () => {
  it("1억 원 상환 예시", () => {
    expect([fee(1e8, 550, 730), fee(1e8, 750, 730), fee(1e8, 550, 183), fee(1e8, 550, 0), fee(1e8, 1200, 730)]).toEqual([
      366_666, 500_000, 91_917, 0, 800_000,
    ]);
  });
  it("면제 한도와 신용대출", () => {
    expect(fee(1e8, 550, 730, 2e7)).toBe(293_333);
    expect(fee(3e7, 110, 183, 0, 365)).toBe(16_545);
    expect(fee(1e7, 550, 730, 2e7)).toBe(0);
  });
  it("잘못된 입력", () => {
    expect(() => fee(1e8, 550, 2000)).toThrow(LoanInputError);
    expect(() => fee(-1, 550, 10)).toThrow(LoanInputError);
  });
  it("대환 손익 예시 (잔액 2억, 29년, 4.5% → 3.8%)", () => {
    const a = loanSchedule({ principal: 2e8, annualRateMilli: 4500, months: 348, method: "equal-payment" });
    const b = loanSchedule({ principal: 2e8, annualRateMilli: 3800, months: 348, method: "equal-payment" });
    const y1 = (r: typeof a) => r.schedule.slice(0, 12).reduce((s, i) => s + i.interest, 0);
    expect([a.firstPayment, b.firstPayment, y1(a) - y1(b), a.totalInterest - b.totalInterest]).toEqual([1_029_987, 949_219, 1_396_552, 28_106_889]);
    expect(fee(2e8, 550, 730)).toBe(733_333);
  });
});

describe("DSR (dsr-stress-limit-2026 해설글)", () => {
  it("연봉 5,000만 원, DSR 40%, 4% + 스트레스 금리, 30년", () => {
    expect([0, 750, 2400, 3000].map((s) => dsrMaxPrincipal(5e7, 40, 4000 + s, 360))).toEqual([
      349_102_067, 319_500_656, 266_450_986, 250_512_613,
    ]);
    expect(dsrMaxPrincipal(5e7, 40, 4000, 360) - dsrMaxPrincipal(5e7, 40, 7000, 360)).toBe(98_589_454);
  });
  it("3억 원 대출의 DSR", () => {
    expect(equalPayment(3e8, 4000, 360)).toBe(1_432_246);
    expect(dsrRatio(equalPayment(3e8, 4000, 360) * 12, 5e7)).toBe(34.4);
    expect(dsrRatio(equalPayment(3e8, 7000, 360) * 12, 5e7)).toBe(47.9);
  });
  it("한도 원금의 원리금이 DSR 한도를 넘지 않음", () => {
    const p = dsrMaxPrincipal(5e7, 40, 7000, 360);
    expect(equalPayment(p, 7000, 360) * 12).toBeLessThanOrEqual(5e7 * 0.4 + 12);
    expect(dsrMaxPrincipal(1.2e7, 50, 0, 12)).toBe(6_000_000);
    expect(() => dsrMaxPrincipal(0, 40, 4000, 360)).toThrow(LoanInputError);
  });
});
