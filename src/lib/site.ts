export const SITE_URL = "https://dondoncalc.com";
export const SITE_NAME = "돈돈 계산기";
/** 공개 문의 이메일. 비어 있으면 문의 페이지가 "준비 중"으로 표시된다 */
export const SITE_CONTACT_EMAIL = "poscoun@gmail.com";
/** Google AdSense 게시자 ID (공개 값) */
export const ADSENSE_CLIENT = "ca-pub-3562630074064163";

/** 공유 미리보기(OG·트위터) 메타데이터. 이미지는 scripts/og-images.ts로 만든 public/og/<slug>.png (1200×630) */
export function shareMeta(slug = "default") {
  const url = `/og/${slug}.png`;
  return {
    openGraph: { siteName: SITE_NAME, locale: "ko_KR", type: "website" as const, images: [{ url, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image" as const, images: [url] },
  };
}
