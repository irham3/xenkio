import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export for Cloudflare Pages deployment
  output: "export",

  // Disable image optimization (required for static export)
  images: {
    unoptimized: true,
  },

  // Fix for Windows: Alias node:crypto to crypto for Turbopack
  turbopack: {
    resolveAlias: {
      'node:crypto': 'crypto',
    }
  },

  webpack: (config) => {
    // Fix for Windows: Alias node:crypto to crypto to avoid invalid filenames with colons
    config.resolve.alias = {
      ...config.resolve.alias,
      'node:crypto': 'crypto',
    };
    return config;
  }
};

export default nextConfig;
