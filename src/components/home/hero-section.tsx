import { Search } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-primary-100 to-primary-200 py-20 px-4">
      <div className="container mx-auto max-w-4xl text-center">
        <h1 className="text-4xl md:text-[56px] font-extrabold text-gray-900 mb-4 tracking-tight leading-[1.1]">
          Every Tool You Need.<br />
          <span className="text-primary-600">One Platform.</span>
        </h1>
        <p className="text-lg md:text-[20px] text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
          Process files instantly. No signup required. Access over 100+ tools for developers, designers, and data analysts.
        </p>

        {/* Search Bar */}
        <div className="relative max-w-xl mx-auto group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary-300 to-primary-400 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-200"></div>
          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search for tools (e.g. JSON Formatter, PDF to Word)..."
              className="w-full h-14 pl-12 pr-4 rounded-xl border-2 border-gray-200 bg-white shadow-medium focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-100 transition-all text-gray-900 placeholder:text-gray-400"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
