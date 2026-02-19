import Link from 'next/link';
import { ArrowUpRight, Crown, type LucideIcon } from 'lucide-react';

interface ToolCardCompactProps {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  isNew?: boolean;
  isPremium?: boolean;
  isComingSoon?: boolean;
  categoryId?: string;
}

export function ToolCardCompact({
  title,
  description,
  href,
  icon: Icon,
  isNew,
  isPremium,
  isComingSoon,
}: ToolCardCompactProps) {

  const CardContent = (
    <div
      className={`relative h-full p-5 rounded-xl border transition-all duration-300 ${isComingSoon
        ? 'cursor-not-allowed bg-gray-100/50 border-gray-200'
        : 'bg-white border-gray-200 hover:border-primary-200 hover:shadow-lg hover:shadow-primary-500/5 hover:-translate-y-1'
        }`}
    >
      {/* Badges */}
      {(isNew || isPremium || isComingSoon) && (
        <div className="absolute top-3 right-3 flex items-center gap-2">
          {isComingSoon && (
            <span className="px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase text-gray-700 bg-gray-100 rounded-full border border-gray-200">
              Soon
            </span>
          )}
          {isNew && !isComingSoon && (
            <span className="flex items-center justify-center w-6 h-6">
              <span className="w-2.5 h-2.5 rounded-full bg-primary-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] animate-pulse" />
            </span>
          )}
          {isPremium && (
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-50">
              <Crown className="w-3 h-3 text-amber-600" />
            </span>
          )}
        </div>
      )}

      {/* Icon - No background */}
      <div className={`inline-flex items-center justify-center w-10 h-10 mb-4 transition-transform duration-300 ${isComingSoon ? 'opacity-50' : 'group-hover:scale-110'}`}>
        <Icon className={`w-6 h-6 text-gray-600 transition-colors ${!isComingSoon && 'group-hover:text-primary-600'}`} strokeWidth={1.5} />
      </div>

      {/* Content */}
      <h3 className={`text-[15px] font-semibold text-gray-900 mb-1.5 transition-colors line-clamp-1 ${!isComingSoon && 'group-hover:text-primary-600'}`}>
        {title}
      </h3>
      <p className="text-sm text-gray-700 mb-3 line-clamp-2 leading-relaxed">
        {description}
      </p>

      {/* Footer - Arrow only */}
      {!isComingSoon && (
        <div className="flex items-center justify-end">
          <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-primary-500 transition-colors" />
        </div>
      )}
    </div>
  );

  if (isComingSoon) {
    return <div className="block h-full">{CardContent}</div>;
  }

  return (
    <Link href={href} className="block group h-full">
      {CardContent}
    </Link>
  );
}
