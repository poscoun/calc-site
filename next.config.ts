import type { NextConfig } from "next";

// 정적 export: Vercel 무료 플랜이나 어떤 정적 호스팅에도 배포 가능
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
