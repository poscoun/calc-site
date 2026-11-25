import type { Metadata } from "next";
import { shareMeta } from "@/lib/site";
import Link from "next/link";
import { guidesFor } from "@/lib/guides";
import UnemploymentForm from "./UnemploymentForm";

export const metadata: Metadata = {
  ...shareMeta("unemployment-benefit"),
  title: "실업급여 계산기 (2026년 상한액 68,100원 반영)",
  description: "최근 3개월 급여, 나이, 고용보험 가입 기간만 넣으면 2026년 기준 실업급여(구직급여) 하루 금액과 받는 일수, 총액을 계산합니다.",
};

export default function Page() {
  const guides = guidesFor("unemployment-benefit");
  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm font-semibold text-accent">고용보험법 · 2026년 이직자 기준</p>
        <h1 className="text-2xl font-bold sm:text-3xl">실업급여 계산기</h1>
        <p className="opacity-80">구직급여 하루 금액, 받을 수 있는 일수, 총액을 계산합니다. 입력값은 이 기기 밖으로 전송되지 않습니다.</p>
      </header>
      <UnemploymentForm />

      {guides.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-lg font-bold">더 알아보기</h2>
          <ul className="space-y-2 text-sm">
            {guides.map((g) => (
              <li key={g.slug}>
                <Link href={`/guides/${g.slug}/`} className="underline underline-offset-2">{g.title}</Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="space-y-2 text-sm">
        <h2 className="text-lg font-bold">계산 기준</h2>
        <ul className="list-disc space-y-1 pl-5 opacity-80">
          <li>1일 구직급여액 = 이직 전 1일 평균임금 × 60%. 평균임금은 이직 전 3개월 임금 총액 ÷ 그 기간 총일수입니다 (근로기준법 제2조).</li>
          <li>상한액 하루 68,100원 (산정 기초 임금일액 상한 113,500원 × 60%, 2026년 1월 1일 이후 이직자). 고용노동부 2025년 12월 16일 시행령 개정 의결.</li>
          <li>하한액 = 최저임금 10,320원 × 80% × 1일 소정근로시간. 8시간이면 하루 66,048원 (고용보험법 제46조).</li>
          <li>소정급여일수: 나이(50세 미만 / 50세 이상·장애인)와 피보험기간에 따라 120~270일 (고용보험법 별표 1).</li>
          <li>수급 요건: 이직 전 18개월 동안 피보험 단위기간 180일 이상, 비자발적 이직, 적극적 재취업 활동. 자격 여부는 이 계산기가 판단하지 않습니다.</li>
        </ul>
        <p className="opacity-80">
          퇴직금도 함께 확인하려면{" "}
          <Link href="/calculators/severance-pay/" className="font-medium text-accent underline underline-offset-2">퇴직금 계산기</Link>를 이용해 보세요.
        </p>
      </section>
    </article>
  );
}
