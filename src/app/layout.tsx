import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { calculators } from "@/lib/calculators";
import { ADSENSE_CLIENT, SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  description: "연말정산 환급, 연봉 실수령액, 퇴직금, 대출 이자를 최신 법령 기준으로 계산하고 계산 과정을 풀어 주는 생활 금융 계산기",
  alternates: { canonical: "./" },
  openGraph: { siteName: SITE_NAME, locale: "ko_KR", type: "website" },
  // 검색엔진 소유 확인 (공개 값)
  verification: {
    other: { "naver-site-verification": "124378ed62369d81d8ce884d9f302ea0376a9e02" },
  },
  // 애드센스 사이트 소유 확인
  other: { "google-adsense-account": ADSENSE_CLIENT },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <head>
        {/* 애드센스: 정적 HTML <head>에 있어야 사이트 확인 크롤러가 읽는다 */}
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
          crossOrigin="anonymous"
        />
      </head>
      <body className="antialiased min-h-screen flex flex-col">
        <header className="sticky top-0 z-20 border-b border-line bg-background/95 backdrop-blur">
          <nav className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
            <Link href="/" className="flex items-center gap-2 font-bold"><span aria-hidden className="grid h-6 w-6 place-items-center rounded-md bg-accent text-xs text-white dark:text-black">₩</span>{SITE_NAME}</Link>
            <Link href="/guides/" className="rounded-md px-2 py-1 text-sm hover:bg-muted">돈 계산 가이드</Link>
          </nav>
        </header>
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">{children}</main>
        <footer className="border-t border-line text-xs">
          <div className="mx-auto max-w-3xl space-y-3 px-4 py-6">
            <nav aria-label="계산기 목록" className="flex flex-wrap gap-x-4 gap-y-1 opacity-80">
              {calculators
                .filter((c) => c.status === "live")
                .map((c) => (
                  <Link key={c.slug} href={`/calculators/${c.slug}/`} className="hover:underline">{c.title}</Link>
                ))}
              <Link href="/guides/" className="hover:underline">돈 계산 가이드</Link>
            </nav>
            <p className="opacity-60">
              계산 결과는 공개된 법령과 고시를 바탕으로 한 추정치이며 세무·법률 자문이 아닙니다. 실제 금액은 회사, 금융기관, 국세청 안내로 확인하세요.
            </p>
            <nav aria-label="사이트 정보" className="flex flex-wrap gap-x-4 gap-y-1 opacity-80">
              <Link href="/about/" className="hover:underline">사이트 소개</Link>
              <Link href="/privacy/" className="font-semibold hover:underline">개인정보처리방침</Link>
              <Link href="/contact/" className="hover:underline">문의하기</Link>
            </nav>
            <p className="opacity-60">© 2026 {SITE_NAME}</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
