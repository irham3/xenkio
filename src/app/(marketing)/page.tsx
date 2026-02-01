export const runtime = 'edge';

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/home/hero-section";
import { ToolCardCompact } from "@/components/tools/tool-card-compact";
import { StatsBanner } from "@/components/home/stats-banner";
import { CATEGORIES } from "@/data/categories";
import { TOOLS as TOOLS, type ToolData } from "@/data/tools";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Xenkio - All-in-One Online Productivity Tools",
  description: "Free online tools for PDF, image compression, QR codes, password generation, and developer utilities. No signup required.",
};


export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />
      <HeroSection />

      {/* Popular Tools - Featured Bento Grid */}
      {/* <section className="py-16 lg:py-20"> */}
      {/* <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"> */}
      {/* Section Header */}
      {/* <div className="flex items-center justify-between mb-10">
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
          </div> */}

      {/* Bento Grid */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-12 gap-6"> */}
      {/* Large featured card */}
      {/* <div className="lg:col-span-6">
              {featuredTools[0] && (
                <ToolCardFeatured
                  id={featuredTools[0].id}
                  title={featuredTools[0].title}
                  description={featuredTools[0].description}
                  href={featuredTools[0].href}
                  stats={featuredTools[0].stats}
                  isNew={featuredTools[0].isNew}
                  isPremium={featuredTools[0].isPremium}
                  gradientFrom={featuredTools[0].gradientFrom}
                  gradientTo={featuredTools[0].gradientTo}
                />
              )}
            </div>
            */}
      {/* Right column - two compact cards stacked */}
      {/* <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
              {featuredTools.slice(1, 3).map((tool: ToolData) => (
                <ToolCardFeatured
                  key={tool.id}
                  id={tool.id}
                  title={tool.title}
                  description={tool.description}
                  href={tool.href}
                  stats={tool.stats}
                  isNew={tool.isNew}
                  isPremium={tool.isPremium}
                  gradientFrom={tool.gradientFrom}
                  gradientTo={tool.gradientTo}
                />
              ))}
            </div>
            </div>

          {/* Second row */}
      {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
            {featuredTools.slice(3, 4).map((tool: ToolData) => (
              <ToolCardFeatured
                key={tool.id}
                id={tool.id}
                title={tool.title}
                description={tool.description}
                href={tool.href}
                stats={tool.stats}
                isNew={tool.isNew}
                isPremium={tool.isPremium}
                gradientFrom={tool.gradientFrom}
                gradientTo={tool.gradientTo}
              />
            ))}
            */}
      {/* Fill with compact cards */}
      {/* {TOOLS.filter((t: ToolData) => !t.featured).slice(0, 3).map((tool: ToolData) => (
              <ToolCardCompact
                key={tool.id}
                id={tool.id}
                title={tool.title}
                description={tool.description}
                href={tool.href}
                usageCount={tool.usageCount}
                isNew={tool.isNew}
                isPremium={tool.isPremium}
              />
            ))}
          </div> */}
      {/* </div> */}
      {/* </section>  */}

      {/* Category Sections */}
      {CATEGORIES.map((category, index) => {
        const categoryTools = TOOLS.filter((t: ToolData) => t.categoryId === category.id);
        const isEven = index % 2 === 0;
        const CategoryIcon = category.icon;

        return (
          <section
            key={category.id}
            id={`category-${category.id}`}
            className={`py-16 lg:py-20 ${!isEven ? 'bg-white' : 'bg-gray-50'}`}
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {/* Category Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className="flex items-center justify-center w-14 h-14 rounded-2xl"
                    style={{ backgroundColor: category.color + '20' }}
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
                  View All
                  {/* {category.toolCount} Tools */}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Tools Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
                {categoryTools.slice(0, 10).map((tool: ToolData) => (
                  <ToolCardCompact
                    key={tool.id}
                    id={tool.id}
                    title={tool.title}
                    description={tool.description}
                    href={tool.href}
                    isNew={tool.isNew}
                    isPremium={tool.isPremium}
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
