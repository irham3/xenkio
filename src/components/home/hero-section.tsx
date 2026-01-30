'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { ArrowRight, Zap, Shield, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import ShinyText from '@/components/reactbits/shiny-text';
import { PlaceholdersAndVanishInput } from '@/components/ui/placeholders-and-vanish-input';
import { DUMMY_TOOLS as TOOLS } from '@/data/tools';
import Fuse from 'fuse.js';

const placeholders = [
  'Search 130+ tools...',
  'Convert PDF to Word...',
  'Generate QR codes...',
  'Compress images...',
  'Format JSON data...',
];

const fuse = new Fuse(TOOLS, {
  keys: ['title', 'description'],
  threshold: 0.4,
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

  // useEffect for placeholders rotation removed as it is handled in the component
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
  //   }, 3000);
  //   return () => clearInterval(interval);
  // }, []);

  const results = useMemo(() => {
    if (query.trim()) {
      const searchResults = fuse.search(query).slice(0, 5);
      return searchResults.map((r) => r.item);
    } else {
      return [];
    }
  }, [query]);

  const showResults = isFocused && results.length > 0;

  return (
    <section className="relative z-10 bg-linear-to-b from-primary-50/80 via-white to-white">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }} />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="text-center max-w-2xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 mb-8 text-sm font-medium text-primary-700 bg-primary-50 border border-primary-200/60 rounded-full"
          >
            <Zap className="w-4 h-4" />
            Free tools for everyone
          </motion.div>

          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 mb-6"
          >
            Every Tool You Need in {' '}
            <span className="relative">
              <ShinyText
                text="One Platform"
                disabled={false}
                speed={3}
                className="block sm:inline"
                color="#0EA5E9"
                shineColor="#ffffff"
              />
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Process files, convert formats, and transform data instantly. No signup required, completely free.
          </motion.p>

          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            ref={containerRef}
            className="relative max-w-xl mx-auto z-20"
          >
            <PlaceholdersAndVanishInput
              placeholders={placeholders}
              onChange={(e) => setQuery(e.target.value)}
              onSubmit={(e) => {
                e.preventDefault();
                console.log('Search submit', query);
              }}
              onFocus={() => setIsFocused(true)}
            />

            {/* Search results dropdown */}
            {showResults && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full left-0 right-0 mt-2 max-w-xl bg-white rounded-xl border border-gray-200 shadow-xl z-50"
              >
                {results.map((tool) => (
                  <a
                    key={tool.id}
                    href={tool.href}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors z-50 max-w-2xl"
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
              </motion.div>
            )}
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 mt-12 text-sm text-gray-500"
          >
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              <span>100% Secure</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary-500" />
              <span>Instant Processing</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-accent-500" />
              <span>No Registration</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
