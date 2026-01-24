import Link from 'next/link';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Navbar() {
  return (
    <nav className="h-[80px] bg-white border-b border-gray-200 shadow-soft sticky top-0 z-50">
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-gray-900">
          Xenkio
        </Link>

        {/* Center Links */}
        <div className="hidden md:flex items-center gap-8">
          {['All Tools', 'Pricing', 'API'].map((item) => (
            <Link key={item} href="#" className="text-gray-600 hover:text-primary-500 font-medium transition-colors">
              {item}
            </Link>
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <button className="p-2 text-gray-600 hover:text-primary-500 transition-colors">
            <Search className="w-5 h-5" />
          </button>
          <Link href="#" className="hidden sm:block px-6 py-2.5 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-lg hover:brightness-110 font-semibold transition-all shadow-primary">
            Sign In
          </Link>
        </div>
      </div>
    </nav>
  );
}
