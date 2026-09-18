import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  // 프록시 대상(FastAPI)이 트레일링 슬래시 유무로 다른 라우트를 구분하는 경우가 있어
  // (예: POST /api/v1/recommend/), Next.js가 임의로 슬래시를 제거해 308 리다이렉트 →
  // 백엔드 404로 이어지는 것을 방지
  skipTrailingSlashRedirect: true,

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "newron.shop" },
      { protocol: "http",  hostname: "121.134.239.75", port: "7000" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
    ],
  },

  // 백엔드 API 서버 직접 접근 방지 — 모두 /api/proxy/* 를 통하도록
  async rewrites() {
    return [];
  },
};

export default nextConfig;
