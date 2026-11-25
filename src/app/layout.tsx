import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "생활 계산기", template: "%s | 생활 계산기" },
  description: "연말정산, 연봉 실수령액, 퇴직금 등 생활 금융 계산기와 상황별 해설",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body className="antialiased min-h-screen flex flex-col">
        <header className="border-b border-black/10 dark:border-white/10">
          <nav className="mx-auto max-w-3xl px-4 py-3">
            <Link href="/" className="font-bold">생활 계산기</Link>
          </nav>
        </header>
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">{children}</main>
        <footer className="border-t border-black/10 dark:border-white/10 text-xs opacity-70">
          <p className="mx-auto max-w-3xl px-4 py-4">
            본 계산 결과는 참고용이며 세무 자문이 아닙니다. 정확한 금액은 국세청 홈택스에서 확인하세요.
          </p>
        </footer>
      </body>
    </html>
  );
}
