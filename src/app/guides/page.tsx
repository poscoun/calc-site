import type { Metadata } from "next";
import Link from "next/link";
import { calculators } from "@/lib/calculators";
import { guidesByTopic } from "@/lib/guide-topics";

export const metadata: Metadata = {
  title: "돈 계산 가이드",
  description: "연말정산, 월급 실수령액, 퇴직금, 실업급여, 주휴수당·연차, 대출 이자까지. 내 돈이 어떻게 계산되는지 실제 예시로 풀어 쓴 가이드 모음",
};

export default function GuidesIndex() {
  const groups = guidesByTopic();
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">돈 계산 가이드</h1>
        <p className="text-sm opacity-70">연말정산, 월급 실수령액, 퇴직금, 실업급여, 주휴수당·연차, 대출 이자까지. 내 돈이 어떻게 계산되는지 실제 예시로 풀어 씁니다.</p>
      </div>
      <nav aria-label="주제" className="flex flex-wrap gap-2">
        {groups.map((t) => (
          <a key={t.id} href={`#${t.id}`} className="rounded-full border border-line px-3 py-1.5 text-sm hover:border-accent">
            {t.name} <span className="opacity-60">{t.guides.length}</span>
          </a>
        ))}
      </nav>
      {groups.map((t) => (
        <section key={t.id} id={t.id} className="scroll-mt-20 space-y-2">
          <h2 className="text-lg font-bold">{t.name}</h2>
          <p className="flex flex-wrap gap-x-3 gap-y-1 text-sm">
            {t.calculators.map((slug) => {
              const c = calculators.find((x) => x.slug === slug);
              return c ? (
                <Link key={slug} href={`/calculators/${slug}/`} className="font-medium text-accent underline underline-offset-2">{c.title} →</Link>
              ) : null;
            })}
          </p>
          <ul className="divide-y divide-line">
            {t.guides.map((g) => (
              <li key={g.slug}>
                <Link href={`/guides/${g.slug}/`} className="block py-4">
                  <p className="font-semibold">{g.title}</p>
                  <p className="mt-1 text-sm opacity-70">{g.description}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
