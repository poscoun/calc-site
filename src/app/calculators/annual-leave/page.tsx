import type { Metadata } from "next";
import { shareMeta } from "@/lib/site";
import Link from "next/link";
import { guidesFor } from "@/lib/guides";
import AnnualLeaveForm from "./AnnualLeaveForm";

export const metadata: Metadata = {
  ...shareMeta("annual-leave"),
  title: "연차 계산기 (발생일수·연차수당)",
  description: "입사일만 넣으면 올해 연차가 며칠인지, 다음 연차는 언제 생기는지 계산합니다. 남은 연차를 돈으로 받는 연차수당도 함께 계산합니다.",
};

export default function Page() {
  const guides = guidesFor("annual-leave");
  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm font-semibold text-accent">근로기준법 제60조 · 입사일 기준</p>
        <h1 className="text-2xl font-bold sm:text-3xl">연차 계산기</h1>
        <p className="opacity-80">연차 발생일수와 남은 연차의 수당을 계산합니다. 입력값은 이 기기 밖으로 전송되지 않습니다.</p>
      </header>
      <AnnualLeaveForm />

      {guides.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-lg font-bold">더 알아보기</h2>
          <ul className="space-y-2 text-sm">
            {guides.map((g) => (
              <li key={g.slug}><Link href={`/guides/${g.slug}/`} className="underline underline-offset-2">{g.title}</Link></li>
            ))}
          </ul>
        </section>
      )}

      <section className="space-y-2 text-sm">
        <h2 className="text-lg font-bold">계산 기준</h2>
        <ul className="list-disc space-y-1 pl-5 opacity-80">
          <li>입사 1년 미만: 1개월 개근마다 1일, 최대 11일 (근로기준법 제60조 제2항).</li>
          <li>1년 이상, 출근율 80% 이상: 15일. 3년 이상 근속하면 최초 1년을 넘는 매 2년마다 1일 가산, 최대 25일 (제60조 제1항·제4항).</li>
          <li>상시 5인 미만 사업장과 4주 평균 주 15시간 미만 근로자는 법정 연차가 없습니다. 단시간 근로자는 근로시간에 비례해 시간 단위로 계산되며, 이 계산기는 주 40시간 기준입니다.</li>
          <li>연차수당 = 남은 연차 × 1일 통상임금(월 통상임금 ÷ 209시간 × 8시간). 회사가 법에 맞게 연차 사용을 촉진했다면 수당이 없을 수 있습니다 (제61조).</li>
        </ul>
        <p className="opacity-80">
          퇴사를 앞두고 있다면{" "}
          <Link href="/calculators/severance-pay/" className="font-medium text-accent underline underline-offset-2">퇴직금 계산기</Link>도 확인해 보세요. 연차수당은 퇴직금 평균임금에도 들어갑니다.
        </p>
      </section>
    </article>
  );
}
