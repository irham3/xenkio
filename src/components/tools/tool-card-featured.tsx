'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles, Crown } from 'lucide-react';
import SpotlightCard from '@/components/reactbits/spotlight-card';

import { DUMMY_TOOLS } from '@/data/tools';

interface ToolCardFeaturedProps {
  id: string; // id is now required
  title: string;
  description: string;
  href: string;
  usageCount?: string;
  stats?: string;
  isNew?: boolean;
  isPremium?: boolean;
  gradientFrom?: string;
  gradientTo?: string;
}

export function ToolCardFeatured({
  id,
  title,
  description,
  href,
  stats,
  isNew,
  isPremium,
  gradientFrom = '#3B82F6',
  gradientTo = '#1D4ED8',
}: ToolCardFeaturedProps) {
  const tool = DUMMY_TOOLS.find(t => t.id === id);
  const Icon = tool?.icon || Sparkles; // Fallback

  return (
    <Link href={href} className="block h-full group">
      <SpotlightCard
        className="h-full border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300"
        spotlightColor="rgba(14, 165, 233, 0.15)"
      >
        <div className="relative z-10 h-full flex flex-col">
          {/* Badges */}
          <div className="absolute top-0 right-0 flex items-center gap-2">
            {isNew && (
              <span className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-primary-700 bg-primary-50 rounded-full border border-primary-100">
                <Sparkles className="w-3 h-3" />
                New
              </span>
            )}
            {isPremium && (
              <span className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-amber-700 bg-amber-50 rounded-full border border-amber-100">
                <Crown className="w-3 h-3" />
                Pro
              </span>
            )}
          </div>

          {/* Icon */}
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 shadow-lg transform group-hover:scale-105 transition-transform duration-300"
            style={{
              background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)`,
              boxShadow: `0 8px 20px ${gradientFrom}30`
            }}
          >
            <Icon className="w-8 h-8 text-white" strokeWidth={1.5} />
          </div>

          {/* Content */}
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
              {title}
            </h3>
            <p className="text-[15px] text-gray-600 mb-6 leading-relaxed line-clamp-2">
              {description}
            </p>
          </div>

          {/* Stats and CTA */}
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
            {stats && (
              <span className="text-sm text-gray-500 font-medium">{stats}</span>
            )}
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 group-hover:translate-x-1 transition-transform duration-300">
              Try Now
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </SpotlightCard>
    </Link>
  );
}
