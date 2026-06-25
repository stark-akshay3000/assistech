import type { NextConfig } from "next";

const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/backend/:path*",
        destination: "http://43.205.199.22/:path*",
      },
    ];
  },
};

export default nextConfig;
