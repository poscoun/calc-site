import type { Metadata } from "next";
import Link from "next/link";
import ContactEmail from "@/components/ContactEmail";

export const metadata: Metadata = {
  title: "문의하기",
  description: "돈돈 계산기 계산 오류 제보, 계산기 요청, 기타 문의 안내입니다.",
};

export default function Page() {
  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold sm:text-3xl">문의하기</h1>
        <p className="opacity-80">계산 결과가 실제와 다르거나, 있었으면 하는 계산기가 있다면 알려 주세요.</p>
      </header>

      <section className="rounded-xl border-2 border-accent bg-accent-soft p-5">
        <p className="text-sm font-medium opacity-80">이메일</p>
        <p className="mt-1 text-lg">
          <ContactEmail />
        </p>
        <p className="mt-2 text-xs opacity-70">보통 영업일 기준 3일 안에 답변드립니다.</p>
      </section>

      <section className="space-y-2 text-sm">
        <h2 className="text-lg font-bold">계산 오류를 알려 주실 때</h2>
        <ul className="list-disc space-y-1 pl-5 opacity-80">
          <li>어느 계산기인지와 입력한 값</li>
          <li>사이트 계산 결과와 실제(급여명세서, 원천징수영수증, 대출 상환표 등) 금액</li>
        </ul>
        <p className="opacity-80">
          주민등록번호, 계좌번호 같은 민감한 정보는 보내지 마세요. 보내 주신 이메일은{" "}
          <Link href="/privacy/" className="underline underline-offset-2">개인정보처리방침</Link>에 따라 답변 후 1년 뒤 삭제합니다.
        </p>
      </section>
    </article>
  );
}
