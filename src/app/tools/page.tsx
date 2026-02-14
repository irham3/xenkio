

import { ToolCardCompact } from "@/components/tools/tool-card-compact";
import { TOOLS as TOOLS, type ToolData } from "@/data/tools";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore All Online Tools",
  description: "Browse our curated collection of free online tools for PDF, image editing, security, and development.",
};

interface Props {
  searchParams: Promise<{ category?: string; page?: string }>;
}

export default async function ToolsPage({ searchParams }: Props) {
  const { category, page } = await searchParams;
  const ITEMS_PER_PAGE = 20;
  const currentPage = parseInt(page || "1", 10);

  let filteredTools = TOOLS;
  if (category && category !== 'all') {
    filteredTools = TOOLS.filter((t: ToolData) => t.categoryId === category);
  }

  const totalPages = Math.ceil(filteredTools.length / ITEMS_PER_PAGE);
  const paginatedTools = filteredTools.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">All Productivity Tools</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Free online tools for developers, designers, and everyone.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {paginatedTools.map((tool: ToolData) => (
          <ToolCardCompact
            key={tool.id}
            id={tool.id}
            title={tool.title}
            description={tool.description}
            href={tool.href}
            isNew={tool.isNew}
            isPremium={tool.isPremium}
            isComingSoon={tool.isComingSoon}
          />
        ))}
      </div>

      {/* Pagination component would go here */}
      {totalPages > 1 && (
        <div className="mt-12 flex justify-center gap-2">
          {/* Simple pagination links for SEO */}
          {currentPage > 1 && (
            <a
              href={`/tools?page=${currentPage - 1}${category ? `&category=${category}` : ''}`}
              rel="prev"
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Previous
            </a>
          )}
          {currentPage < totalPages && (
            <a
              href={`/tools?page=${currentPage + 1}${category ? `&category=${category}` : ''}`}
              rel="next"
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Next
            </a>
          )}
        </div>
      )}
    </div>
  );
}
