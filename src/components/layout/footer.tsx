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
