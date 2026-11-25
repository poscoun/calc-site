import Link from "next/link";
import { calculators } from "@/lib/calculators";
import { guides } from "@/lib/guides";

export default function GuideFooter({ slug }: { slug: string }) {
  const self = guides.find((g) => g.slug === slug);
  const calc = calculators.find((c) => c.slug === self?.calculator);
  const others = guides.filter((g) => g.slug !== slug).slice(0, 3);
  return (
    <aside className="mt-12 space-y-6 border-t border-black/10 dark:border-white/15 pt-6">
      {calc && (
        <Link
          href={`/calculators/${calc.slug}/`}
          className="block rounded-lg border-2 border-black/20 dark:border-white/30 p-4 font-semibold"
        >
          내 숫자로 바로 계산해 보기: {calc.title} →
        </Link>
      )}
      {others.length > 0 && (
        <div>
          <p className="text-sm font-semibold">함께 읽으면 좋은 글</p>
          <ul className="mt-2 space-y-1 text-sm">
            {others.map((g) => (
              <li key={g.slug}>
                <Link href={`/guides/${g.slug}/`} className="underline underline-offset-2">{g.title}</Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className="text-xs opacity-60">
        예시 금액은 본 사이트 계산기로 계산한 추정치이며, 개인 상황에 따라 달라질 수 있습니다. 기준: 2026년 11월 현재 법령.
      </p>
    </aside>
  );
}
