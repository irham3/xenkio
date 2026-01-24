'use client';

import { useState, useEffect, useRef } from 'react';
import { CATEGORIES } from '@/lib/data';
import { cn } from '@/lib/utils';
import { LayoutGrid } from 'lucide-react';

export function CategoryTabs() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [isSticky, setIsSticky] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSticky(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: '-74px 0px 0px 0px' }
    );

    const sentinel = document.getElementById('category-tabs-sentinel');
    if (sentinel) {
      observer.observe(sentinel);
    }

    return () => observer.disconnect();
  }, []);

  const scrollToCategory = (categoryId: string) => {
    setActiveCategory(categoryId);

    if (categoryId === 'all') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const element = document.getElementById(`category-${categoryId}`);
    if (element) {
      const offset = 160;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: elementPosition - offset, behavior: 'smooth' });
    }
  };

  return (
    <>
      <div id="category-tabs-sentinel" className="h-0" />
      <div
        ref={containerRef}
        className={cn(
          'sticky top-[74px] z-40 transition-all duration-300',
          isSticky
            ? 'bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm'
            : 'bg-transparent'
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div
            ref={tabsRef}
            className="flex items-center gap-2 py-4 overflow-x-auto no-scrollbar"
          >
            {/* All Tools tab */}
            <button
              onClick={() => scrollToCategory('all')}
              className={cn(
                'flex items-center gap-2 px-5 py-2.5 text-[14px] font-medium rounded-full whitespace-nowrap transition-all duration-200',
                activeCategory === 'all'
                  ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              )}
            >
              <LayoutGrid className="w-4 h-4" />
              All Tools
            </button>

            {/* Category tabs */}
            {CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => scrollToCategory(category.id)}
                className={cn(
                  'flex items-center gap-2 px-5 py-2.5 text-[14px] font-medium rounded-full whitespace-nowrap transition-all duration-200',
                  activeCategory === category.id
                    ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                )}
              >
                <category.icon className="w-4 h-4" />
                {category.name}
                <span className={cn(
                  'text-xs px-1.5 py-0.5 rounded-full',
                  activeCategory === category.id
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-200 text-gray-500'
                )}>
                  {category.toolCount}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
