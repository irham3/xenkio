'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { ArrowRight, ShieldCheck, Zap, UserX } from 'lucide-react';
import Link from 'next/link';
import ShinyText from '@/components/reactbits/shiny-text';
import { PlaceholdersAndVanishInput } from '@/components/ui/placeholders-and-vanish-input';
import { TOOLS, type ToolData } from '@/data/tools';
import type Fuse from 'fuse.js';

const placeholders = [
  'Merge PDF...',
  'Split PDF...',
  'Image Compressor...',
  'QR Code Generator...',
  'Image Converter...',
  'Password Generator...',
  'Hash Generator...',
  'Image to PDF...',
  'PDF to Image...',
  'Color Picker...'
];
export function HeroSection() {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [fuse, setFuse] = useState<Fuse<ToolData> | null>(null);

  // Load Fuse.js only when needed (on focus)
  useEffect(() => {
    if (isFocused && !fuse) {
      import('fuse.js').then((FuseModule) => {
        const FuseConstructor = FuseModule.default;
        const fuseInstance = new FuseConstructor(TOOLS, {
          keys: ['title', 'description', 'categoryId'],
          threshold: 0.3,
          includeScore: true,
        });
        setFuse(fuseInstance);
      });
    }
  }, [isFocused, fuse]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const results = useMemo((): ToolData[] => {
    if (query.trim() && fuse) {
      const searchResults = fuse.search(query);
      return searchResults.map((r) => r.item);
    } else if (query.trim()) {
      // Fallback simple search while fuse loads
      return TOOLS.filter(t =>
        t.title.toLowerCase().includes(query.toLowerCase()) ||
        t.description.toLowerCase().includes(query.toLowerCase())
      );
    } else {
      return TOOLS;
    }
  }, [query, fuse]);

  const showResults = isFocused && results.length > 0;

  return (
    <section className="relative z-10 bg-white pt-20 pb-32 lg:pt-32 lg:pb-40">
      <style jsx>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in-up { opacity: 0; animation: fadeInUp 0.5s ease-out forwards; }
        .animate-fade-in { opacity: 0; animation: fadeIn 0.5s ease-out forwards; }
        .animate-scale-in { opacity: 0; animation: scaleIn 0.5s ease-out forwards; }
        .delay-1 { animation-delay: 0.1s; }
        .delay-2 { animation-delay: 0.2s; }
        .delay-3 { animation-delay: 0.3s; }
        .delay-4 { animation-delay: 0.4s; }
      `}</style>
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        {/* Professional Grid Background with Mask */}
        <div className="absolute inset-0 h-full w-full bg-white bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-size-[14px_24px]">
          <div className="absolute inset-0 bg-radial-[circle_800px_at_50%_200px] from-white/0 via-white/50 to-white" />
        </div>

        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary-100/30 blur-[120px] rounded-full opacity-60" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">

          {/* Badge */}
          <Link href="/how-it-works" className="animate-fade-in-up inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-primary-50 border border-primary-200 shadow-sm hover:shadow-md hover:bg-primary-100 transition-all duration-200">
            <span className="flex h-1.5 w-1.5 rounded-full bg-primary-500"></span>
            <span className="text-xs font-semibold text-primary-700 tracking-wide">100% processed in your browser</span>
            <span className="text-xs text-primary-500">Learn more →</span>
          </Link>

          {/* Main Heading */}
          <h1 className="animate-fade-in-up delay-1 text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 mb-6 leading-[1.1]">
            Your files never leave<br className="hidden sm:block" />
            <span className="relative inline-block">
              <ShinyText
                text="your device"
                disabled={false}
                speed={3}
                className="inline-block py-2 leading-normal"
                color="#0EA5E9"
                shineColor="#E0F2FE"
              />
            </span>
          </h1>

          {/* Subheading */}
          <p className="animate-fade-in-up delay-2 text-lg sm:text-xl text-gray-500 mb-12 max-w-2xl mx-auto leading-relaxed">
            Free tools for PDFs, images, videos, and more.
            No uploads to servers, no file size limits, no sign-up required.
          </p>

          {/* Search Area */}
          <div
            ref={containerRef}
            className="animate-scale-in delay-3 relative max-w-xl mx-auto z-20 mb-10"
          >
            <PlaceholdersAndVanishInput
              placeholders={placeholders}
              onChange={(e) => setQuery(e.target.value)}
              onSubmit={(e) => {
                e.preventDefault();
              }}
              onFocus={() => setIsFocused(true)}
            />

            {/* Search Results Dropdown */}
            {showResults && (
              <div className="animate-fade-in-up absolute top-full left-0 right-0 mt-2 max-w-xl bg-white rounded-xl border border-gray-200 shadow-xl z-50 overflow-hidden">
                <div className="max-h-[400px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {results.map((tool) => {
                    const content = (
                      <>
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 shrink-0">
                          <tool.icon className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="text-[15px] font-medium text-gray-900 truncate">{tool.title}</div>
                            {tool.isComingSoon && (
                              <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase text-gray-500 bg-gray-100 rounded border border-gray-200">Soon</span>
                            )}
                          </div>
                          <div className="text-sm text-gray-700 truncate">{tool.description}</div>
                        </div>
                        {!tool.isComingSoon && <ArrowRight className="w-4 h-4 text-gray-400" />}
                      </>
                    );

                    if (tool.isComingSoon) {
                      return (
                        <div key={tool.id} className="flex items-center gap-4 px-5 py-3.5 opacity-60 cursor-not-allowed border-b border-gray-50 last:border-0">
                          {content}
                        </div>
                      );
                    }

                    return (
                      <a
                        key={tool.id}
                        href={tool.href}
                        className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                      >
                        {content}
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Trust Indicators - 3 UVP Pillars */}
          <div className="animate-fade-in delay-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-gray-500">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span className="font-medium">Private by design</span>
            </div>
            <span className="hidden sm:block text-gray-300">·</span>
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" />
              <span className="font-medium">Instant, no queue</span>
            </div>
            <span className="hidden sm:block text-gray-300">·</span>
            <div className="flex items-center gap-1.5">
              <UserX className="w-4 h-4 text-primary-500" />
              <span className="font-medium">No account needed</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
