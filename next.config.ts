import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/yummy-nunu",
  assetPrefix: "/yummy-nunu/",
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
