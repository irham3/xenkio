'use client';

import { useState, useCallback } from 'react';
import { Copy, Check, Trash2, FileEdit, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type UnitType = 'paragraphs' | 'sentences' | 'words';

interface UnitOption {
  key: UnitType;
  label: string;
}

const UNIT_OPTIONS: UnitOption[] = [
  { key: 'paragraphs', label: 'Paragraphs' },
  { key: 'sentences', label: 'Sentences' },
  { key: 'words', label: 'Words' },
];

const MIN_COUNT = 1;
const MAX_COUNT = 100;

const LOREM_WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
  'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
  'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
  'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
  'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
  'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
  'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
  'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum', 'perspiciatis', 'unde',
  'omnis', 'iste', 'natus', 'error', 'voluptatem', 'accusantium', 'doloremque',
  'laudantium', 'totam', 'rem', 'aperiam', 'eaque', 'ipsa', 'quae', 'ab', 'illo',
  'inventore', 'veritatis', 'quasi', 'architecto', 'beatae', 'vitae', 'dicta',
  'explicabo', 'nemo', 'ipsam', 'quia', 'voluptas', 'aspernatur', 'aut', 'odit',
  'fugit', 'consequuntur', 'magni', 'dolores', 'eos', 'ratione', 'sequi',
  'nesciunt', 'neque', 'porro', 'quisquam', 'nihil', 'impedit', 'quo', 'minus',
  'placeat', 'facere', 'possimus', 'assumenda', 'repellendus', 'temporibus',
  'quibusdam', 'illum',
  'at', 'vero', 'accusamus', 'iusto', 'odio', 'dignissimos', 'ducimus',
  'blanditiis', 'praesentium', 'voluptatum', 'deleniti', 'atque', 'corrupti',
  'quos', 'quas', 'molestias', 'excepturi', 'occaecati', 'cupiditate',
  'provident', 'similique', 'mollitia', 'animi', 'dolorem', 'fuga',
  'harum', 'quidem', 'rerum', 'facilis', 'expedita', 'distinctio',
  'nam', 'libero', 'tempore', 'cum', 'soluta', 'nobis', 'eligendi',
  'optio', 'cumque', 'recusandae', 'sapiente', 'delectus', 'reiciendis',
  'voluptatibus', 'maiores', 'alias', 'perferendis', 'doloribus', 'asperiores',
  'repellat',
];

const FIRST_SENTENCE = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';

function getRandomWord(): string {
  return LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)];
}

function generateSentence(minWords: number = 6, maxWords: number = 14): string {
  const length = Math.floor(Math.random() * (maxWords - minWords + 1)) + minWords;
  const words: string[] = [];
  for (let i = 0; i < length; i++) {
    words.push(getRandomWord());
  }
  return words[0].charAt(0).toUpperCase() + words[0].slice(1) + ' ' + words.slice(1).join(' ') + '.';
}

function generateParagraph(minSentences: number = 4, maxSentences: number = 8): string {
  const count = Math.floor(Math.random() * (maxSentences - minSentences + 1)) + minSentences;
  const sentences: string[] = [];
  for (let i = 0; i < count; i++) {
    sentences.push(generateSentence());
  }
  return sentences.join(' ');
}

function generateLoremIpsum(count: number, unit: UnitType, startWithLorem: boolean): string {
  if (count <= 0) return '';

  switch (unit) {
    case 'words': {
      const words: string[] = [];
      if (startWithLorem) {
        const loremStart = ['lorem', 'ipsum', 'dolor', 'sit', 'amet'];
        const startWords = loremStart.slice(0, Math.min(count, loremStart.length));
        startWords[0] = 'Lorem';
        words.push(...startWords);
      }
      while (words.length < count) {
        words.push(getRandomWord());
      }
      return words.slice(0, count).join(' ');
    }
    case 'sentences': {
      const sentences: string[] = [];
      if (startWithLorem) {
        sentences.push(FIRST_SENTENCE);
      }
      while (sentences.length < count) {
        sentences.push(generateSentence());
      }
      return sentences.slice(0, count).join(' ');
    }
    case 'paragraphs': {
      const paragraphs: string[] = [];
      if (startWithLorem) {
        const firstParagraph = generateParagraph();
        paragraphs.push(FIRST_SENTENCE + ' ' + firstParagraph);
      }
      while (paragraphs.length < count) {
        paragraphs.push(generateParagraph());
      }
      return paragraphs.slice(0, count).join('\n\n');
    }
    default:
      return '';
  }
}

