import { describe, expect, it } from "vitest";
import { manLabel, salaryTable } from "./salary-table";

describe("연봉별 실수령액 표 (net-salary-table-2026 해설글 수치)", () => {
  const rows = salaryTable(2_000, 10_000, 100);
  const at = (man: number) => rows.find((r) => r.salaryMan === man)!;

  it("2천만~1억, 100만 원 단위 81행", () => {
    expect(rows).toHaveLength(81);
    expect(rows[0].salaryMan).toBe(2_000);
    expect(rows.at(-1)!.salaryMan).toBe(10_000);
  });

  it("주요 연봉 월·연 실수령액과 공제 비율", () => {
    const got = [3_000, 4_000, 5_000, 7_000, 10_000].map((s) => {
      const r = at(s).single;
      return [r.monthlyNet, Math.round(r.annualNet / 10_000), Math.round((r.totalDeduction / r.monthlyGross) * 1000) / 10];
    });
    expect(got).toEqual([
      [2_244_440, 2_693, 10.2],
      [2_935_813, 3_523, 11.9],
      [3_571_586, 4_286, 14.3],
      [4_821_303, 5_786, 17.3],
      [6_530_923, 7_837, 21.6],
    ]);
  });

  it("본문 비교 수치", () => {
    expect(at(6_000).single.monthlyNet - at(5_000).single.monthlyNet).toBe(623_824);
    expect(at(8_100).single.insurance.nationalPension).toBeLessThan(313_020);
    expect(at(8_200).single.insurance.nationalPension).toBe(313_020);
    expect(at(8_500).single.insurance.nationalPension).toBe(313_020);
    expect(at(10_000).single.insurance.nationalPension).toBe(313_020);
    expect(at(5_000).family3.monthlyNet).toBe(3_689_016);
  });

  it("연봉 표기와 잘못된 범위", () => {
    expect([manLabel(3_500), manLabel(10_000), manLabel(12_500)]).toEqual(["3,500만 원", "1억 원", "1억 2,500만 원"]);
    expect(() => salaryTable(5_000, 4_000, 100)).toThrow(RangeError);
  });
});
