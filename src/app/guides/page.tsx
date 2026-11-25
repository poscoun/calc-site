import type { Metadata } from "next";
import Link from "next/link";
import { guides } from "@/lib/guides";

export const metadata: Metadata = {
  title: "돈 계산 가이드",
  description: "연말정산, 월급 실수령액, 퇴직금, 실업급여, 대출 이자까지. 내 돈이 어떻게 계산되는지 실제 예시로 풀어 쓴 가이드 모음",
};

export default function GuidesIndex() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">돈 계산 가이드</h1>
        <p className="text-sm opacity-70">연말정산, 월급 실수령액, 퇴직금, 실업급여, 대출 이자까지. 내 돈이 어떻게 계산되는지 실제 예시로 풀어 씁니다.</p>
      </div>
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
