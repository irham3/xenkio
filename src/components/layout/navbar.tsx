'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, Search } from 'lucide-react';
import { XenkioLogo } from '@/components/ui/xenkio-logo';
import ShinyText from '@/components/reactbits/shiny-text';
import dynamic from 'next/dynamic';

const SearchModal = dynamic(() => import('./search-modal').then(mod => mod.SearchModal), {
  ssr: false,
});
import { cn } from '@/lib/utils';
import { CATEGORIES } from '@/data/categories';

import { TOOLS } from '@/data/tools';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [activeSubCategory, setActiveSubCategory] = useState<string | null>(null); // New state for nested dropdowns
  const pathname = usePathname();
  const router = useRouter();

  // Derived state to cleaner handling of active category display
  const effectiveActiveCategory = pathname === '/' ? activeCategory : '';

  // Handle scroll spy
  useEffect(() => {
    if (pathname !== '/') return;

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

    // Initialize on mount/route change
    handleScroll();

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
      // Wait for mobile menu closing animation to finish (300ms) to ensure correct position
      setTimeout(() => {
        const offset = 50; // Navbar height + padding buffer
        const elementPosition = element.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({
          top: elementPosition - offset,
          behavior: 'smooth'
        });
        setActiveCategory(categoryId);
      }, 350);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);



  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Gradient line at top */}
      <div className="h-[2px] bg-linear-to-r from-primary-500 via-primary-600 to-accent-500" />

      <nav className="bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative h-[72px] flex items-center">
            {/* Logo - Left aligned */}
            <div className="flex items-center gap-2 shrink-0 z-10">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-linear-to-br from-primary-500 to-primary-700 shadow-md shadow-primary-500/20 group-hover:shadow-lg group-hover:shadow-primary-500/30 transition-shadow duration-300">
                  <XenkioLogo className="w-4 h-4 text-white" />
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

            {/* Desktop Navigation - Absolutely Centered */}
            <div className="hidden xl:flex items-center justify-center absolute inset-x-0 top-0 h-full pointer-events-none">
              <div className="flex items-center gap-1 pointer-events-auto">


                {CATEGORIES.slice(0, 3).map((category) => {
                  const categoryTools = TOOLS.filter(t => t.categoryId === category.id);
                  const isTwoColumns = categoryTools.length > 7;

                  return (
                    <div
                      key={category.id}
                      className="relative"
                      onMouseEnter={() => setHoveredCategory(category.id)}
                      onMouseLeave={() => setHoveredCategory(null)}
                    >
                      <a
                        href={`#category-${category.id}`}
                        onClick={(e) => handleCategoryClick(e, category.id)}
                        className={cn(
                          "flex items-center gap-1.5 px-3.5 py-2 text-[14px] font-medium rounded-lg transition-all duration-200 whitespace-nowrap cursor-pointer",
                          effectiveActiveCategory === category.id || hoveredCategory === category.id
                            ? "text-primary-600 bg-primary-50"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        )}
                      >
                        {category.name}
                        <ChevronDown
                          className={cn(
                            "w-3.5 h-3.5 transition-transform duration-200 mt-px",
                            hoveredCategory === category.id ? "rotate-180" : ""
                          )}
                        />
                      </a>

                      <AnimatePresence>
                        {hoveredCategory === category.id && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95, x: '-50%' }}
                            animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
                            exit={{ opacity: 0, y: 5, scale: 0.95, x: '-50%' }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                            style={{ transformOrigin: '50% 0' }}
                            className={cn(
                              "absolute top-full left-1/2 mt-2 p-3 bg-white backdrop-blur-xl border border-gray-100 rounded-xl shadow-xl z-50 text-left",
                              isTwoColumns ? "w-[540px]" : "w-[290px]"
                            )}
                          >
                            <div className={cn("grid gap-2", isTwoColumns ? "grid-cols-2" : "grid-cols-1")}>
                              {categoryTools.map((tool) => (
                                <Link
                                  key={tool.id}
                                  href={tool.href}
                                  className="group flex items-start gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                  <div className={cn(
                                    "flex items-center justify-center shrink-0 w-8 h-8 rounded-md bg-gray-100 group-hover:bg-white group-hover:shadow-sm transition-all",
                                    "text-gray-500 group-hover:text-primary-600"
                                  )}>
                                    <tool.icon className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium text-gray-800 group-hover:text-primary-600 transition-colors">
                                      {tool.title}
                                    </div>
                                    <p className="text-[12px] text-gray-500 line-clamp-1 mt-0.5">
                                      {tool.description}
                                    </p>
                                  </div>
                                </Link>
                              ))}
                              {categoryTools.length === 0 && (
                                <p className={cn("p-3 text-xs text-center text-gray-400", isTwoColumns ? "col-span-2" : "col-span-1")}>
                                  No tools available directly in this menu.
                                </p>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}

                {/* More Dropdown */}
                <div
                  className="relative"
                  onMouseEnter={() => setHoveredCategory('more')}
                  onMouseLeave={() => {
                    setHoveredCategory(null);
                    setActiveSubCategory(null); // Reset active sub-category when leaving 'More'
                  }}
                >
                  <button
                    className={cn(
                      "flex items-center gap-1.5 px-3.5 py-2 text-[14px] font-medium rounded-lg transition-all duration-200 whitespace-nowrap cursor-pointer",
                      CATEGORIES.slice(3).some(c => c.id === effectiveActiveCategory) || hoveredCategory === 'more'
                        ? "text-primary-600 bg-primary-50"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    )}
                  >
                    More
                    <ChevronDown
                      className={cn(
                        "w-3.5 h-3.5 transition-transform duration-200 mt-px",
                        hoveredCategory === 'more' ? "rotate-180" : ""
                      )}
                    />
                  </button>

                  <AnimatePresence>
                    {hoveredCategory === 'more' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
                        exit={{ opacity: 0, y: 5, scale: 0.95, x: '-50%' }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        style={{ transformOrigin: '50% 0' }}
                        className="absolute top-full left-1/2 mt-2 w-[260px] p-2 bg-white backdrop-blur-xl border border-gray-100 rounded-xl shadow-xl z-50 text-left"
                      >
                        <div className="flex flex-col gap-1">
                          {CATEGORIES.slice(3).map((category) => {
                            const categoryTools = TOOLS.filter(t => t.categoryId === category.id);
                            const isTwoColumns = categoryTools.length > 7;

                            return (
                              <div
                                key={category.id}
                                className="relative group/item"
                                onMouseEnter={() => setActiveSubCategory(category.id)}
                                onMouseLeave={() => setActiveSubCategory(null)} // Reset sub-category when leaving this item
                              >
                                <a
                                  href={`#category-${category.id}`}
                                  onClick={(e) => {
                                    handleCategoryClick(e, category.id);
                                    setHoveredCategory(null);
                                    setActiveSubCategory(null); // Close sub-menu on click
                                  }}
                                  className={cn(
                                    "flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors w-full",
                                    effectiveActiveCategory === category.id || activeSubCategory === category.id
                                      ? "bg-primary-50 text-primary-700"
                                      : "hover:bg-gray-50 text-gray-700"
                                  )}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className={cn(
                                      "flex items-center justify-center w-8 h-8 rounded-lg shrink-0 transition-colors",
                                      effectiveActiveCategory === category.id || activeSubCategory === category.id
                                        ? "bg-white text-primary-600"
                                        : "bg-gray-100 text-gray-500 group-hover/item:bg-white group-hover/item:text-primary-600"
                                    )}>
                                      <category.icon className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-medium">{category.name}</span>
                                  </div>
                                  <ChevronDown className="w-3 h-3 rotate-90 text-gray-400 mt-px" />
                                </a>

                                {/* Nested Tool Menu */}
                                <AnimatePresence>
                                  {activeSubCategory === category.id && (
                                    <motion.div
                                      initial={{ opacity: 0, x: 10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      exit={{ opacity: 0, x: 10 }}
                                      transition={{ duration: 0.15, ease: "easeOut" }}
                                      className={cn(
                                        "absolute top-0 right-full mr-2 p-2 bg-white backdrop-blur-xl border border-gray-100 rounded-xl shadow-xl z-50",
                                        isTwoColumns ? "w-[540px]" : "w-[290px]"
                                      )}
                                    >
                                      <div className={cn(
                                        "grid gap-2 max-h-[600px] overflow-y-auto scrollbar-themed",
                                        isTwoColumns ? "grid-cols-2" : "grid-cols-1"
                                      )}>
                                        {categoryTools.map((tool) => (
                                          <Link
                                            key={tool.id}
                                            href={tool.href}
                                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                                          >
                                            <div className="flex items-center justify-center shrink-0 w-8 h-8 rounded-md bg-gray-100 text-gray-500">
                                              <tool.icon className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <div className="text-sm font-medium text-gray-800 line-clamp-1">
                                                {tool.title}
                                              </div>
                                              <div className="text-[11px] text-gray-500 line-clamp-1">
                                                {tool.description}
                                              </div>
                                            </div>
                                          </Link>
                                        ))}
                                        {categoryTools.length === 0 && (
                                          <p className={cn("p-3 text-xs text-center text-gray-400", isTwoColumns ? "col-span-2" : "col-span-1")}>
                                            No tools available.
                                          </p>
                                        )}
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Right side actions - Right aligned */}
            <div className="flex items-center gap-3 shrink-0 ml-auto z-10">
              {/* Search button */}
              <button
                onClick={() => setIsSearchOpen(true)}
                aria-label="Search tools"
                className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 min-w-[180px] cursor-pointer"
              >
                <Search className="w-4 h-4 shrink-0" />
                <span className="text-gray-600">Search tools...</span>
                <kbd className="ml-auto hidden lg:inline-flex items-center gap-1 px-1.5 py-0.5 text-[12px] font-medium text-gray-500 bg-white border border-gray-200 rounded">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </button>

              {/* Mobile search */}
              <button
                onClick={() => setIsSearchOpen(true)}
                aria-label="Search tools"
                className="sm:hidden p-2 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Get Started button */}
              {/* <Link
                href="/sign-up"
                className="hidden sm:inline-flex items-center px-5 py-2.5 text-[14px] font-semibold text-white bg-linear-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 rounded-lg shadow-md shadow-primary-500/20 hover:shadow-lg hover:shadow-primary-500/30 transition-all duration-300"
              >
                Get Started
              </Link> */}

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                className="xl:hidden p-2 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
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
            {/* <Link
              href="/tools"
              onClick={handleAllToolsClick}
              className={cn(
                "flex items-center gap-3 px-4 py-3 text-[15px] font-medium rounded-lg transition-colors",
                effectiveActiveCategory === '' && pathname === '/'
                  ? "text-primary-600 bg-primary-50"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              All Tools
            </Link> */}
            {CATEGORIES.map((category) => (
              <a
                key={category.id}
                href={`#category-${category.id}`}
                onClick={(e) => handleCategoryClick(e, category.id)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 text-[15px] font-medium rounded-lg transition-colors",
                  effectiveActiveCategory === category.id
                    ? "text-primary-600 bg-primary-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                <div className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-lg",
                  effectiveActiveCategory === category.id ? "bg-primary-100" : "bg-gray-100"
                )}>
                  <category.icon className={cn(
                    "w-4 h-4",
                    effectiveActiveCategory === category.id ? "text-primary-600" : "text-gray-500"
                  )} />
                </div>
                {category.name}
              </a>
            ))}
            {/* <div className="pt-3 mt-3 border-t border-gray-200 space-y-2">
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
            </div> */}
          </div>
        </div>
      </nav>
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  );
}
