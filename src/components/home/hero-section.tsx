'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { ArrowRight, ShieldCheck, Lightning, UserMinus, ArrowDown } from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';
import { PlaceholdersAndVanishInput } from '@/components/ui/placeholders-and-vanish-input';
import { IconRenderer } from '@/components/ui/icon-renderer';
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

// Bento grid tools — hand-picked across categories for visual diversity
const BENTO_TOOLS = [
  TOOLS.find(t => t.id === '1'),  // Merge PDF
  TOOLS.find(t => t.id === '63'), // Remove Background
  TOOLS.find(t => t.id === '8'),  // Image Compressor
  TOOLS.find(t => t.id === '16'), // QR Code Generator
  TOOLS.find(t => t.id === '19'), // Password Generator
  TOOLS.find(t => t.id === '26'), // JSON Formatter
  TOOLS.find(t => t.id === '36'), // Color Picker
  TOOLS.find(t => t.id === '6'),  // PDF Compressor
  TOOLS.find(t => t.id === '11'), // Image Converter
].filter(Boolean) as ToolData[];

export function HeroSection() {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [fuse, setFuse] = useState<Fuse<ToolData> | null>(null);
  const [dropdownMaxH, setDropdownMaxH] = useState(300);

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

  // Recalculate available dropdown space when focus changes
  useEffect(() => {
    if (isFocused && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom - 24; // 24px bottom margin
      setDropdownMaxH(Math.max(160, Math.min(spaceBelow, 400)));
    }
  }, [isFocused]);

  const results = useMemo((): ToolData[] => {
    if (query.trim() && fuse) {
      const searchResults = fuse.search(query);
      return searchResults.map((r) => r.item);
    } else if (query.trim()) {
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
    <section className="relative z-10 flex flex-col justify-start pt-12 sm:pt-16 lg:pt-0 lg:justify-center min-h-[calc(100dvh-75px)] overflow-hidden">
      <style jsx>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes floatA {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(0.4deg); }
        }
        @keyframes floatB {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-6px) rotate(-0.3deg); }
          66% { transform: translateY(3px) rotate(0.2deg); }
        }
        @keyframes floatC {
          0%, 100% { transform: translateY(0px); }
          40% { transform: translateY(-10px); }
          70% { transform: translateY(2px); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.55; transform: scale(1.05); }
        }
        @keyframes scrollCue {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(5px); opacity: 0.9; }
        }
        @keyframes orbitSlow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes dashFlow {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -40; }
        }
        @keyframes particleDrift {
          0%, 100% { transform: translateY(0) translateX(0) scale(1); opacity: 0.4; }
          25% { transform: translateY(-20px) translateX(8px) scale(1.2); opacity: 0.7; }
          50% { transform: translateY(-6px) translateX(-4px) scale(0.9); opacity: 0.5; }
          75% { transform: translateY(-14px) translateX(12px) scale(1.1); opacity: 0.6; }
        }
        .hero-up { opacity: 0; animation: fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .hero-fade { opacity: 0; animation: fadeIn 0.7s ease-out forwards; }
        .hero-scale { opacity: 0; animation: scaleIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .d-0 { animation-delay: 0s; }
        .d-1 { animation-delay: 0.07s; }
        .d-2 { animation-delay: 0.14s; }
        .d-3 { animation-delay: 0.22s; }
        .d-4 { animation-delay: 0.32s; }
        .d-5 { animation-delay: 0.5s; }
        .d-6 { animation-delay: 0.65s; }
        .d-7 { animation-delay: 0.8s; }
        .float-a { animation: floatA 6s ease-in-out infinite; }
        .float-b { animation: floatB 7s ease-in-out infinite; }
        .float-c { animation: floatC 5s ease-in-out infinite; }
        .glow-pulse { animation: pulseGlow 5s ease-in-out infinite; }
        .scroll-cue { animation: scrollCue 2.5s ease-in-out infinite; }
        .orbit { animation: orbitSlow 60s linear infinite; }
        .dash-flow { animation: dashFlow 3s linear infinite; }
        .particle { animation: particleDrift 8s ease-in-out infinite; }
        .bento-card {
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .bento-card:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 12px 40px rgba(14, 165, 233, 0.12), 0 4px 12px rgba(0,0,0,0.06);
          border-color: rgba(14, 165, 233, 0.3);
        }
        .bento-card:hover .bento-icon {
          background: rgba(14, 165, 233, 0.08);
          color: #0284C7;
        }
        .bento-card:hover .bento-shimmer {
          opacity: 1;
        }
        .bento-shimmer {
          opacity: 0;
          transition: opacity 0.4s ease;
          background: linear-gradient(90deg, transparent, rgba(14, 165, 233, 0.06), transparent);
          background-size: 200% 100%;
          animation: shimmer 2s ease-in-out infinite;
        }
      `}</style>

      {/* ---- Background Layers ---- */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-linear-to-br from-white via-[#fafbfc] to-primary-50/40" />

        {/* Dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.25]"
          style={{
            backgroundImage: 'radial-gradient(circle, #d4d4d8 0.7px, transparent 0.7px)',
            backgroundSize: '28px 28px',
          }}
        />

        {/* Gradient orbs — atmospheric depth */}
        <div className="absolute -top-20 right-[10%] w-[550px] h-[550px] rounded-full bg-primary-200/20 blur-[100px] glow-pulse" />
        <div className="absolute top-[55%] -left-32 w-[450px] h-[450px] rounded-full bg-accent-100/15 blur-[110px] glow-pulse" style={{ animationDelay: '2.5s' }} />
        <div className="absolute bottom-[5%] right-[30%] w-[350px] h-[350px] rounded-full bg-primary-100/20 blur-[90px] glow-pulse" style={{ animationDelay: '1.2s' }} />

        {/* Fine noise overlay */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Bottom edge fade */}
        <div className="absolute bottom-0 inset-x-0 h-24 bg-linear-to-t from-gray-50 to-transparent" />
      </div>

      {/* ---- Main Content ---- */}
      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 lg:-mt-12 xl:-mt-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">

          {/* Left Column — Primary Content */}
          <div className="lg:col-span-6 text-center lg:text-left">

            {/* Badge */}
            <Link
              href="/how-it-works"
              className="hero-up d-0 inline-flex items-center gap-2 px-3.5 py-1.5 mb-6 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200/70 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-primary-200/80 transition-all duration-300 group"
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-40" />
                <span className="relative rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
              <span className="text-[11px] sm:text-xs font-semibold text-gray-600 tracking-wide">100% processed in your browser</span>
              <ArrowRight className="w-3 h-3 text-gray-400 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all" weight="bold" />
            </Link>

            {/* Heading */}
            <h1 className="hero-up d-1 text-[2rem] sm:text-5xl lg:text-[3.25rem] xl:text-[3.6rem] font-bold tracking-[-0.025em] text-gray-900 leading-[1.1] mb-4 lg:mb-5">
              Your files stay on
              <br />
              <span className="relative inline-block mt-1">
                <span className="relative z-10 bg-linear-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">your device</span>
                <span className="absolute -bottom-1 left-0 right-0 h-[3px] bg-linear-to-r from-primary-300/60 to-primary-200/40 rounded-full" />
              </span>
            </h1>

            {/* Subtitle */}
            <p className="hero-up d-2 text-base sm:text-lg lg:text-[1.1rem] text-gray-500 leading-relaxed mb-7 lg:mb-8 max-w-md mx-auto lg:mx-0">
              Free browser-based tools for PDFs, images, videos, and more.
              No uploads to servers. No file size limits.
            </p>

            {/* Search Area */}
            <div
              ref={containerRef}
              className="hero-scale d-3 relative max-w-xl mx-auto lg:mx-0 z-20 mb-6"
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
                <div className="hero-up d-0 absolute top-full left-0 right-0 mt-2 max-w-xl bg-white/95 backdrop-blur-xl rounded-xl border border-gray-200 shadow-xl z-50 overflow-hidden">
                  <div className="overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" style={{ maxHeight: dropdownMaxH }}>
                    {results.map((tool) => {
                      const content = (
                        <>
                          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 shrink-0">
                            <IconRenderer name={tool.icon} className="w-5 h-5 text-gray-600" />
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
                          {!tool.isComingSoon && <ArrowRight className="w-4 h-4 text-gray-400" weight="duotone" />}
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

            {/* Trust Indicators */}
            <div className="hero-fade d-4 flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2 text-[13px] text-gray-500">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-[15px] h-[15px] text-emerald-500 mt-px" weight="duotone" />
                <span className="font-medium">Private by design</span>
              </div>
              <span className="text-gray-200 hidden sm:inline">|</span>
              <div className="flex items-center gap-1.5">
                <Lightning className="w-[15px] h-[15px] text-amber-500 mt-px" weight="duotone" />
                <span className="font-medium">Instant processing</span>
              </div>
              <span className="text-gray-200 hidden sm:inline">|</span>
              <div className="flex items-center gap-1.5">
                <UserMinus className="w-[15px] h-[15px] text-primary-500 mt-px" />
                <span className="font-medium">No account needed</span>
              </div>
            </div>
          </div>

          {/* ============================================= */}
          {/* Right Column — Bento Grid with Animated Orbit */}
          {/* ============================================= */}
          <div className="hidden lg:block lg:col-span-6 relative" aria-hidden="true">
            <div className="relative w-full aspect-square max-h-[480px]">

              {/* Animated orbital ring — subtle rotating ring behind the grid */}
              <div className="absolute inset-[10%] orbit">
                <svg viewBox="0 0 400 400" className="w-full h-full opacity-[0.09]">
                  <circle cx="200" cy="200" r="195" fill="none" stroke="#0EA5E9" strokeWidth="1" strokeDasharray="6 8" className="dash-flow" />
                  <circle cx="200" cy="200" r="145" fill="none" stroke="#0EA5E9" strokeWidth="0.6" strokeDasharray="4 10" />
                  <circle cx="200" cy="200" r="90" fill="none" stroke="#38BDF8" strokeWidth="0.4" strokeDasharray="3 12" />
                </svg>
              </div>

              {/* Center glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 rounded-full bg-primary-200/30 blur-[70px] glow-pulse" />

              {/* Animated particles */}
              <div className="absolute top-[12%] left-[20%] w-2.5 h-2.5 rounded-full bg-primary-400/50 particle" style={{ animationDelay: '0s' }} />
              <div className="absolute top-[65%] right-[15%] w-2 h-2 rounded-full bg-accent-400/45 particle" style={{ animationDelay: '2s' }} />
              <div className="absolute top-[35%] right-[8%] w-3 h-3 rounded-full bg-primary-300/35 particle" style={{ animationDelay: '4s' }} />
              <div className="absolute bottom-[20%] left-[12%] w-2 h-2 rounded-full bg-primary-500/30 particle" style={{ animationDelay: '6s' }} />
              <div className="absolute top-[8%] right-[35%] w-1.5 h-1.5 rounded-full bg-primary-400/60 particle" style={{ animationDelay: '1s' }} />
              <div className="absolute bottom-[12%] right-[40%] w-2.5 h-2.5 rounded-full bg-accent-300/30 particle" style={{ animationDelay: '3s' }} />
              <div className="absolute top-[50%] left-[5%] w-1.5 h-1.5 rounded-full bg-primary-600/20 particle" style={{ animationDelay: '5s' }} />
              <div className="absolute top-[82%] left-[50%] w-2 h-2 rounded-full bg-primary-300/40 particle" style={{ animationDelay: '7s' }} />

              {/* Animated flowing connection paths */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.12]" viewBox="0 0 480 480" fill="none">
                <path d="M90 100 C160 60, 280 120, 380 80" stroke="url(#grad1)" strokeWidth="1.2" className="dash-flow" strokeDasharray="6 6" />
                <path d="M60 250 C150 200, 300 280, 420 240" stroke="url(#grad1)" strokeWidth="1" className="dash-flow" strokeDasharray="4 8" style={{ animationDelay: '1s' }} />
                <path d="M100 380 C200 340, 350 400, 430 360" stroke="url(#grad1)" strokeWidth="0.8" className="dash-flow" strokeDasharray="5 7" style={{ animationDelay: '2s' }} />
                <path d="M380 60 C360 180, 340 320, 390 430" stroke="url(#grad2)" strokeWidth="0.8" className="dash-flow" strokeDasharray="4 6" style={{ animationDelay: '0.5s' }} />
                <path d="M80 80 C100 200, 120 340, 80 430" stroke="url(#grad2)" strokeWidth="0.6" className="dash-flow" strokeDasharray="3 8" style={{ animationDelay: '1.5s' }} />
                <defs>
                  <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0" />
                    <stop offset="50%" stopColor="#0EA5E9" stopOpacity="1" />
                    <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="grad2" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0" />
                    <stop offset="50%" stopColor="#0EA5E9" stopOpacity="1" />
                    <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Bento Grid — dense, tightly packed with no gaps */}
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-3 p-3">
                {BENTO_TOOLS.map((tool, index) => {
                  const delays = [0.3, 0.4, 0.5, 0.55, 0.65, 0.7, 0.8, 0.85, 0.95];
                  // Per-card color theme for visual variety
                  const iconThemes = [
                    'bg-sky-50 text-sky-600',       // Merge PDF
                    'bg-violet-50 text-violet-600',  // Remove BG
                    'bg-emerald-50 text-emerald-600', // Image Compressor
                    'bg-amber-50 text-amber-600',    // QR Code
                    'bg-primary-50 text-primary-600', // Password Gen (center)
                    'bg-rose-50 text-rose-500',      // JSON Formatter
                    'bg-teal-50 text-teal-600',      // Color Picker
                    'bg-orange-50 text-orange-500',  // PDF Compressor
                    'bg-indigo-50 text-indigo-600',  // Image Converter
                  ];
                  const isCenterCard = index === 4; // center of 3x3

                  return (
                    <Link
                      key={tool.id}
                      href={tool.href}
                      className="hero-scale group relative"
                      style={{ animationDelay: `${delays[index]}s` }}
                    >
                      <div className={`bento-card relative h-full flex flex-col items-center justify-center gap-2.5 p-3 backdrop-blur-sm rounded-2xl border overflow-hidden ${
                        isCenterCard
                          ? 'bg-linear-to-br from-primary-50/95 to-white/95 border-primary-300/50 shadow-[0_2px_20px_rgba(14,165,233,0.14),_0_0_0_1px_rgba(14,165,233,0.06)]'
                          : 'bg-white/80 border-gray-200/50 shadow-[0_1px_6px_rgba(0,0,0,0.03)]'
                      }`}>
                        {/* Shimmer overlay on hover */}
                        <div className="bento-shimmer absolute inset-0 rounded-2xl" />

                        <div className={`bento-icon relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 shrink-0 ${iconThemes[index]}`}>
                          <IconRenderer name={tool.icon} className="w-5 h-5" />
                        </div>
                        <span className="relative text-[12px] font-semibold text-gray-700 text-center leading-tight group-hover:text-primary-700 transition-colors">
                          {tool.title}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="hero-fade d-7 absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5">
        <span className="text-[10px] font-medium text-gray-500 uppercase tracking-[0.15em]">Explore tools</span>
        <ArrowDown className="w-3.5 h-3.5 text-gray-400 scroll-cue" weight="bold" />
      </div>
    </section>
  );
}
