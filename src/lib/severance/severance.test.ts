import { describe, expect, it } from "vitest";
import {
  convertedPayDeduction,
  estimateSeverance,
  retirementTax,
  SeveranceInputError,
  serviceYears,
  serviceYearsDeduction,
} from "./severance";

const d = (s: string) => Date.parse(`${s}T00:00:00Z`);

describe("근속연수", () => {
  it("1년 미만 기간은 올림", () => {
    expect(serviceYears(d("2021-01-01"), d("2026-01-01"))).toBe(5);
    expect(serviceYears(d("2021-01-01"), d("2026-01-02"))).toBe(6);
    expect(serviceYears(d("2025-03-01"), d("2025-12-01"))).toBe(1);
  });

  it("근속연수공제 (제48조)", () => {
    expect(serviceYearsDeduction(3)).toBe(3_000_000);
    expect(serviceYearsDeduction(10)).toBe(15_000_000);
    expect(serviceYearsDeduction(15)).toBe(27_500_000);
    expect(serviceYearsDeduction(30)).toBe(70_000_000);
  });

  it("환산급여공제 구간 경계가 이어진다", () => {
    expect(convertedPayDeduction(8_000_000)).toBe(8_000_000);
    expect(convertedPayDeduction(70_000_000)).toBe(45_200_000);
    expect(convertedPayDeduction(100_000_000)).toBe(61_700_000);
    expect(convertedPayDeduction(300_000_000)).toBe(151_700_000);
  });
});

describe("retirementTax (연분연승)", () => {
  it("퇴직금 1억, 근속 10년", () => {
    expect(retirementTax(100_000_000, 10)).toEqual({
      years: 10,
      serviceDeduction: 15_000_000,
      convertedPay: 102_000_000,
      convertedDeduction: 62_600_000,
      taxBase: 39_400_000,
      convertedTax: 4_650_000,
      incomeTax: 3_875_000,
      localTax: 387_500,
    });
  });

  it("퇴직금 5,000만, 근속 10년 → 680,000원", () => {
    expect(retirementTax(50_000_000, 10).incomeTax).toBe(680_000);
  });

  it("퇴직금 2억, 근속 10년 → 17,875,000원", () => {
    expect(retirementTax(200_000_000, 10).incomeTax).toBe(17_875_000);
  });

  it("근속연수공제보다 적으면 세금 0원", () => {
    expect(retirementTax(4_000_000, 5).incomeTax).toBe(0);
  });
});

describe("estimateSeverance", () => {
  const base = { wages3m: 12_000_000, annualBonus: 0, annualLeavePay: 0 };

  it("5년 근무, 3개월 임금 1,200만 원", () => {
    const r = estimateSeverance({ ...base, startDate: "2021-01-01", lastWorkDate: "2025-12-31" });
    expect(r.serviceDays).toBe(1826);
    expect(r.periodDays).toBe(92); // 2025-10-01 ~ 2025-12-31
    expect(r.dailyAverageWage).toBe(130_434.78);
    expect(r.severance).toBe(19_575_938);
    expect(r.tax?.years).toBe(5);
    expect(r.net).toBe(r.severance - r.tax!.incomeTax - r.tax!.localTax);
  });

  it("상여금·연차수당은 3/12만 평균임금에 넣는다", () => {
    const a = estimateSeverance({ ...base, startDate: "2021-01-01", lastWorkDate: "2025-12-31", annualBonus: 4_000_000 });
    const b = estimateSeverance({ ...base, wages3m: 13_000_000, startDate: "2021-01-01", lastWorkDate: "2025-12-31" });
    expect(a.severance).toBe(b.severance);
  });

  it("1년 미만은 퇴직금 없음", () => {
    const r = estimateSeverance({ ...base, startDate: "2025-01-02", lastWorkDate: "2025-12-31" });
    expect(r.serviceDays).toBe(364);
    expect(r.eligible).toBe(false);
    expect(r.severance).toBe(0);
    expect(r.tax).toBeNull();
  });

  it("말일 퇴직: 3개월 기간은 달력 기준", () => {
    const r = estimateSeverance({ ...base, startDate: "2020-03-01", lastWorkDate: "2026-05-30" });
    expect(r.periodDays).toBe(92); // 2026-02-28 ~ 2026-05-30
  });

  it("잘못된 입력은 거부", () => {
    expect(() => estimateSeverance({ ...base, startDate: "2026-02-30", lastWorkDate: "2026-12-31" })).toThrow(SeveranceInputError);
    expect(() => estimateSeverance({ ...base, startDate: "2026-05-01", lastWorkDate: "2026-04-30" })).toThrow(SeveranceInputError);
    expect(() => estimateSeverance({ ...base, wages3m: -1, startDate: "2021-01-01", lastWorkDate: "2025-12-31" })).toThrow(SeveranceInputError);
  });

  it("해설글(severance-pay-calculation) 예시 수치", () => {
    const w = { ...base, lastWorkDate: "2026-11-30" };
    const total = (r: ReturnType<typeof estimateSeverance>) => r.tax!.incomeTax + r.tax!.localTax;
    const y5 = estimateSeverance({ ...w, startDate: "2021-12-01" });
    expect([y5.severance, total(y5), y5.net]).toEqual([19_791_058, 302_483, 19_488_575]);
    const y10 = estimateSeverance({ ...w, startDate: "2016-12-01" });
    expect([y10.severance, total(y10), y10.net]).toEqual([39_582_116, 472_967, 39_109_149]);
    const y20 = estimateSeverance({ ...w, startDate: "2006-12-01" });
    expect([y20.severance, total(y20), y20.net]).toEqual([79_175_071, 682_221, 78_492_850]);
    expect(estimateSeverance({ ...w, startDate: "2016-12-01", annualLeavePay: 2_000_000 }).severance).toBe(41_231_371);
    expect(estimateSeverance({ ...w, startDate: "2016-12-01", annualBonus: 8_000_000 }).severance).toBe(46_179_135);
    expect(estimateSeverance({ ...base, startDate: "2021-03-01", lastWorkDate: "2026-02-28" }).severance).toBe(20_010_958);
    const plus1 = estimateSeverance({ ...w, startDate: "2021-11-30" });
    expect([plus1.serviceDays, plus1.tax!.years, total(plus1)]).toEqual([1827, 6, 232_369]);
  });
});
