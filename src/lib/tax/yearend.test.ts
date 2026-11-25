import { describe, expect, it } from "vitest";
import { estimateYearend } from "./yearend";

const MAN = 10_000;

describe("estimateYearend", () => {
  it("저소득은 결정세액 0, 기납부세액 전액 환급", () => {
    const r = estimateYearend({ totalSalary: 1_500 * MAN, prepaidTax: 10 * MAN, dependents: 1, socialInsurance: 120 * MAN });
    expect(r.determinedTax).toBe(0);
    expect(r.refund).toBe(11 * MAN); // 소득세 10만 + 지방세 1만
  });

  it("기납부세액이 적으면 음수(추가 납부)", () => {
    const r = estimateYearend({ totalSalary: 7_000 * MAN, prepaidTax: 0, dependents: 1, socialInsurance: 600 * MAN });
    expect(r.refund).toBeLessThan(0);
    expect(r.refund).toBe(-(r.determinedTax + r.localTax));
  });

  it("잘못된 인원은 거부", () => {
    expect(() => estimateYearend({ totalSalary: 0, prepaidTax: 0, dependents: 0, socialInsurance: 0 })).toThrow(RangeError);
  });
});
