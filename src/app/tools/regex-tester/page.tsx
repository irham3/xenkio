export const runtime = 'edge';

import { Metadata } from 'next';
import { DUMMY_TOOLS } from '@/data/tools';
import { RegexTesterClient } from './client';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Regex Tester 2025 - Test & Debug Regular Expressions Online',
  description: 'Test, debug, and validate regular expressions with real-time matching, syntax highlighting, and match details. Free online regex tester with common patterns and quick reference guide.',
  keywords: ['regex tester', 'regular expression tester', 'regex validator', 'regex debugger', 'regex pattern matcher', 'regex online', 'regex editor', '2025'],
  openGraph: {
    title: 'Regex Tester 2025 | Xenkio',
    description: 'Test and debug regular expressions online with live matching and syntax highlighting.',
    type: 'website',
  }
};

export default function RegexTesterPage() {
  const tool = DUMMY_TOOLS.find(t => t.href === '/tools/regex-tester');

  if (!tool) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      {/* Tool Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{tool.title}</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">{tool.description}</p>
      </div>

      {/* Feature UI (Client Component) */}
      <RegexTesterClient />
    </div>
  );
}
