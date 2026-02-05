'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { ArrowRight, Zap, Shield, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import ShinyText from '@/components/reactbits/shiny-text';
import { PlaceholdersAndVanishInput } from '@/components/ui/placeholders-and-vanish-input';
import { TOOLS, type ToolData } from '@/data/tools';
import Fuse from 'fuse.js';
import Link from 'next/link';

const placeholders = [
  'Merge PDF files...',
  'Convert PDF to Word...',
  'Generate QR Codes...',
  'Compress Images...',
  'Create Secure Passwords...',
];



const fuse = new Fuse(TOOLS, {
  keys: ['title', 'description', 'category'],
  threshold: 0.3, // Slightly stricter threshold for better relevance
  includeScore: true,
});

export function HeroSection() {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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
    if (query.trim()) {
      const searchResults = fuse.search(query);
      return searchResults.slice(0, 5).map((r) => r.item); // Limit to top 5 results for cleaner UI
    } else {
      return [];
    }
  }, [query]);

  const showResults = (isFocused || query.length > 0) && results.length > 0;

  return (
    <section className="relative z-10 overflow-hidden bg-white pt-20 pb-32 lg:pt-32 lg:pb-40">
      {/* Professional Grid Background with Mask */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-size-[14px_24px]">
        <div className="absolute inset-0 bg-radial-[circle_800px_at_50%_200px] from-white/0 via-white/50 to-white" />
      </div>

      {/* Subtle Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 w-[800px] h-[500px] bg-primary-100/30 blur-[120px] rounded-full opacity-60 pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">

          {/* Badge: Pill shaped, subtle, high-end feel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 mb-8 rounded-full bg-white border border-gray-200 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300 cursor-default"
          >
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-semibold text-gray-600 tracking-wide uppercase">Free & Unlimited</span>
          </motion.div>

          {/* Main Heading: Strong hierarchy, clean topography */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 mb-6 leading-[1.1]"
          >
            Your Toolkit for <br className="hidden sm:block" />
            <span className="relative inline-block">
              <ShinyText
                text="Better Productivity"
                disabled={false}
                speed={3}
                className="inline-block py-2 leading-normal"
                color="#0EA5E9"
                shineColor="#E0F2FE"
              />
            </span>
          </motion.h1>

          {/* Subheading: Readable, balanced */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg sm:text-xl text-gray-500 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            Explore a collection of powerful, free tools to convert, edit, and generate content.
            No sign-up required, just get it done.
          </motion.p>

          {/* Search Area: The focal point */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            ref={containerRef}
            className="relative max-w-2xl mx-auto z-20 mb-12"
          >
            {/* Search Input Container with Drop Shadow */}
            <div className="relative group">


              <div className="relative">
                <PlaceholdersAndVanishInput
                  placeholders={placeholders}
                  onChange={(e) => setQuery(e.target.value)}
                  onSubmit={(e) => {
                    e.preventDefault();
                    // Could redirect to search results page
                  }}
                  onFocus={() => setIsFocused(true)}
                />
              </div>
            </div>



            {/* Search Results Dropdown - Progressive Disclosure */}
            {showResults && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-3 bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-2xl shadow-gray-200/50 z-50 overflow-hidden text-left"
              >
                <div className="px-4 py-2 bg-gray-50/50 text-[10px] uppercase font-semibold text-gray-400 tracking-wider">
                  Tools matching &quot;{query}&quot;
                </div>
                <div className="max-h-[320px] overflow-y-auto scrollbar-themed py-2">
                  {results.map((tool) => (
                    <Link
                      key={tool.id}
                      href={tool.href}
                      className="flex items-start gap-4 px-4 py-3 mx-2 rounded-xl hover:bg-primary-50/50 transition-colors group"
                      onClick={() => setIsFocused(false)}
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 text-gray-500 group-hover:bg-white group-hover:text-primary-600 shadow-sm transition-all border border-gray-100">
                        <tool.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-gray-900 group-hover:text-primary-700 truncate">{tool.title}</h4>
                          <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-primary-400 group-hover:-rotate-45 transition-transform duration-300" />
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{tool.description}</p>
                      </div>
                    </Link>
                  ))}
                </div>
                {results.length > 0 && (
                  <div className="px-4 py-2.5 bg-gray-50 text-center">
                    <span className="text-xs text-gray-400">Press <kbd className="font-sans px-1 py-0.5 bg-white border border-gray-200 rounded text-[10px]">Enter</kbd> to see all results</span>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>

          {/* Trust Indicators - Minimalist & Divider */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="flex items-center justify-center gap-8 md:gap-16 max-w-3xl mx-auto">
              <div className="flex flex-col items-center gap-2 group cursor-default">
                <div className="p-2 rounded-full bg-green-50 text-green-600 group-hover:bg-green-100 transition-colors">
                  <Shield className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-gray-600">Secure & Private</span>
              </div>
              <div className="flex flex-col items-center gap-2 group cursor-default">
                <div className="p-2 rounded-full bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
                  <Zap className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-gray-600">Lightning Fast</span>
              </div>
              <div className="flex flex-col items-center gap-2 group cursor-default">
                <div className="p-2 rounded-full bg-purple-50 text-purple-600 group-hover:bg-purple-100 transition-colors">
                  <Clock className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-gray-600">Forever Free</span>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
