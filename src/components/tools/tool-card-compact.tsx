'use client';

import Link from 'next/link';
import { ArrowUpRight, Sparkles, Crown } from 'lucide-react';
import { motion } from 'framer-motion';

import { DUMMY_TOOLS } from '@/data/dummy-tools';

interface ToolCardCompactProps {
  id: string;
  title: string;
  description: string;
  href: string;
  usageCount?: string;
  isNew?: boolean;
  isPremium?: boolean;
  categoryId?: string;
}

export function ToolCardCompact({
  id,
  title,
  description,
  href,
  usageCount,
  isNew,
  isPremium,
}: ToolCardCompactProps) {
  const tool = DUMMY_TOOLS.find(t => t.id === id);
  const Icon = tool?.icon || Sparkles;

  return (
    <Link href={href} className="block group">
      <motion.div
        whileHover={{ y: -3 }}
        transition={{ duration: 0.2 }}
        className="relative h-full p-5 rounded-xl bg-white border border-gray-200 hover:border-primary-200 hover:shadow-lg hover:shadow-primary-500/5 transition-all duration-300"
      >
        {/* Badges */}
        {(isNew || isPremium) && (
          <div className="absolute top-3 right-3">
            {isNew && (
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-50">
                <Sparkles className="w-3 h-3 text-primary-600" />
              </span>
            )}
            {isPremium && (
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-50">
                <Crown className="w-3 h-3 text-amber-600" />
              </span>
            )}
          </div>
        )}

        {/* Icon */}
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gray-50 group-hover:bg-primary-50 mb-4 transition-colors">
          <Icon className="w-6 h-6 text-gray-600 group-hover:text-primary-600 transition-colors" strokeWidth={1.5} />
        </div>

        {/* Content */}
        <h3 className="text-[15px] font-semibold text-gray-900 mb-1.5 group-hover:text-primary-600 transition-colors line-clamp-1">
          {title}
        </h3>
        <p className="text-sm text-gray-500 mb-3 line-clamp-1">
          {description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          {usageCount && (
            <span className="text-xs text-gray-400">{usageCount} uses</span>
          )}
          <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-primary-500 transition-colors ml-auto" />
        </div>
      </motion.div>
    </Link>
  );
}
