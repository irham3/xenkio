export const runtime = 'edge';

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/home/hero-section";
import { ToolCardCompact } from "@/components/tools/tool-card-compact";
import { CATEGORIES } from "@/data/categories";
import { TOOLS, type ToolData } from "@/data/tools";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Xenkio - Free Online Productivity Tools & Converters",
  description: "Your ultimate free toolkit for productivity. Merge PDFs, convert images, generate QR codes, and more. No sign-up required—just get it done instantly.",
  keywords: ["online tools", "pdf converter", "image tools", "developer utilities", "qr code generator", "free tools", "no sign up", "xenkio"],
  openGraph: {
    title: "Xenkio - Free Online Productivity Tools",
    description: "Your ultimate free toolkit for productivity. No sign-up required.",
    url: "https://xenkio.com",
    siteName: "Xenkio",
    locale: "en_US",
    type: "website",
  },
  alternates: {
    canonical: "https://xenkio.com",
  },
};

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Xenkio Tools Directory",
    "description": "A comprehensive collection of free online productivity tools including PDF converters, image editing tools, and developer utilities.",
    "url": "https://xenkio.com",
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": CATEGORIES.map((category, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": category.name,
        "url": `https://xenkio.com/tools?category=${category.id}`
      }))
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <HeroSection />

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
                    className="flex items-center justify-center w-14 h-14 rounded-2xl border border-gray-100/50 shadow-sm"
                    style={{ backgroundColor: category.color + '15' }}
                  >
                    <CategoryIcon className="w-7 h-7 text-gray-700" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {category.name}
                    </h2>
                    <p className="text-gray-500 mt-1 max-w-xl">
                      {category.description}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/tools?category=${category.id}`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-primary-600 hover:text-primary-700 bg-white border border-gray-200 hover:border-primary-200 hover:bg-primary-50 rounded-lg transition-all shadow-sm hover:shadow-md"
                >
                  View All
                  {/* {category.toolCount} Tools */}
                  <ArrowRight className="w-4 h-4 ml-0.5" />
                </Link>
              </div>

              {/* Tools Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
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

      <Footer />
    </main>
  );
}
