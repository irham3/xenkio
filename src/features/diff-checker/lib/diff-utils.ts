import { diffChars, diffWords, diffLines, Change } from 'diff';
import { DiffOptions, DiffResult, DiffChange, DiffStats } from '../types';

export function computeDiff(options: DiffOptions): DiffResult {
  const startTime = performance.now();
  
  let { originalText, modifiedText } = options;
  const { diffType, ignoreCase, ignoreWhitespace } = options;

  // Apply options
  if (ignoreCase) {
    originalText = originalText.toLowerCase();
    modifiedText = modifiedText.toLowerCase();
  }

  if (ignoreWhitespace) {
    originalText = normalizeWhitespace(originalText);
    modifiedText = normalizeWhitespace(modifiedText);
  }

  let rawChanges: Change[];

  switch (diffType) {
    case 'chars':
      rawChanges = diffChars(originalText, modifiedText);
      break;
    case 'words':
      rawChanges = diffWords(originalText, modifiedText);
      break;
    case 'lines':
      rawChanges = diffLines(originalText, modifiedText);
      break;
    default:
      rawChanges = diffWords(originalText, modifiedText);
  }

  // Convert to our DiffChange type
  const changes: DiffChange[] = rawChanges.map(change => ({
    value: change.value,
    added: change.added,
    removed: change.removed,
  }));

  // Calculate stats
  const stats = calculateStats(changes, originalText, modifiedText);

  return {
    changes,
    stats,
    executionTime: performance.now() - startTime,
  };
}

function normalizeWhitespace(text: string): string {
  return text
    .split('\n')
    .map(line => line.trim().replace(/\s+/g, ' '))
    .join('\n');
}

function calculateStats(changes: DiffChange[], original: string, modified: string): DiffStats {
  let additions = 0;
  let deletions = 0;
  let unchanged = 0;

  for (const change of changes) {
    if (change.added) {
      additions += change.value.length;
    } else if (change.removed) {
      deletions += change.value.length;
    } else {
      unchanged += change.value.length;
    }
  }

  return {
    additions,
    deletions,
    unchanged,
    totalLines: {
      original: original.split('\n').length,
      modified: modified.split('\n').length,
    },
  };
}

export function hasChanges(result: DiffResult | null): boolean {
  if (!result) return false;
  return result.stats.additions > 0 || result.stats.deletions > 0;
}
