import type { Metadata } from "next";
import Link from "next/link";
import { guidesFor } from "@/lib/guides";
import SeveranceForm from "./SeveranceForm";

export const metadata: Metadata = {
  title: "퇴직금 계산기 (평균임금·퇴직소득세 자동 계산)",
  description: "입사일, 마지막 근무일, 최근 3개월 급여만 넣으면 법정 퇴직금과 퇴직소득세, 세후 수령액을 계산합니다.",
};

export default function Page() {
  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm font-semibold text-accent">근로자퇴직급여 보장법 · 2026년 세법 기준</p>
        <h1 className="text-2xl font-bold sm:text-3xl">퇴직금 계산기</h1>
        <p className="opacity-80">평균임금으로 법정 퇴직금을 계산하고, 퇴직소득세를 뺀 실제 수령액까지 보여 드립니다. 입력값은 이 기기 밖으로 전송되지 않습니다.</p>
      </header>
      <SeveranceForm />

      <section className="space-y-2">
        <h2 className="text-lg font-bold">더 알아보기</h2>
        <ul className="space-y-2 text-sm">
          {guidesFor("severance-pay").map((g) => (
            <li key={g.slug}>
              <Link href={`/guides/${g.slug}/`} className="underline underline-offset-2">{g.title}</Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-2 text-sm">
        <h2 className="text-lg font-bold">계산 기준</h2>
        <ul className="list-disc space-y-1 pl-5 opacity-80">
          <li>퇴직금 = 1일 평균임금 × 30일 × 재직일수 ÷ 365 (근로자퇴직급여 보장법 제8조)</li>
          <li>1일 평균임금 = 퇴직 전 3개월 임금 총액 ÷ 그 기간의 총일수. 상여금·연차수당은 1년치의 3/12를 더합니다 (근로기준법 제2조).</li>
          <li>퇴직소득세: 근속연수공제 → 환산급여(×12÷근속연수) → 환산급여공제 → 기본세율 → ×근속연수÷12 (소득세법 제48조·제55조). 근속연수 1년 미만은 1년으로 올림.</li>
          <li>평균임금이 통상임금보다 적으면 통상임금으로 계산해야 하며, 이 경우는 반영하지 않습니다. 퇴직연금(DC형)은 운용 결과에 따라 금액이 다릅니다.</li>
        </ul>
        <p className="opacity-80">
          퇴직 후 받는 월급이 궁금하다면{" "}
          <Link href="/calculators/net-salary/" className="font-medium text-accent underline underline-offset-2">연봉 실수령액 계산기</Link>도 확인해 보세요.
        </p>
      </section>
    </article>
  );
}
