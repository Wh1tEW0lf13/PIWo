import type { NextConfig } from "next";

// For Cloud Run deployment: use 'standalone' output for efficient Docker builds
const nextConfig: NextConfig = {
  output: 'standalone'
};

export default nextConfig;
