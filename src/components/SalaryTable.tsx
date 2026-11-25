import { manLabel, salaryTable } from "@/lib/payroll/salary-table";

const n = (v: number) => v.toLocaleString("ko-KR");
const th = "px-3 py-2 whitespace-nowrap";
const td = "px-3 py-1.5 text-right whitespace-nowrap";

/** 100만 원 단위 연봉별 월 실수령액 (1인 / 3인 가구) */
export function SalaryNetTable({ from = 2_000, to = 10_000, step = 100 }: { from?: number; to?: number; step?: number }) {
  const rows = salaryTable(from, to, step);
  return (
    <div className="not-prose my-4 overflow-x-auto rounded-xl border border-line">
      <table className="tabular w-full text-sm">
        <thead className="bg-accent-soft text-left">
          <tr>
            <th className={th}>연봉</th>
            <th className={`${th} text-right`}>월 실수령액<br /><span className="text-xs font-normal opacity-70">본인 1명</span></th>
            <th className={`${th} text-right`}>월 공제 합계</th>
            <th className={`${th} text-right`}>월 실수령액<br /><span className="text-xs font-normal opacity-70">3명·자녀 1</span></th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ salaryMan, single, family3 }) => (
            <tr key={salaryMan} id={`s${salaryMan}`} className={`border-t border-line ${salaryMan % 1_000 === 0 ? "bg-accent-soft/40 font-semibold" : ""}`}>
              <td className="whitespace-nowrap px-3 py-1.5">{manLabel(salaryMan)}</td>
              <td className={`${td} font-semibold`}>{n(single.monthlyNet)}원</td>
              <td className={td}>{n(single.totalDeduction)}원</td>
              <td className={td}>{n(family3.monthlyNet)}원</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** 1,000만 원 단위 공제 항목별 내역 (본인 1명) */
export function SalaryBreakdownTable({ from = 3_000, to = 10_000, step = 1_000 }: { from?: number; to?: number; step?: number }) {
  const rows = salaryTable(from, to, step);
  return (
    <div className="not-prose my-4 overflow-x-auto rounded-xl border border-line">
      <table className="tabular w-full text-sm">
        <thead className="bg-accent-soft text-left">
          <tr>
            <th className={th}>연봉</th>
            <th className={`${th} text-right`}>세전 월급</th>
            <th className={`${th} text-right`}>국민연금</th>
            <th className={`${th} text-right`}>건강·요양</th>
            <th className={`${th} text-right`}>고용보험</th>
            <th className={`${th} text-right`}>소득세·지방세</th>
            <th className={`${th} text-right`}>실수령액</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ salaryMan, single: r }) => (
            <tr key={salaryMan} className="border-t border-line">
              <td className="whitespace-nowrap px-3 py-1.5">{manLabel(salaryMan)}</td>
              <td className={td}>{n(r.monthlyGross)}</td>
              <td className={td}>{n(r.insurance.nationalPension)}</td>
              <td className={td}>{n(r.insurance.health + r.insurance.longTermCare)}</td>
              <td className={td}>{n(r.insurance.employment)}</td>
              <td className={td}>{n(r.incomeTax + r.localIncomeTax)}</td>
              <td className={`${td} font-semibold`}>{n(r.monthlyNet)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
