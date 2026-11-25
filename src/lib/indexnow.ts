// IndexNow 전송용 순수 함수. 실제 전송은 scripts/indexnow.ts가 main 배포 뒤에 한다.
// 규격: https://www.indexnow.org/documentation (키 8~128자, a-z A-Z 0-9 -, 루트의 {key}.txt)

/** 공개 키. IndexNow 키는 비밀이 아니며 public/{key}.txt로 누구나 볼 수 있다 */
export const INDEXNOW_KEY = "71718c46804a5622ab3298c1c00a8db9";

/** 네이버 서치어드바이저 IndexNow 엔드포인트. 참여 검색엔진(빙 등)에도 공유된다 */
export const INDEXNOW_ENDPOINT = "https://searchadvisor.naver.com/indexnow";

const PAGE_FILE = /\.(tsx|ts|mdx|md)$/;
// 사이트 전체에 걸친 파일은 모든 주소를 다시 보내지 않도록 제외
const SITE_WIDE = new Set(["layout.tsx", "sitemap.ts", "robots.ts", "not-found.tsx", "globals.css", "icon.svg"]);

/**
 * 커밋에서 바뀐 파일 목록 → 다시 알릴 경로 ("/", "/guides/x/" 형식, trailingSlash).
 * src/app/<경로>/ 아래 파일이 바뀌면 그 경로, 계산기·가이드 목록이 바뀌면 목록을 보여 주는 페이지.
 */
export function changedFilesToPaths(files: string[]): string[] {
  const paths = new Set<string>();
  for (const f of files) {
    if (f === "src/lib/calculators.ts") paths.add("/");
    if (f === "src/lib/guides.ts") {
      paths.add("/");
      paths.add("/guides/");
    }
    if (!f.startsWith("src/app/") || !PAGE_FILE.test(f)) continue;
    const segments = f.slice("src/app/".length).split("/");
    const file = segments.pop()!;
    if (segments.length === 0 && SITE_WIDE.has(file)) continue;
    if (file.endsWith(".test.ts")) continue;
    const route = segments.filter((s) => !(s.startsWith("(") && s.endsWith(")")));
    if (route.some((s) => s.startsWith("["))) continue;
    paths.add(route.length === 0 ? "/" : `/${route.join("/")}/`);
  }
  return [...paths].sort();
}

/** sitemap.xml의 <loc> 값 */
export function parseSitemap(xml: string): string[] {
  return [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1]);
}

/** 바뀐 경로 중 사이트맵에 있는 주소만 (noindex·삭제된 페이지 제외) */
export function selectUrls(paths: string[], sitemapUrls: string[], siteUrl: string): string[] {
  const inSitemap = new Set(sitemapUrls);
  return paths.map((p) => `${siteUrl}${p}`).filter((u) => inSitemap.has(u));
}

export function indexNowBody(urls: string[], siteUrl: string) {
  return {
    host: new URL(siteUrl).host,
    key: INDEXNOW_KEY,
    keyLocation: `${siteUrl}/${INDEXNOW_KEY}.txt`,
    urlList: urls,
  };
}
