'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Search, ChevronDown, Sparkles } from 'lucide-react';
import ShinyText from '@/components/reactbits/ShinyText';
import { cn } from '@/lib/utils';

const navLinks = [
  { name: 'All Tools', href: '/tools' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'API', href: '/api-docs' },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Gradient line at top */}
      <div className="h-[2px] bg-gradient-to-r from-primary-500 via-primary-600 to-accent-500" />

      <nav className="bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-[72px] items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 shadow-md shadow-primary-500/20 group-hover:shadow-lg group-hover:shadow-primary-500/30 transition-shadow duration-300">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <ShinyText
                  text="Xenkio"
                  disabled={false}
                  speed={3}
                  className="text-xl font-bold tracking-tight"
                  color="#111827"
                  shineColor="#0EA5E9"
                />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="px-4 py-2 text-[15px] font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-all duration-200"
                >
                  {link.name}
                </Link>
              ))}

              {/* Resources Dropdown (dummy) */}
              <button className="flex items-center gap-1 px-4 py-2 text-[15px] font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-all duration-200">
                Resources
                <ChevronDown className="w-4 h-4 opacity-50" />
              </button>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-3">
              {/* Search button */}
              <button className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 min-w-[180px]">
                <Search className="w-4 h-4 flex-shrink-0" />
                <span className="text-gray-400">Search tools...</span>
                <kbd className="ml-auto hidden lg:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-gray-400 bg-white border border-gray-200 rounded">
                  ⌘K
                </kbd>
              </button>

              {/* Mobile search */}
              <button className="sm:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <Search className="w-5 h-5" />
              </button>

              {/* Sign In button */}
              <Link
                href="/sign-in"
                className="hidden sm:inline-flex items-center px-4 py-2 text-[15px] font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                Sign in
              </Link>

              {/* Get Started button */}
              <Link
                href="/sign-up"
                className="hidden sm:inline-flex items-center px-5 py-2.5 text-[14px] font-semibold text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 rounded-lg shadow-md shadow-primary-500/20 hover:shadow-lg hover:shadow-primary-500/30 transition-all duration-300"
              >
                Get Started
              </Link>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={cn(
            'md:hidden overflow-hidden transition-all duration-300 ease-in-out',
            mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          )}
        >
          <div className="px-4 py-3 space-y-1 bg-gray-50/80 border-t border-gray-100">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="block px-4 py-3 text-[15px] font-medium text-gray-700 hover:text-gray-900 hover:bg-white rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-3 mt-3 border-t border-gray-200 space-y-2">
              <Link
                href="/sign-in"
                className="block px-4 py-3 text-center text-[15px] font-medium text-gray-700 hover:text-gray-900 bg-white rounded-lg border border-gray-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="block px-4 py-3 text-center text-[15px] font-semibold text-white bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg shadow-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
