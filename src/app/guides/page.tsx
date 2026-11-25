import type { Metadata } from "next";
import Link from "next/link";
import { guides } from "@/lib/guides";

export const metadata: Metadata = {
  title: "절세 가이드",
  description: "연말정산과 생활 금융 계산을 실제 예시로 풀어 쓴 가이드 모음",
};

export default function GuidesIndex() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">절세 가이드</h1>
      <ul className="divide-y divide-line">
        {guides.map((g) => (
          <li key={g.slug}>
            <Link href={`/guides/${g.slug}/`} className="block py-4">
              <p className="font-semibold">{g.title}</p>
              <p className="mt-1 text-sm opacity-70">{g.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
