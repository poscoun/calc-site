import type { Metadata } from "next";
import Link from "next/link";
import { calculators } from "@/lib/calculators";

export const metadata: Metadata = {
  title: "페이지를 찾을 수 없습니다",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-semibold text-accent">404</p>
        <h1 className="text-2xl font-bold">페이지를 찾을 수 없습니다</h1>
        <p className="opacity-80">주소가 바뀌었거나 없는 페이지입니다. 아래 계산기에서 찾아보세요.</p>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2">
        {calculators
          .filter((c) => c.status === "live")
          .map((c) => (
            <li key={c.slug}>
              <Link href={`/calculators/${c.slug}/`} className="block rounded-xl border border-line p-4 font-semibold hover:border-accent">
                {c.title}
              </Link>
            </li>
          ))}
      </ul>
      <p className="text-sm">
        <Link href="/" className="underline underline-offset-2">홈으로</Link> ·{" "}
        <Link href="/guides/" className="underline underline-offset-2">돈 계산 가이드</Link>
      </p>
    </div>
  );
}
