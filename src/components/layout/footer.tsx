import Link from 'next/link';
import { XenkioLogo } from '@/components/ui/xenkio-logo';
import { TOOLS } from '@/data/tools';

export function Footer() {
  const featuredTools = TOOLS.filter(t => t.featured);
  const newTools = TOOLS.filter(t => t.isNew);

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main footer content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col md:flex-row md:justify-between gap-12 lg:gap-20">
          {/* Brand column */}
          <div className="max-w-sm">
            <Link href="/" className="flex items-center gap-3 mb-5">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-linear-to-br from-primary-400 to-primary-600">
                <XenkioLogo className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Xenkio</span>
            </Link>
            <p className="text-gray-400 text-[15px] leading-relaxed mb-6">
              Free browser-based tools that process everything locally. Your files never leave your device.
            </p>
          </div>

          {/* Links Columns */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 lg:gap-16">
            {/* Popular Tools */}
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                Popular Tools
              </h3>
              <ul className="space-y-3">
                {featuredTools.slice(0, 6).map((tool) => (
                  <li key={tool.id}>
                    <Link
                      href={tool.href}
                      className="text-[15px] text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                    >
                      <span>{tool.title}</span>
                      {tool.isNew && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold bg-primary-500/20 text-primary-400 rounded-full border border-primary-500/30">
                          NEW
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* New Tools */}
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                New & Trending
              </h3>
              <ul className="space-y-3">
                {newTools.slice(0, 6).map((tool) => (
                  <li key={tool.id}>
                    <Link
                      href={tool.href}
                      className="text-[15px] text-gray-400 hover:text-white transition-colors"
                    >
                      {tool.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                Explore
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/tools?category=documents" className="text-[15px] text-gray-400 hover:text-white transition-colors">
                    PDF & Documents
                  </Link>
                </li>
                <li>
                  <Link href="/tools?category=media-images" className="text-[15px] text-gray-400 hover:text-white transition-colors">
                    Image Tools
                  </Link>
                </li>
                <li>
                  <Link href="/tools?category=developer-tools" className="text-[15px] text-gray-400 hover:text-white transition-colors">
                    Developer Tools
                  </Link>
                </li>
                <li>
                  <Link href="/tools?category=security-privacy" className="text-[15px] text-gray-400 hover:text-white transition-colors">
                    Security & Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/how-it-works" className="text-[15px] text-gray-400 hover:text-white transition-colors">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link href="/tools" className="text-[15px] text-primary-400 hover:text-primary-300 transition-colors font-medium flex items-center gap-1">
                    View All Tools
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Banner */}
      <div className="border-t border-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-6 gap-y-2 text-xs text-gray-400">
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>100% local processing</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                </svg>
                <span>GDPR compliant by design</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636a9 9 0 11-12.728 0M12 2v4" />
                </svg>
                <span>Works offline</span>
              </div>
            </div>
            <Link href="/how-it-works" className="text-xs text-primary-400 hover:text-primary-300 transition-colors font-medium whitespace-nowrap">
              Learn how it works →
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} Xenkio. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
