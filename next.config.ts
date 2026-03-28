import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  outputFileTracingRoot: "/Users/maurelmvondo/Downloads/lumia 2/nextjs",
};

export default nextConfig;
