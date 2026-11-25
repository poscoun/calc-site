import { describe, expect, it } from "vitest";
import { estimateYearend, type YearendInput } from "./yearend";

const MAN = 10_000;
const base: YearendInput = {
  totalSalary: 5_000 * MAN,
  prepaidTax: 200 * MAN,
  persons: { basic: 1 },
  nationalPension: 225 * MAN,
  healthEmploymentInsurance: 0,
};

describe("estimateYearend", () => {
  it("저소득은 결정세액 0, 기납부세액 전액 환급", () => {
    const r = estimateYearend({ ...base, totalSalary: 1_500 * MAN, prepaidTax: 10 * MAN, nationalPension: 120 * MAN });
    expect(r.chosen.determinedTax).toBe(0);
    expect(r.refund).toBe(11 * MAN);
  });

  it("공제 지출이 없으면 표준세액공제 선택", () => {
    const r = estimateYearend(base);
    expect(r.chosen.method).toBe("standard");
    expect(r.chosen.credits.standard).toBe(13 * MAN);
  });

  it("의료비가 크면 항목공제 선택, 결정세액이 더 낮음", () => {
    const r = estimateYearend({ ...base, medical: { special: 500 * MAN } });
    expect(r.chosen.method).toBe("itemized");
    expect(r.chosen.determinedTax).toBeLessThan(r.alternative.determinedTax);
  });

  it("건강·고용보험료는 항목공제일 때만 과세표준에서 차감", () => {
    const r = estimateYearend({ ...base, healthEmploymentInsurance: 200 * MAN });
    const itemized = r.chosen.method === "itemized" ? r.chosen : r.alternative;
    const standard = r.chosen.method === "standard" ? r.chosen : r.alternative;
    expect(standard.taxBase - itemized.taxBase).toBe(200 * MAN);
  });

  it("자녀·연금저축 공제는 두 방식 모두 적용", () => {
    const r = estimateYearend({ ...base, taxCreditChildren: 2, pension: { savings: 600 * MAN } });
    expect(r.chosen.credits.child).toBe(55 * MAN);
    expect(r.alternative.credits.child).toBe(55 * MAN);
    expect(r.chosen.credits.pensionAccount).toBe(90 * MAN);
  });

  it("공제가 산출세액보다 커도 결정세액은 0 미만이 되지 않음", () => {
    const r = estimateYearend({ ...base, taxCreditChildren: 5, pension: { savings: 600 * MAN, irp: 300 * MAN } });
    expect(r.chosen.determinedTax).toBe(0);
  });

  it("잘못된 입력 거부", () => {
    expect(() => estimateYearend({ ...base, persons: { basic: 0 } })).toThrow(RangeError);
    expect(() => estimateYearend({ ...base, persons: { basic: 1, seniors: 2 } })).toThrow(RangeError);
    expect(() => estimateYearend({ ...base, prepaidTax: -1 })).toThrow(RangeError);
  });
});
