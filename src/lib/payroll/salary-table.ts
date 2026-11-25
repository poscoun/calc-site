import { estimateNetSalary, type NetSalaryResult } from "./net-salary";

/** 연봉별 실수령액 표 행. 기준: 식대 비과세 월 20만 원, 퇴직금 별도, 원천징수 100%. */
export type SalaryTableRow = {
  /** 연봉 (만 원) */
  salaryMan: number;
  single: NetSalaryResult;
  /** 본인 + 배우자 + 8~20세 자녀 1명 (공제대상가족 3명) */
  family3: NetSalaryResult;
};

export function salaryTable(fromMan: number, toMan: number, stepMan: number): SalaryTableRow[] {
  if (![fromMan, toMan, stepMan].every((n) => Number.isInteger(n) && n > 0) || fromMan > toMan) {
    throw new RangeError("연봉 범위가 올바르지 않습니다.");
  }
  const rows: SalaryTableRow[] = [];
  for (let s = fromMan; s <= toMan; s += stepMan) {
    const base = { annualSalary: s * 10_000, monthlyNonTaxable: 200_000 };
    rows.push({
      salaryMan: s,
      single: estimateNetSalary({ ...base, family: 1, children: 0 }),
      family3: estimateNetSalary({ ...base, family: 3, children: 1 }),
    });
  }
  return rows;
}

export const manLabel = (man: number) =>
  man >= 10_000
    ? `${Math.floor(man / 10_000)}억${man % 10_000 ? ` ${(man % 10_000).toLocaleString("ko-KR")}만` : ""} 원`
    : `${man.toLocaleString("ko-KR")}만 원`;
