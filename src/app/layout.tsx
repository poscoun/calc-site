import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  description: "연말정산, 연봉 실수령액, 퇴직금 등 생활 금융 계산기와 상황별 해설",
  alternates: { canonical: "./" },
  openGraph: { siteName: SITE_NAME, locale: "ko_KR", type: "website" },
  // 검색엔진 소유 확인 (공개 값)
  verification: {
    other: { "naver-site-verification": "124378ed62369d81d8ce884d9f302ea0376a9e02" },
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body className="antialiased min-h-screen flex flex-col">
        <header className="border-b border-black/10 dark:border-white/10">
          <nav className="mx-auto max-w-3xl px-4 py-3">
            <Link href="/" className="font-bold">{SITE_NAME}</Link>
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
