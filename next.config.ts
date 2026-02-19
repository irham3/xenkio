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

  webpack: (config, { isServer }) => {
    // Fix for Windows: Alias node:crypto to crypto to avoid invalid filenames with colons
    config.resolve.alias = {
      ...config.resolve.alias,
      'node:crypto': 'crypto',
    };

    // Handle @ffmpeg/ffmpeg worker creation (uses import.meta.url)
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }

    return config;
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
        ],
      },
    ];
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};

export default nextConfig;
