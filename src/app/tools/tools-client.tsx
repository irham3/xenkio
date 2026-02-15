"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ToolCardCompact } from "@/components/tools/tool-card-compact";
import { TOOLS, type ToolData } from "@/data/tools";
import { CATEGORIES } from "@/data/categories";

const ITEMS_PER_PAGE = 20;

function ToolsGrid() {
    const searchParams = useSearchParams();
    const category = searchParams.get("category") || undefined;
    const page = searchParams.get("page") || "1";
    const currentPage = parseInt(page, 10);

    let filteredTools = TOOLS;
    if (category && category !== "all") {
        filteredTools = TOOLS.filter((t: ToolData) => t.categoryId === category);
    }

    const totalPages = Math.ceil(filteredTools.length / ITEMS_PER_PAGE);
    const paginatedTools = filteredTools.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const activeCategory = CATEGORIES.find((c) => c.id === category);

    return (
        <>
            {/* Category Filter Tabs */}
            <div className="flex flex-wrap gap-2 justify-center mb-10">
                <a
                    href="/tools"
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${!category
                            ? "bg-primary-600 text-white shadow-sm"
                            : "bg-white text-gray-600 border border-gray-200 hover:border-primary-200 hover:bg-primary-50"
                        }`}
                >
                    All Tools
                </a>
                {CATEGORIES.map((cat) => (
                    <a
                        key={cat.id}
                        href={`/tools?category=${cat.id}`}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${category === cat.id
                                ? "bg-primary-600 text-white shadow-sm"
                                : "bg-white text-gray-600 border border-gray-200 hover:border-primary-200 hover:bg-primary-50"
                            }`}
                    >
                        {cat.name}
                    </a>
                ))}
            </div>

            {activeCategory && (
                <p className="text-center text-gray-500 mb-8">
                    Showing {filteredTools.length} tools in{" "}
                    <strong>{activeCategory.name}</strong>
                </p>
            )}

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

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-12 flex justify-center gap-2">
                    {currentPage > 1 && (
                        <a
                            href={`/tools?page=${currentPage - 1}${category ? `&category=${category}` : ""}`}
                            rel="prev"
                            className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Previous
                        </a>
                    )}
                    {currentPage < totalPages && (
                        <a
                            href={`/tools?page=${currentPage + 1}${category ? `&category=${category}` : ""}`}
                            rel="next"
                            className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Next
                        </a>
                    )}
                </div>
            )}
        </>
    );
}

export function ToolsPageClient() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-7xl">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
                    All Productivity Tools
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Free online tools for developers, designers, and everyone.
                </p>
            </div>

            <Suspense
                fallback={
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {Array.from({ length: 10 }).map((_, i) => (
                            <div
                                key={i}
                                className="h-32 bg-gray-100 rounded-xl animate-pulse"
                            />
                        ))}
                    </div>
                }
            >
                <ToolsGrid />
            </Suspense>
        </div>
    );
}
