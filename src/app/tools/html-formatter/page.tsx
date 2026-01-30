import { Metadata } from 'next';
import HtmlFormatterClient from './client';
import { Code2 } from 'lucide-react';

export const runtime = 'edge';

export const metadata: Metadata = {
  title: 'HTML Formatter & Beautifier | Free Online HTML Prettifier',
  description: 'Format, beautify, and minify HTML code instantly. Free online tool with customizable indentation, attribute wrapping, and live preview. No signup required.',
  keywords: ['html formatter', 'html beautifier', 'html prettifier', 'format html online', 'beautify html', 'html minifier', 'html code formatter', 'pretty print html', 'html indentation'],
  openGraph: {
    title: 'HTML Formatter & Beautifier | Free Online Tool',
    description: 'Format, beautify, and minify HTML code instantly with customizable options. 100% client-side processing.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HTML Formatter & Beautifier',
    description: 'Format and beautify HTML code instantly with customizable indentation options.',
  },
};

export default function HtmlFormatterPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-white">
        <div className="container mx-auto px-4 pt-16 pb-12 max-w-5xl">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600 mb-4">
              <Code2 className="w-3.5 h-3.5" />
              100% Client-Side Processing
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight">
              HTML Formatter
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Beautify and format your HTML code with proper indentation and structure
            </p>
          </div>
        </div>
      </section>

      {/* Tool Section */}
      <section className="container mx-auto px-4 max-w-5xl">
        <HtmlFormatterClient />
      </section>

      {/* SEO Content */}
      <section className="bg-white">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Why Format HTML?</h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-gray-800">Readability</strong> — Properly formatted HTML with consistent 
                  indentation makes code easier to read, understand, and maintain. Essential for team collaboration.
                </p>
                <p>
                  <strong className="text-gray-800">Debugging</strong> — When HTML is well-structured with clear 
                  hierarchy, finding and fixing issues becomes significantly faster.
                </p>
                <p>
                  <strong className="text-gray-800">Code Review</strong> — Clean, formatted code is easier to 
                  review and reduces the chance of bugs slipping through.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Features</h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-gray-800">Customizable Indentation</strong> — Choose between spaces 
                  or tabs, and set your preferred indent size (2, 4, or 8 characters).
                </p>
                <p>
                  <strong className="text-gray-800">Attribute Wrapping</strong> — Control how HTML attributes 
                  are formatted with multiple wrapping options for long attribute lists.
                </p>
                <p>
                  <strong className="text-gray-800">Minification</strong> — Compress HTML by removing 
                  unnecessary whitespace and comments for production-ready code.
                </p>
              </div>
            </div>
          </div>

          {/* Additional SEO Content */}
          <div className="mt-12 pt-12 border-t border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">How to Use the HTML Formatter</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 font-bold text-sm mb-3">
                  1
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Paste Your HTML</h3>
                <p className="text-sm text-gray-600">
                  Paste your unformatted HTML code into the input field or load a sample to see how it works.
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 font-bold text-sm mb-3">
                  2
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Customize Options</h3>
                <p className="text-sm text-gray-600">
                  Adjust indentation style, size, and advanced options like attribute wrapping to match your preferences.
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 font-bold text-sm mb-3">
                  3
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Copy or Download</h3>
                <p className="text-sm text-gray-600">
                  Copy the formatted HTML to clipboard or download it as a file. Results update in real-time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