function countWords(text: string): number {
  if (!text.trim()) return 0;
  return text.trim().split(/\s+/).length;
}

function countParagraphs(text: string): number {
  if (!text.trim()) return 0;
  return text.trim().split(/\n\n+/).length;
}

export function LoremIpsumTool() {
  const [unit, setUnit] = useState<UnitType>('paragraphs');
  const [count, setCount] = useState<number>(3);
  const [startWithLorem, setStartWithLorem] = useState<boolean>(true);
  const [output, setOutput] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const handleGenerate = useCallback((): void => {
    if (count <= 0) {
      toast.error('Please enter a number greater than 0');
      return;
    }
    const result = generateLoremIpsum(count, unit, startWithLorem);
    setOutput(result);
  }, [count, unit, startWithLorem]);

  const handleCopy = useCallback(async (): Promise<void> => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  }, [output]);

  const handleClear = useCallback((): void => {
    setOutput('');
  }, []);

  return (
    <div className="w-full">
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-soft">
        {/* Options Section */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2 mb-3">
            <FileEdit className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-semibold text-gray-800">
              Options
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            {/* Count input */}
            <div className="flex items-center gap-2">
              <label htmlFor="lorem-count" className="text-sm text-gray-600">
                Generate
              </label>
              <input
                id="lorem-count"
                type="number"
                min={MIN_COUNT}
                max={MAX_COUNT}
                value={count}
                onChange={(e) => setCount(Math.max(MIN_COUNT, Math.min(MAX_COUNT, parseInt(e.target.value) || MIN_COUNT)))}
                className="w-20 px-3 py-1.5 text-sm text-gray-900 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
              />
            </div>

            {/* Unit selector */}
            <div className="flex flex-wrap gap-1.5">
              {UNIT_OPTIONS.map((option) => (
                <button
                  key={option.key}
                  onClick={() => setUnit(option.key)}
                  className={cn(
                    'px-3 py-1.5 text-xs font-medium rounded-lg border transition-all duration-200',
                    unit === option.key
                      ? 'bg-primary-500 text-white border-primary-500 shadow-sm'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:text-gray-800'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {/* Start with Lorem Ipsum toggle */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={startWithLorem}
                onChange={(e) => setStartWithLorem(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500/20"
              />
              <span className="text-xs font-medium text-gray-600">
                Start with &ldquo;Lorem ipsum...&rdquo;
              </span>
            </label>
          </div>
        </div>

        {/* Generate Button + Output */}
        <div className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={handleGenerate}
              className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold bg-primary-500 text-white rounded-xl hover:bg-primary-600 shadow-sm transition-all duration-200"
            >
              <RefreshCw className="w-4 h-4" />
              Generate
            </button>
            <button
              onClick={handleCopy}
              disabled={!output}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-xl border transition-all duration-200',
                copied
                  ? 'text-success-600 bg-success-50 border-success-200'
                  : output
                    ? 'text-gray-600 bg-white border-gray-200 hover:border-gray-300 hover:text-gray-800'
                    : 'text-gray-300 bg-gray-50 border-gray-100 cursor-not-allowed'
              )}
            >
              {copied ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button
              onClick={handleClear}
              disabled={!output}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-xl border transition-all duration-200',
                output
                  ? 'text-gray-500 bg-white border-gray-200 hover:text-gray-700 hover:border-gray-300'
                  : 'text-gray-300 bg-gray-50 border-gray-100 cursor-not-allowed'
              )}
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear
            </button>
          </div>

          {/* Output Area */}
          <div className="relative">
            <textarea
              id="lorem-output"
              value={output}
              readOnly
              placeholder="Click &quot;Generate&quot; to create placeholder text..."
              className="w-full h-72 p-4 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-xl resize-none focus:outline-none placeholder:text-gray-400"
            />
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
              <span>{countParagraphs(output)} paragraphs</span>
              <span>{countWords(output)} words</span>
              <span>{output.length} characters</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
