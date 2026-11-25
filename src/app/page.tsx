import Link from "next/link";
import { calculators } from "@/lib/calculators";
import { guides } from "@/lib/guides";

export default function Home() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">생활 금융 계산기</h1>
      <ul className="grid gap-3 sm:grid-cols-2">
        {calculators.map((c) => (
          <li key={c.slug} className="rounded-lg border border-black/10 dark:border-white/15 p-4">
            {c.status === "live" ? (
              <Link href={`/calculators/${c.slug}/`} className="font-semibold underline">{c.title}</Link>
            ) : (
              <span className="font-semibold">{c.title} <span className="text-xs opacity-60">준비 중</span></span>
            )}
            <p className="mt-1 text-sm opacity-80">{c.description}</p>
          </li>
        ))}
      </ul>
      <h2 className="pt-4 text-xl font-bold">절세 가이드</h2>
      <ul className="space-y-3">
        {guides.slice(0, 5).map((g) => (
          <li key={g.slug}>
            <Link href={`/guides/${g.slug}/`} className="font-semibold underline underline-offset-2">{g.title}</Link>
            <p className="mt-1 text-sm opacity-80">{g.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
