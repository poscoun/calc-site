import Link from "next/link";
import { calculators } from "@/lib/calculators";

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
    </div>
  );
}
