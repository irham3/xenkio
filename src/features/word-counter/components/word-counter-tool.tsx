'use client';

import { useState, useCallback } from 'react';
import { Copy, Check, Trash2, Type, FileText, Clock, BarChart3, Play } from 'lucide-react';
import { toast } from 'sonner';

interface TextStats {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  sentences: number;
  paragraphs: number;
  lines: number;
  readingTime: string;
  speakingTime: string;
}

interface WordFrequency {
  word: string;
  count: number;
  density: number;
}

function computeStats(text: string): TextStats {
  const trimmed = text.trim();

  const words = trimmed === '' ? 0 : trimmed.split(/\s+/).length;
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, '').length;
  const sentences = trimmed === '' ? 0 : (trimmed.match(/[.!?]+(?=\s|$)/g) || []).length || (words > 0 ? 1 : 0);
  const paragraphs = trimmed === '' ? 0 : trimmed.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length;
  const lines = trimmed === '' ? 0 : text.split('\n').length;

  const readingMinutes = words / 200;
  const speakingMinutes = words / 130;

  return {
    words,
    characters,
    charactersNoSpaces,
    sentences,
    paragraphs,
    lines,
    readingTime: formatTime(readingMinutes),
    speakingTime: formatTime(speakingMinutes),
  };
}

function formatTime(minutes: number): string {
  if (minutes < 1) {
    const seconds = Math.ceil(minutes * 60);
    return seconds <= 0 ? '0 sec' : `${seconds} sec`;
  }
  const mins = Math.floor(minutes);
  const secs = Math.round((minutes - mins) * 60);
  if (secs === 0) return `${mins} min`;
  return `${mins} min ${secs} sec`;
}

function computeTopWords(text: string, limit: number): WordFrequency[] {
  const trimmed = text.trim();
  if (trimmed === '') return [];

  const words = trimmed.toLowerCase().match(/\b[a-zA-Z']+\b/g);
  if (!words) return [];

  const freq = new Map<string, number>();
  for (const w of words) {
    freq.set(w, (freq.get(w) || 0) + 1);
  }

  const totalWords = words.length;
  return Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word, count]) => ({
      word,
      count,
      density: totalWords > 0 ? (count / totalWords) * 100 : 0,
    }));
}

const DEFAULT_STATS: TextStats = {
  words: 0,
  characters: 0,
  charactersNoSpaces: 0,
  sentences: 0,
  paragraphs: 0,
  lines: 0,
  readingTime: '0 sec',
  speakingTime: '0 sec',
};

export function WordCounterTool() {
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState<TextStats>(DEFAULT_STATS);
  const [topWords, setTopWords] = useState<WordFrequency[]>([]);

  const handleAnalyze = useCallback(() => {
    if (!text.trim()) {
      return;
    }
    setStats(computeStats(text));
    setTopWords(computeTopWords(text, 10));
  }, [text]);

  const handleCopy = useCallback(async () => {
    if (!text) {
      toast.error('Nothing to copy');
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Text copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy text');
    }
  }, [text]);

  const handleClear = useCallback(() => {
    setText('');
    setStats(DEFAULT_STATS);
    setTopWords([]);
    toast.success('Text cleared');
  }, []);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Words" value={stats.words} icon={<Type className="h-4 w-4" />} />
        <StatCard label="Characters" value={stats.characters} icon={<FileText className="h-4 w-4" />} />
        <StatCard label="No Spaces" value={stats.charactersNoSpaces} icon={<FileText className="h-4 w-4" />} />
        <StatCard label="Sentences" value={stats.sentences} icon={<Type className="h-4 w-4" />} />
        <StatCard label="Paragraphs" value={stats.paragraphs} icon={<FileText className="h-4 w-4" />} />
        <StatCard label="Lines" value={stats.lines} icon={<FileText className="h-4 w-4" />} />
      </div>

      {/* Textarea + Actions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label htmlFor="word-counter-input" className="text-sm font-medium text-gray-700">
            Enter or paste your text
          </label>
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button
              onClick={handleClear}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear
            </button>
          </div>
        </div>
        <textarea
          id="word-counter-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your text here then click Analyze..."
          className="w-full h-64 p-4 text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-y text-sm leading-relaxed placeholder:text-gray-400"
        />
        <button
          onClick={handleAnalyze}
          disabled={!text.trim()}
          className={`w-full mt-3 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
            text.trim()
              ? 'bg-primary-500 text-white hover:bg-primary-600 shadow-sm'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Play className="w-4 h-4" />
          Analyze
        </button>
      </div>

      {/* Time Estimates + Top Words */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Time Estimates */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary-500" />
            Time Estimates
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Reading Time</span>
              <span className="text-sm font-semibold text-gray-900">{stats.readingTime}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">Speaking Time</span>
              <span className="text-sm font-semibold text-gray-900">{stats.speakingTime}</span>
            </div>
          </div>
          <p className="text-xs text-gray-400">
            Based on average reading speed of 200 wpm and speaking speed of 130 wpm.
          </p>
        </div>

        {/* Top Words */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary-500" />
            Top Keywords
          </h3>
          {topWords.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">
              Start typing to see keyword density
            </p>
          ) : (
            <div className="space-y-2">
              {topWords.map((item) => (
                <div key={item.word} className="flex items-center gap-3">
                  <span className="text-sm text-gray-700 w-24 truncate font-medium">{item.word}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-primary-500 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(item.density * 3, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-20 text-right">
                    {item.count}× ({item.density.toFixed(1)}%)
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 text-center space-y-1">
      <div className="flex items-center justify-center text-gray-400">{icon}</div>
      <div className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</div>
      <div className="text-xs text-gray-500 font-medium">{label}</div>
    </div>
  );
}
