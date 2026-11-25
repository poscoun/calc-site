import type { Metadata } from "next";
import { shareMeta } from "@/lib/site";
import Link from "next/link";
import { guidesFor } from "@/lib/guides";
import YearendForm from "./YearendForm";

export const metadata: Metadata = {
  ...shareMeta("yearend-tax"),
  title: "연말정산 환급 예상 계산기 (2026년 귀속)",
  description: "총급여와 기납부세액으로 2026년 귀속 연말정산 환급액을 미리 계산합니다.",
};

export default function Page() {
  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm font-semibold text-accent">2026년 귀속 · 2027년 1월 정산</p>
        <h1 className="text-2xl font-bold sm:text-3xl">연말정산 환급 예상 계산기</h1>
        <p className="opacity-80">원천징수영수증 숫자 몇 개만 넣으면 13월의 월급이 얼마인지 바로 계산합니다. 입력값은 이 기기 밖으로 전송되지 않습니다.</p>
      </header>
      <p className="text-xs opacity-60">
        주택자금, 정치자금·고향사랑 기부금, 중소기업 취업자 감면은 아직 반영하지 않습니다. 기준: 2026년 11월 현재 법령.
      </p>
      <YearendForm />
      <section className="space-y-2 pt-6">
        <h2 className="text-lg font-bold">환급을 늘리는 방법</h2>
        <ul className="space-y-2 text-sm">
          {guidesFor("yearend-tax").map((g) => (
            <li key={g.slug}>
              <Link href={`/guides/${g.slug}/`} className="underline underline-offset-2">{g.title}</Link>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
