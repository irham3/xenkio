'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { ArrowRight, Zap, Shield, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import ShinyText from '@/components/reactbits/shiny-text';
import { PlaceholdersAndVanishInput } from '@/components/ui/placeholders-and-vanish-input';
import { TOOLS, type ToolData } from '@/data/tools';
import Fuse from 'fuse.js';

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

const fuse = new Fuse(TOOLS, {
  keys: ['title', 'description', 'category'],
  threshold: 0.3,
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
      return searchResults.map((r) => r.item);
    } else {
      // Show all tools when no search query
      return TOOLS;
    }
  }, [query]);

  const showResults = isFocused && results.length > 0;

  return (
    <section className="relative z-10 bg-white pt-20 pb-32 lg:pt-32 lg:pb-40">
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 mb-8 rounded-full bg-white border border-gray-200 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300 cursor-default"
          >
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-semibold text-gray-600 tracking-wide uppercase">Free & Unlimited</span>
          </motion.div>

          {/* Main Heading */}
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

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg sm:text-xl text-gray-500 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            Explore a collection of powerful, free tools to convert, edit, and generate content.
            No sign-up required, just get it done.
          </motion.p>

          {/* Search Area: The focal point - using OLD width style max-w-xl */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            ref={containerRef}
            className="relative max-w-xl mx-auto z-20 mb-12"
          >
            <PlaceholdersAndVanishInput
              placeholders={placeholders}
              onChange={(e) => setQuery(e.target.value)}
              onSubmit={(e) => {
                e.preventDefault();
              }}
              onFocus={() => setIsFocused(true)}
            />

            {/* Search Results Dropdown - Simpler Version */}
            {showResults && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full left-0 right-0 mt-2 max-w-xl bg-white rounded-xl border border-gray-200 shadow-xl z-50 overflow-hidden"
              >
                <div className="max-h-[400px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {results.map((tool) => (
                    <a
                      key={tool.id}
                      href={tool.href}
                      className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100">
                        <tool.icon className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="text-[15px] font-medium text-gray-900">{tool.title}</div>
                        <div className="text-sm text-gray-500">{tool.description.slice(0, 60)}...</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </a>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Trust Indicators */}
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
