import type { Metadata } from "next";
import Link from "next/link";
import { guidesFor } from "@/lib/guides";
import { estimateNetSalary } from "@/lib/payroll/net-salary";
import NetSalaryForm from "./NetSalaryForm";

export const metadata: Metadata = {
  title: "2026 연봉 실수령액 계산기 (4대보험·소득세 반영)",
  description: "연봉을 넣으면 국민연금 4.75%, 건강보험 3.595% 등 2026년 4대보험과 근로소득 간이세액표를 반영한 월 실수령액을 계산합니다.",
};

const TABLE_SALARIES = [2_400, 3_000, 3_500, 4_000, 4_500, 5_000, 6_000, 7_000, 8_000, 10_000];

export default function Page() {
  const rows = TABLE_SALARIES.map((s) => ({
    salary: s,
    r: estimateNetSalary({ annualSalary: s * 10_000, monthlyNonTaxable: 200_000, family: 1, children: 0 }),
  }));

  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm font-semibold text-accent">2026년 7월 이후 급여 기준</p>
        <h1 className="text-2xl font-bold sm:text-3xl">연봉 실수령액 계산기</h1>
        <p className="opacity-80">연봉에서 4대보험과 소득세를 떼고 매달 통장에 들어오는 금액을 계산합니다. 입력값은 이 기기 밖으로 전송되지 않습니다.</p>
      </header>
      <NetSalaryForm />

      <section className="space-y-3 pt-6">
        <h2 className="text-lg font-bold">연봉별 실수령액 표 (2026년)</h2>
        <p className="text-sm opacity-70">본인 1명, 식대 비과세 월 20만 원, 퇴직금 별도 기준.</p>
        <div className="overflow-x-auto rounded-xl border border-line">
          <table className="tabular w-full text-sm">
            <thead className="bg-accent-soft text-left">
              <tr>
                <th className="px-3 py-2">연봉</th>
                <th className="px-3 py-2 text-right">월 공제 합계</th>
                <th className="px-3 py-2 text-right">월 실수령액</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ salary, r }) => (
                <tr key={salary} className="border-t border-line">
                  <td className="px-3 py-2">{salary % 10_000 === 0 ? `${salary / 10_000}억 원` : `${salary.toLocaleString("ko-KR")}만 원`}</td>
                  <td className="px-3 py-2 text-right">{r.totalDeduction.toLocaleString("ko-KR")}원</td>
                  <td className="px-3 py-2 text-right font-semibold">{r.monthlyNet.toLocaleString("ko-KR")}원</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold">더 알아보기</h2>
        <ul className="space-y-2 text-sm">
          {guidesFor("net-salary").map((g) => (
            <li key={g.slug}>
              <Link href={`/guides/${g.slug}/`} className="underline underline-offset-2">{g.title}</Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-2 text-sm">
        <h2 className="text-lg font-bold">계산 기준</h2>
        <ul className="list-disc space-y-1 pl-5 opacity-80">
          <li>국민연금 4.75% (총 9.5%), 기준소득월액 41만~659만 원 (2026.7~2027.6)</li>
          <li>건강보험 3.595% (총 7.19%), 장기요양보험 건강보험료의 0.9448/7.19</li>
          <li>고용보험 0.9%</li>
          <li>소득세: 소득세법 시행령 별표 2 근로소득 간이세액표 (2026. 2. 27. 개정), 지방소득세는 소득세의 10%</li>
          <li>매달 같은 금액을 받는다고 가정합니다. 상여금·성과급이 있으면 그 달 공제액이 달라집니다.</li>
        </ul>
        <p className="opacity-80">
          매달 뗀 소득세는 연말정산에서 다시 계산됩니다.{" "}
          <Link href="/calculators/yearend-tax/" className="font-medium text-accent underline underline-offset-2">연말정산 환급 예상 계산기</Link>로 이어서 확인해 보세요.
        </p>
      </section>
    </article>
  );
}
