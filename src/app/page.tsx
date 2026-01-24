import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/home/hero-section";
import { CategoryTabs } from "@/components/home/category-tabs";
import { ToolCardFeatured } from "@/components/tools/tool-card-featured";
import { ToolCardCompact } from "@/components/tools/tool-card-compact";
import { StatsBanner } from "@/components/home/stats-banner";
import { CATEGORIES, TOOLS } from "@/lib/data";

export default function Home() {
  const featuredTools = TOOLS.filter(t => t.featured);

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />
      <HeroSection />
      <CategoryTabs />

      {/* Popular Tools / Featured - Bento-ish Grid */}
      <section className="py-16 container mx-auto px-4">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-8 flex items-center gap-3">
          Most Popular Tools
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* First one is large featured card */}
          <div className="lg:col-span-2">
            {featuredTools[0] && (
              <ToolCardFeatured
                {...featuredTools[0]}
                stats={featuredTools[0].stats || ''}
              />
            )}
          </div>
          {/* Side column with compact cards */}
          <div className="flex flex-col gap-6">
            {featuredTools.slice(1, 3).map(tool => (
              <ToolCardCompact key={tool.id} {...tool} />
            ))}
          </div>
        </div>
      </section>

      {/* Category Sections */}
      {CATEGORIES.map((category) => {
        const categoryTools = TOOLS.filter(t => t.categoryId === category.id);

        return (
          <section key={category.id} className="py-16 border-y border-gray-100 bg-white">
            <div className="container mx-auto px-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white rounded-xl shadow-sm text-gray-800">
                    <category.icon className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{category.name}</h2>
                    <p className="text-gray-600 text-sm mt-1">{category.description}</p>
                  </div>
                </div>
                <button className="text-primary-600 font-semibold hover:text-primary-700 transition-colors bg-white/50 hover:bg-white px-4 py-2 rounded-lg text-sm">
                  View All {category.toolCount} Tools →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {/* Show matched tools */}
                {categoryTools.map(tool => (
                  <ToolCardCompact key={tool.id} {...tool} />
                ))}
                {/* Fill with some placeholders to create a nice grid effect even with dummy data */}
                {Array.from({ length: Math.max(0, 5 - categoryTools.length) }).map((_, i) => (
                  <ToolCardCompact
                    key={`placeholder-${category.id}-${i}`}
                    title={`${category.name} Tool ${i + 1}`}
                    description={`Professional ${category.name.toLowerCase()} tool for your workflow.`}
                    icon={category.icon}
                    href="#"
                    usageCount={`${(Math.random() * 10).toFixed(1)}k`}
                  />
                ))}
              </div>
            </div>
          </section>
        )
      })}

      <StatsBanner />
      <Footer />
    </main>
  );
}
