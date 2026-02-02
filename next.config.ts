import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import type { NextConfig } from "next";

initOpenNextCloudflareForDev();

const nextConfig: NextConfig = {
  // Cloudflare Workers optimization
  // Disable image optimization (use Cloudflare Images in production)
  images: {
    unoptimized: true,
  },

  // Enable experimental features for better Cloudflare compatibility
  experimental: {
    // Enable server actions
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
};

export default nextConfig;
