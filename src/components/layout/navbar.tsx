'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, Search, Sparkles } from 'lucide-react';
import ShinyText from '@/components/reactbits/shiny-text';
import { cn } from '@/lib/utils';
import { CATEGORIES } from '@/data/categories';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const pathname = usePathname();
  const router = useRouter();

  // Handle scroll spy
  useEffect(() => {
    if (pathname !== '/') {
      setActiveCategory('');
      return;
    }

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100; // Offset for sticky header

      // Check if we are at the top
      if (scrollPosition < 500) {
        setActiveCategory('');
        return;
      }

      // Check sections
      for (const category of CATEGORIES) {
        const element = document.getElementById(`category-${category.id}`);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (
            scrollPosition >= offsetTop &&
            scrollPosition < offsetTop + offsetHeight
          ) {
            setActiveCategory(category.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  const handleCategoryClick = (e: React.MouseEvent<HTMLAnchorElement>, categoryId: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);

    if (pathname !== '/') {
      router.push(`/#category-${categoryId}`);
      return;
    }

    const element = document.getElementById(`category-${categoryId}`);
    if (element) {
      const offset = 80; // Navbar height + padding
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth'
      });
      setActiveCategory(categoryId);
    }
  };

  const handleAllToolsClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // If we are on home, scroll to top
    if (pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setActiveCategory('');
      setMobileMenuOpen(false);
    } else {
      // Allow default navigation to /tools
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Gradient line at top */}
      <div className="h-[2px] bg-linear-to-r from-primary-500 via-primary-600 to-accent-500" />

      <nav className="bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <div className="flex h-[72px] items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2 shrink-0">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-linear-to-br from-primary-500 to-primary-700 shadow-md shadow-primary-500/20 group-hover:shadow-lg group-hover:shadow-primary-500/30 transition-shadow duration-300">
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

            {/* Desktop Navigation - Center */}
            <div className="hidden xl:flex items-center justify-center flex-1">
              <div className="flex items-center gap-1">
                <Link
                  href="/tools"
                  onClick={handleAllToolsClick}
                  className={cn(
                    "px-3.5 py-2 text-[14px] font-medium rounded-lg transition-all duration-200",
                    activeCategory === '' && pathname === '/'
                      ? "text-primary-600 bg-primary-50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  )}
                >
                  All Tools
                </Link>
                {CATEGORIES.map((category) => (
                  <a
                    key={category.id}
                    href={`#category-${category.id}`}
                    onClick={(e) => handleCategoryClick(e, category.id)}
                    className={cn(
                      "px-3.5 py-2 text-[14px] font-medium rounded-lg transition-all duration-200 whitespace-nowrap",
                      activeCategory === category.id
                        ? "text-primary-600 bg-primary-50"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    )}
                  >
                    {category.name}
                  </a>
                ))}
              </div>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-3 shrink-0">
              {/* Search button */}
              <button className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 min-w-[180px]">
                <Search className="w-4 h-4 shrink-0" />
                <span className="text-gray-400">Search tools...</span>
                <kbd className="ml-auto hidden lg:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-gray-400 bg-white border border-gray-200 rounded">
                  ⌘K
                </kbd>
              </button>

              {/* Mobile search */}
              <button className="sm:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <Search className="w-5 h-5" />
              </button>

              {/* Get Started button */}
              <Link
                href="/sign-up"
                className="hidden sm:inline-flex items-center px-5 py-2.5 text-[14px] font-semibold text-white bg-linear-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 rounded-lg shadow-md shadow-primary-500/20 hover:shadow-lg hover:shadow-primary-500/30 transition-all duration-300"
              >
                Get Started
              </Link>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="xl:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={cn(
            'xl:hidden overflow-hidden transition-all duration-300 ease-in-out',
            mobileMenuOpen ? 'max-h-[600px] opacity-100 shadow-xl' : 'max-h-0 opacity-0'
          )}
        >
          <div className="px-4 py-3 space-y-1 bg-white border-t border-gray-100 max-h-[80vh] overflow-y-auto">
            <Link
              href="/tools"
              onClick={handleAllToolsClick}
              className={cn(
                "flex items-center gap-3 px-4 py-3 text-[15px] font-medium rounded-lg transition-colors",
                activeCategory === '' && pathname === '/'
                  ? "text-primary-600 bg-primary-50"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              All Tools
            </Link>
            {CATEGORIES.map((category) => (
              <a
                key={category.id}
                href={`#category-${category.id}`}
                onClick={(e) => handleCategoryClick(e, category.id)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 text-[15px] font-medium rounded-lg transition-colors",
                  activeCategory === category.id
                    ? "text-primary-600 bg-primary-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                <div className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-lg",
                  activeCategory === category.id ? "bg-primary-100" : "bg-gray-100"
                )}>
                  <category.icon className={cn(
                    "w-4 h-4",
                    activeCategory === category.id ? "text-primary-600" : "text-gray-500"
                  )} />
                </div>
                {category.name}
              </a>
            ))}
            <div className="pt-3 mt-3 border-t border-gray-200 space-y-2">
              <Link
                href="/sign-in"
                className="block px-4 py-3 text-center text-[15px] font-medium text-gray-700 hover:text-gray-900 bg-gray-50 rounded-lg border border-gray-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="block px-4 py-3 text-center text-[15px] font-semibold text-white bg-linear-to-r from-primary-500 to-primary-600 rounded-lg shadow-md"
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
