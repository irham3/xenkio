"use client";

import { CATEGORIES } from "@/lib/data";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function CategoryTabs() {
  const [activeTab, setActiveTab] = useState('all');

  return (
    <div className="sticky top-[80px] z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 h-16 flex items-center shadow-sm">
      <div className="container mx-auto px-4 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 min-w-max">
          <button
            onClick={() => setActiveTab('all')}
            className={cn(
              "px-5 py-2 rounded-lg text-[15px] font-medium transition-all border-b-2",
              activeTab === 'all'
                ? "bg-primary-50 text-primary-600 border-primary-500 rounded-b-none"
                : "text-gray-600 border-transparent hover:bg-gray-100 hover:text-primary-500"
            )}
          >
            All Tools
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={cn(
                "px-5 py-2 rounded-lg text-[15px] font-medium transition-all border-b-2",
                activeTab === cat.id
                  ? "bg-primary-50 text-primary-600 border-primary-500 rounded-b-none"
                  : "text-gray-600 border-transparent hover:bg-gray-100 hover:text-primary-500"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
