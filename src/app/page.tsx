'use client';

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/home/hero-section";
import { CategoryTabs } from "@/components/home/category-tabs";
import { ToolCardFeatured } from "@/components/tools/tool-card-featured";
import { ToolCardCompact } from "@/components/tools/tool-card-compact";
import { StatsBanner } from "@/components/home/stats-banner";
import { CATEGORIES, TOOLS } from "@/lib/data";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const featuredTools = TOOLS.filter(t => t.featured);

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />
      <HeroSection />
      <CategoryTabs />

      {/* Popular Tools - Featured Bento Grid */}
      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Most Popular Tools
              </h2>
              <p className="mt-2 text-gray-600">
                Trusted by millions of users worldwide
              </p>
            </div>
            <Link
              href="/tools"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
            >
              View all tools
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Large featured card */}
            <div className="lg:col-span-6">
              {featuredTools[0] && (
                <ToolCardFeatured
                  {...featuredTools[0]}
                />
              )}
            </div>

            {/* Right column - two compact cards stacked */}
            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
              {featuredTools.slice(1, 3).map(tool => (
                <ToolCardFeatured
                  key={tool.id}
                  {...tool}
                />
              ))}
            </div>
          </div>

          {/* Second row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
            {featuredTools.slice(3, 4).map(tool => (
              <ToolCardFeatured
                key={tool.id}
                {...tool}
              />
            ))}
            {/* Fill with compact cards */}
            {TOOLS.filter(t => !t.featured).slice(0, 3).map(tool => (
              <ToolCardCompact
                key={tool.id}
                {...tool}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Category Sections */}
      {CATEGORIES.map((category, index) => {
        const categoryTools = TOOLS.filter(t => t.categoryId === category.id);
        const isEven = index % 2 === 0;
        const CategoryIcon = category.icon;

        return (
          <section
            key={category.id}
            id={`category-${category.id}`}
            className={`py-16 lg:py-20 ${isEven ? 'bg-white' : 'bg-gray-50'}`}
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {/* Category Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className="flex items-center justify-center w-14 h-14 rounded-2xl"
                    style={{ backgroundColor: category.backgroundColor }}
                  >
                    <CategoryIcon className="w-7 h-7 text-gray-700" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {category.name}
                    </h2>
                    <p className="text-gray-500 mt-0.5">
                      {category.description}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/tools?category=${category.id}`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
                >
                  View All {category.toolCount} Tools
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Tools Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
                {categoryTools.slice(0, 10).map(tool => (
                  <ToolCardCompact
                    key={tool.id}
                    {...tool}
                  />
                ))}
              </div>
            </div>
          </section>
        );
      })}

      <StatsBanner />
      <Footer />
    </main>
  );
}
