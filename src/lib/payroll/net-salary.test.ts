import { describe, expect, it } from "vitest";
import { childCredit, employeeInsurance, estimateNetSalary, NetSalaryInputError, taxTableAmount } from "./net-salary";

describe("taxTableAmount (간이세액표)", () => {
  it("법제처 별표 2 원문 값과 일치", () => {
    expect(taxTableAmount(3_000_000, 1)).toBe(74_350);
    expect(taxTableAmount(3_019_999, 2)).toBe(56_850);
    expect(taxTableAmount(5_000_000, 1)).toBe(335_470);
    expect(taxTableAmount(5_010_000, 2)).toBe(306_710);
    expect(taxTableAmount(10_000_000, 1)).toBe(1_507_400);
  });

  it("77만원 미만은 0원", () => {
    expect(taxTableAmount(769_999, 1)).toBe(0);
  });

  it("1,000만원 초과는 계산식 적용 (1,400만원 이하: +25,000 + 초과분×98%×35%)", () => {
    expect(taxTableAmount(12_000_000, 1)).toBe(1_507_400 + 25_000 + 686_000);
  });

  it("11명 초과 가족은 11명 세액에서 (10명−11명) 차이만큼 더 뺀다", () => {
    const t10 = taxTableAmount(5_000_000, 10);
    const t11 = taxTableAmount(5_000_000, 11);
    expect(taxTableAmount(5_000_000, 12)).toBe(t11 - (t10 - t11));
  });
});

describe("childCredit", () => {
  it("1명 20,830 / 2명 45,830 / 3명 79,160", () => {
    expect(childCredit(0)).toBe(0);
    expect(childCredit(1)).toBe(20_830);
    expect(childCredit(2)).toBe(45_830);
    expect(childCredit(3)).toBe(79_160);
  });
});

describe("employeeInsurance", () => {
  it("월 보수 3,133,333원", () => {
    expect(employeeInsurance(3_133_333)).toEqual({
      nationalPension: 148_810, // 3,133,000 × 4.75%
      health: 112_640, // × 3.595%
      longTermCare: 14_800, // 건강보험료 × 0.9448/7.19
      employment: 28_190, // × 0.9%
      total: 304_440,
    });
  });

  it("국민연금은 기준소득월액 상한 659만원에서 멈춘다", () => {
    expect(employeeInsurance(9_000_000).nationalPension).toBe(313_020); // 6,590,000 × 4.75%
  });

  it("월 보수 0원이면 보험료도 0원", () => {
    expect(employeeInsurance(0).total).toBe(0);
  });
});

describe("estimateNetSalary", () => {
  it("연봉 4,000만원, 식대 20만원, 본인 1명", () => {
    const r = estimateNetSalary({ annualSalary: 40_000_000, monthlyNonTaxable: 200_000, family: 1, children: 0 });
    expect(r.monthlyGross).toBe(3_333_333);
    expect(r.taxablePay).toBe(3_133_333);
    expect(r.incomeTax).toBe(84_620);
    expect(r.localIncomeTax).toBe(8_460);
    expect(r.totalDeduction).toBe(304_440 + 84_620 + 8_460);
    expect(r.monthlyNet).toBe(2_935_813);
    expect(r.annualNet).toBe(2_935_813 * 12);
  });

  it("자녀 공제는 같은 가족 수의 세액에서 뺀다", () => {
    const base = { annualSalary: 60_000_000, monthlyNonTaxable: 200_000, family: 4 };
    const none = estimateNetSalary({ ...base, children: 0 });
    const two = estimateNetSalary({ ...base, children: 2 });
    expect(none.incomeTax - two.incomeTax).toBe(45_830);
  });

  it("퇴직금 포함 연봉은 13으로 나눈다", () => {
    const r = estimateNetSalary({ annualSalary: 52_000_000, monthlyNonTaxable: 0, family: 1, children: 0, severanceIncluded: true });
    expect(r.monthlyGross).toBe(4_000_000);
  });

  it("원천징수 비율 80%는 소득세를 줄인다", () => {
    const base = { annualSalary: 40_000_000, monthlyNonTaxable: 200_000, family: 1, children: 0 };
    expect(estimateNetSalary({ ...base, taxRatio: 80 }).incomeTax).toBe(67_690); // 84,620 × 80% 10원 미만 버림
  });

  it("잘못된 입력은 거부", () => {
    expect(() => estimateNetSalary({ annualSalary: -1, monthlyNonTaxable: 0, family: 1, children: 0 })).toThrow(NetSalaryInputError);
    expect(() => estimateNetSalary({ annualSalary: 1, monthlyNonTaxable: 0, family: 1, children: 1 })).toThrow(NetSalaryInputError);
  });
});
