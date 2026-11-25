import type { Metadata } from "next";
import YearendForm from "./YearendForm";

export const metadata: Metadata = {
  title: "연말정산 환급 예상 계산기 (2026년 귀속)",
  description: "총급여와 기납부세액으로 2026년 귀속 연말정산 환급액을 미리 계산합니다.",
  // 공제 항목이 다 들어가기 전까지 검색 노출 막기
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <article className="space-y-6">
      <h1 className="text-2xl font-bold">연말정산 환급 예상 계산기 (2026년 귀속)</h1>
      <p className="text-sm opacity-80">
        미리보기 버전입니다. 주택자금, 정치자금·고향사랑 기부금, 중소기업 취업자 감면 등은 아직 반영하지 않습니다.
      </p>
      <YearendForm />
    </article>
  );
}
