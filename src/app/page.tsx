import Link from "next/link";
import { calculators } from "@/lib/calculators";
import { guides } from "@/lib/guides";

export default function Home() {
  const live = calculators.filter((c) => c.status === "live");
  const soon = calculators.filter((c) => c.status === "soon");
  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <h1 className="text-2xl font-bold leading-snug sm:text-3xl">
          내 돈 계산, <span className="text-accent">숫자 몇 개</span>로 끝내세요
        </h1>
        <p className="opacity-80">연말정산부터 연봉 실수령액, 퇴직금, 대출 이자까지. 최신 법령 기준으로 계산하고, 왜 그 금액이 나오는지 풀어서 보여 드립니다.</p>
      </section>

      <section className="space-y-3">
        {live.map((c) => (
          <Link
            key={c.slug}
            href={`/calculators/${c.slug}/`}
            className="group block rounded-xl border-2 border-accent bg-accent-soft p-5 transition-shadow hover:shadow-md"
          >
            <p className="text-lg font-bold">{c.title}</p>
            <p className="mt-1 text-sm opacity-80">{c.description}</p>
            <p className="mt-3 text-sm font-semibold text-accent">지금 계산하기 →</p>
          </Link>
        ))}
        <ul className="grid gap-3 sm:grid-cols-3">
          {soon.map((c) => (
            <li key={c.slug} className="rounded-xl border border-dashed border-line p-4">
              <p className="font-semibold opacity-80">{c.title}</p>
              <p className="mt-1 text-xs opacity-60">준비 중</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-bold">돈 계산 가이드</h2>
          <Link href="/guides/" className="text-sm underline underline-offset-2 opacity-80">전체 보기</Link>
        </div>
        <ul className="divide-y divide-line">
          {guides.slice(0, 5).map((g) => (
            <li key={g.slug}>
              <Link href={`/guides/${g.slug}/`} className="block py-3">
                <p className="font-semibold">{g.title}</p>
                <p className="mt-1 text-sm opacity-70">{g.description}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
