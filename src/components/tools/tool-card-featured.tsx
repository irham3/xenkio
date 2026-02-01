'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles, Crown } from 'lucide-react';
import SpotlightCard from '@/components/reactbits/spotlight-card';

import { TOOLS } from '@/data/tools';

interface ToolCardFeaturedProps {
  id: string;
  title: string;
  description: string;
  href: string;
  isNew?: boolean;
  isPremium?: boolean;
}

export function ToolCardFeatured({
  id,
  title,
  description,
  href,
  isNew,
  isPremium,
}: ToolCardFeaturedProps) {
  const tool = TOOLS.find(t => t.id === id);
  const Icon = tool?.icon || Sparkles;

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

          {/* Icon - Clean, no gradient background */}
          <div className="inline-flex items-center justify-center w-14 h-14 mb-6">
            <Icon className="w-8 h-8 text-gray-600 group-hover:text-primary-600 transition-colors" strokeWidth={1.5} />
          </div>

          {/* Content */}
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
              {title}
            </h3>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed line-clamp-2">
              {description}
            </p>
          </div>

          {/* CTA */}
          <div className="flex items-center justify-end mt-auto pt-4 border-t border-gray-100">
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
