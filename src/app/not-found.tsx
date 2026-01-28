import Link from 'next/link';
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ArrowLeft, Home, Search, Compass, Ghost } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-6 relative overflow-hidden my-16">
        {/* Background decorative elements */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary-100 rounded-full blur-3xl opacity-30 animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-accent-100 rounded-full blur-3xl opacity-30 animate-pulse delay-1000" />

        <div className="max-w-xl w-full text-center relative z-10">
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <Ghost className="w-24 h-24 text-primary-500 animate-bounce" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Oops! Something went wrong
          </h2>

          <p className="text-gray-600 mb-10 text-lg leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
            Don&apos;t worry, there are 130+ other tools waiting for you!
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-linear-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/20 hover:shadow-xl hover:shadow-primary-500/30 hover:scale-[1.02] active:scale-95 transition-all"
            >
              <Home className="w-4 h-4" />
              Go Home
            </Link>

            <Link
              href="/tools"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all"
            >
              <Search className="w-4 h-4" />
              Browse Tools
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
