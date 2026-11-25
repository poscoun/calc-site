import type { NextConfig } from "next";
import createMDX from "@next/mdx";
import remarkGfm from "remark-gfm";

// 정적 export: 서버 없이 out/ 폴더를 Cloudflare Workers 정적 자산으로 배포
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  pageExtensions: ["ts", "tsx", "md", "mdx"],
};

// remark-gfm: 표(|...|) 문법 지원
export default createMDX({ options: { remarkPlugins: [remarkGfm] } })(nextConfig);
