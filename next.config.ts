import type { NextConfig } from 'next';
import { PHASE_PRODUCTION_BUILD } from 'next/constants';

const nextConfig = (phase: string): NextConfig => {
  const isExport = phase === PHASE_PRODUCTION_BUILD;

  const config: NextConfig = {
    // Static export for Cloudflare Pages deployment (only during build)
    output: isExport ? "export" : undefined,

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
    compiler: {
      removeConsole: process.env.NODE_ENV === "production",
    },
  };

  if (!isExport) {
    config.headers = async () => {
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
    };
  }

  return config;
};

export default nextConfig;
