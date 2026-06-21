import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

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
