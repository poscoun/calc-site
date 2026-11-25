import { describe, expect, it } from "vitest";
import { equalPayment, LoanInputError, loanSchedule, parseRate } from "./loan";

describe("equalPayment", () => {
  it("1억, 연 5%, 12개월 → 월 8,560,748원", () => {
    expect(equalPayment(100_000_000, 5000, 12)).toBe(8_560_748);
  });
  it("금리 0%면 원금 ÷ 개월 (올림)", () => {
    expect(equalPayment(100_000_000, 0, 12)).toBe(8_333_334);
  });
});

describe("loanSchedule", () => {
  it("원금균등: 1.2억, 6%, 12개월 → 총이자 390만 원", () => {
    const r = loanSchedule({ principal: 120_000_000, annualRateMilli: 6000, months: 12, method: "equal-principal" });
    expect(r.firstPayment).toBe(10_600_000);
    expect(r.schedule[11]).toEqual({ month: 12, payment: 10_050_000, principal: 10_000_000, interest: 50_000, balance: 0 });
    expect(r.totalInterest).toBe(3_900_000);
  });

  it("만기일시: 매달 이자만, 마지막 달 원금", () => {
    const r = loanSchedule({ principal: 100_000_000, annualRateMilli: 5000, months: 12, method: "bullet" });
    expect(r.firstPayment).toBe(416_666);
    expect(r.schedule[11].payment).toBe(100_416_666);
    expect(r.totalInterest).toBe(4_999_992);
  });

  it("원리금균등: 매달 같은 금액, 잔액 0으로 끝남, 원금 합계 = 대출금", () => {
    const r = loanSchedule({ principal: 100_000_000, annualRateMilli: 5000, months: 12, method: "equal-payment" });
    expect(r.schedule.slice(0, 11).every((i) => i.payment === 8_560_748)).toBe(true);
    expect(r.schedule.at(-1)!.balance).toBe(0);
    expect(r.schedule.reduce((s, i) => s + i.principal, 0)).toBe(100_000_000);
    expect(Math.abs(r.schedule.at(-1)!.payment - 8_560_748)).toBeLessThan(20);
  });

  it("총이자: 만기일시 > 원리금균등 > 원금균등", () => {
    const base = { principal: 300_000_000, annualRateMilli: 4000, months: 360 };
    const bullet = loanSchedule({ ...base, method: "bullet" }).totalInterest;
    const ep = loanSchedule({ ...base, method: "equal-payment" }).totalInterest;
    const epr = loanSchedule({ ...base, method: "equal-principal" }).totalInterest;
    expect(bullet).toBeGreaterThan(ep);
    expect(ep).toBeGreaterThan(epr);
  });

  it("거치 기간에는 이자만 낸다", () => {
    const r = loanSchedule({ principal: 120_000_000, annualRateMilli: 6000, months: 24, graceMonths: 12, method: "equal-principal" });
    expect(r.schedule.slice(0, 12).every((i) => i.principal === 0 && i.interest === 600_000)).toBe(true);
    expect(r.firstPayment).toBe(10_600_000);
    expect(r.schedule.at(-1)!.balance).toBe(0);
  });

  it("잘못된 입력은 거부", () => {
    expect(() => loanSchedule({ principal: 0, annualRateMilli: 4000, months: 12, method: "bullet" })).toThrow(LoanInputError);
    expect(() => loanSchedule({ principal: 1_000_000, annualRateMilli: 4000, months: 12, graceMonths: 12, method: "equal-payment" })).toThrow(LoanInputError);
    expect(() => loanSchedule({ principal: 1_000_000, annualRateMilli: 4000, months: 601, method: "bullet" })).toThrow(LoanInputError);
  });
});

describe("parseRate", () => {
  it("소수점 셋째 자리까지", () => {
    expect(parseRate("4.5")).toBe(4500);
    expect(parseRate("3.875")).toBe(3875);
    expect(parseRate("4")).toBe(4000);
    expect(parseRate("4.")).toBe(4000);
    expect(parseRate("4.1234")).toBeNaN();
    expect(parseRate("abc")).toBeNaN();
  });
});

describe("해설글(loan-repayment-methods) 예시 수치", () => {
  const base = { principal: 300_000_000, annualRateMilli: 4000, months: 360 };
  it("3억, 4%, 30년 방식별", () => {
    const ep = loanSchedule({ ...base, method: "equal-payment" });
    expect([ep.firstPayment, ep.schedule.at(-1)!.payment, ep.totalInterest, ep.schedule[119].balance]).toEqual([1_432_246, 1_431_836, 215_608_150, 236_351_789]);
    expect(ep.schedule.slice(0, 12).reduce((s, i) => s + i.interest, 0)).toBe(11_903_836);
    const epr = loanSchedule({ ...base, method: "equal-principal" });
    expect([epr.firstPayment, epr.schedule.at(-1)!.payment, epr.totalInterest]).toEqual([1_833_333, 836_231, 180_499_894]);
    const b = loanSchedule({ ...base, method: "bullet" });
    expect([b.firstPayment, b.schedule.at(-1)!.payment, b.totalInterest]).toEqual([1_000_000, 301_000_000, 360_000_000]);
  });
  it("금리·기간·거치", () => {
    const ep = (o: Partial<typeof base> & { graceMonths?: number }) => loanSchedule({ ...base, ...o, method: "equal-payment" });
    expect(ep({ annualRateMilli: 3500 }).totalInterest).toBe(184_967_964);
    expect(ep({ annualRateMilli: 4500 }).totalInterest).toBe(247_219_745);
    expect(ep({ months: 240 }).firstPayment).toBe(1_817_941);
    expect(ep({ months: 480 }).totalInterest).toBe(301_831_077);
    const g = ep({ graceMonths: 12 });
    expect([g.firstPayment, g.totalInterest]).toEqual([1_457_920, 219_356_098]);
  });
});
