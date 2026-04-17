import type { NextConfig } from "next";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/v1/scrapers/:path*",
        destination: `${BACKEND_URL}/api/v1/scrapers/:path*`,
      },
    ];
  },
};

export default nextConfig;
