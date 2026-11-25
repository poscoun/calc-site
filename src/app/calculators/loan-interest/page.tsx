import type { Metadata } from "next";
import Link from "next/link";
import { guidesFor } from "@/lib/guides";
import LoanForm from "./LoanForm";

export const metadata: Metadata = {
  title: "대출 이자 계산기 (원리금균등·원금균등·만기일시 비교)",
  description: "대출금, 금리, 기간을 넣으면 상환 방식 3가지의 월 상환액과 총 이자를 한 번에 비교하고 연도별 상환 스케줄을 보여 줍니다.",
};

export default function Page() {
  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm font-semibold text-accent">주택담보·신용·전세대출 공통</p>
        <h1 className="text-2xl font-bold sm:text-3xl">대출 이자 계산기</h1>
        <p className="opacity-80">상환 방식 3가지의 월 상환액과 총 이자를 한 번에 비교합니다. 입력값은 이 기기 밖으로 전송되지 않습니다.</p>
      </header>
      <LoanForm />

      <section className="space-y-2">
        <h2 className="text-lg font-bold">더 알아보기</h2>
        <ul className="space-y-2 text-sm">
          {guidesFor("loan-interest").map((g) => (
            <li key={g.slug}>
              <Link href={`/guides/${g.slug}/`} className="underline underline-offset-2">{g.title}</Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-2 text-sm">
        <h2 className="text-lg font-bold">계산 기준</h2>
        <ul className="list-disc space-y-1 pl-5 opacity-80">
          <li>월 이자 = 남은 원금 × 연 금리 ÷ 12 (원 미만 버림). 고정금리로 가정합니다.</li>
          <li>원리금균등: 매달 같은 금액을 내고, 마지막 회차에서 원 단위 차액을 정산합니다.</li>
          <li>원금균등: 원금을 매달 같은 금액씩 갚고, 이자는 남은 원금에 따라 줄어듭니다.</li>
          <li>만기일시: 매달 이자만 내고 마지막 달에 원금 전체를 갚습니다.</li>
          <li>은행마다 일할 계산·원 단위 처리 방식이 달라 실제 금액과 몇 원~몇백 원 차이가 날 수 있습니다. 중도상환수수료·변동금리는 반영하지 않습니다.</li>
        </ul>
      </section>
    </article>
  );
}
