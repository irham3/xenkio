import { ArrowRight, LucideIcon } from "lucide-react";
import Link from "next/link";

interface ToolCardCompactProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  usageCount?: string;
}

export function ToolCardCompact({ title, description, icon: Icon, href, usageCount }: ToolCardCompactProps) {
  return (
    <Link href={href} className="group flex flex-col h-full bg-white border border-gray-200 rounded-xl p-5 hover:border-primary-200 hover:shadow-primary hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="h-12 w-12 bg-primary-50 rounded-lg flex items-center justify-center text-primary-500 group-hover:scale-110 transition-transform duration-200 shadow-sm">
          <Icon className="w-6 h-6" />
        </div>
      </div>

      <h3 className="text-[16px] font-semibold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
        {title}
      </h3>

      <p className="text-[14px] text-gray-500 line-clamp-2 mb-4 flex-grow leading-relaxed">
        {description}
      </p>

      {usageCount && (
        <div className="text-[13px] text-gray-400 mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
          <span>{usageCount} uses today</span>
          <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 text-primary-500" />
        </div>
      )}
    </Link>
  )
}
