import type { Metadata } from "next";
import Link from "next/link";
import { guidesFor } from "@/lib/guides";
import YearendForm from "./YearendForm";

export const metadata: Metadata = {
  title: "연말정산 환급 예상 계산기 (2026년 귀속)",
  description: "총급여와 기납부세액으로 2026년 귀속 연말정산 환급액을 미리 계산합니다.",
};

export default function Page() {
  return (
    <article className="space-y-6">
      <h1 className="text-2xl font-bold">연말정산 환급 예상 계산기 (2026년 귀속)</h1>
      <p className="text-sm opacity-80">
        주택자금, 정치자금·고향사랑 기부금, 중소기업 취업자 감면은 아직 반영하지 않습니다. 기준: 2026년 11월 현재 법령.
      </p>
      <YearendForm />
      <section className="space-y-2 pt-6">
        <h2 className="text-lg font-bold">환급을 늘리는 방법</h2>
        <ul className="space-y-1 text-sm">
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
