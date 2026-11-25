import type { Metadata } from "next";
import Link from "next/link";
import { guidesFor } from "@/lib/guides";
import WeeklyHolidayForm from "./WeeklyHolidayForm";

export const metadata: Metadata = {
  title: "주휴수당 계산기 (2026년 최저시급 10,320원 기준)",
  description: "시급과 주 근로시간만 넣으면 주휴수당, 주급, 월급 환산액을 계산합니다. 주 15시간 이상 알바·단시간 근로자 모두 적용.",
};

export default function Page() {
  const guides = guidesFor("weekly-holiday-pay");
  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm font-semibold text-accent">근로기준법 제55조 · 2026년 최저임금 기준</p>
        <h1 className="text-2xl font-bold sm:text-3xl">주휴수당 계산기</h1>
        <p className="opacity-80">주휴수당과 주급, 월급 환산액을 계산합니다. 입력값은 이 기기 밖으로 전송되지 않습니다.</p>
      </header>
      <WeeklyHolidayForm />

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
          <li>요건: 1주 소정근로시간 15시간 이상(4주 평균), 그 주 소정근로일 개근. 상시 5인 미만 사업장도 적용됩니다 (근로기준법 제55조, 제18조).</li>
          <li>주휴시간 = 1주 소정근로시간 ÷ 40 × 8. 주 40시간 이상이면 8시간으로 고정합니다.</li>
          <li>월 환산 = (주 소정근로시간 + 주휴시간) × 365일 ÷ 12개월 ÷ 7일(약 4.345주), 시간은 반올림. 주 40시간이면 209시간입니다.</li>
          <li>세금과 4대보험을 떼기 전 금액입니다. 연장·야간·휴일근로 가산수당은 포함하지 않습니다.</li>
        </ul>
        <p className="opacity-80">
          월급에서 떼는 금액이 궁금하다면{" "}
          <Link href="/calculators/net-salary/" className="font-medium text-accent underline underline-offset-2">연봉 실수령액 계산기</Link>를 이용해 보세요.
        </p>
      </section>
    </article>
  );
}
