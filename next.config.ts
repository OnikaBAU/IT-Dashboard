import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        "it-dashboard-plum.vercel.app",
      ],
    },
  },
};

export default nextConfig;
