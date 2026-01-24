import { ArrowRight, Star, LucideIcon } from "lucide-react";
import Link from "next/link";

interface ToolCardFeaturedProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  stats: string;
  badge?: string;
}

export function ToolCardFeatured({ title, description, icon: Icon, href, stats, badge }: ToolCardFeaturedProps) {
  return (
    <div className="group relative bg-white border border-gray-200 rounded-2xl p-8 transition-all duration-300 hover:border-primary-500 hover:shadow-primary hover:-translate-y-1 overflow-hidden">
      {/* Optional gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div className="h-16 w-16 bg-primary-50 rounded-xl flex items-center justify-center text-primary-500 group-hover:bg-primary-500 group-hover:text-white transition-colors duration-300 shadow-sm">
            <Icon className="w-8 h-8" />
          </div>
          {badge && (
            <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
              {badge}
            </span>
          )}
        </div>

        <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
          {title}
        </h3>

        <p className="text-gray-600 mb-4 line-clamp-2">
          {description}
        </p>

        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 font-medium">
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          <span>{stats}</span>
        </div>

        <Link
          href={href}
          className="inline-flex items-center justify-center px-5 py-2.5 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-lg font-semibold hover:brightness-110 transition-all w-full sm:w-auto shadow-sm"
        >
          Try Now <ArrowRight className="ml-2 w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
