'use client';

import { useState } from 'react';
import { HashGenerate } from '@/features/hash-generator/components/hash-generate';
import { HashVerify } from '@/features/hash-generator/components/hash-verify';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

type TabMode = 'generate' | 'verify';

export default function HashGeneratorClient() {
  const [activeTab, setActiveTab] = useState<TabMode>('generate');

  return (
    <div className="w-full">
      {/* Tab Switcher */}
      <div className="flex items-center gap-1 p-1 bg-gray-100/80 rounded-xl mb-6 w-full border border-gray-200">
        <button
          onClick={() => setActiveTab('generate')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
            activeTab === 'generate'
              ? "bg-white text-primary-600 shadow-sm border border-gray-100"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
          )}
        >
          Generate
        </button>
        <button
          onClick={() => setActiveTab('verify')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
            activeTab === 'verify'
              ? "bg-white text-primary-600 shadow-sm border border-gray-100"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
          )}
        >
          Verify
        </button>
      </div>

      {/* Content Area - Both components stay mounted to preserve state */}
      <div className="relative">
        <motion.div
          animate={{
            opacity: activeTab === 'generate' ? 1 : 0,
            x: activeTab === 'generate' ? 0 : -20,
            pointerEvents: activeTab === 'generate' ? 'auto' : 'none',
          }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className={cn(
            activeTab === 'generate' ? 'relative' : 'absolute inset-0'
          )}
        >
          <HashGenerate />
        </motion.div>

        <motion.div
          animate={{
            opacity: activeTab === 'verify' ? 1 : 0,
            x: activeTab === 'verify' ? 0 : 20,
            pointerEvents: activeTab === 'verify' ? 'auto' : 'none',
          }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className={cn(
            activeTab === 'verify' ? 'relative' : 'absolute inset-0'
          )}
        >
          <HashVerify />
        </motion.div>
      </div>
    </div>
  );
}
