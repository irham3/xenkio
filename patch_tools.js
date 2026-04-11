import * as fs from 'node:fs';
let content = fs.readFileSync('src/data/tools.ts', 'utf-8');

const replacements = {
  'Brackets': 'BracketsAngle',
  'FileDiffs': 'FileCode',
  'FilePencil': 'NotePencil',
  'Activity': 'ChartLineUp',
  'Merge': 'GitMerge',
  'Split': 'SplitHorizontal',
  'FileOutput': 'FileArrowDown',
  'Wand2': 'MagicWand',
  'ImageDown': 'FileArrowDown',
  'Film': 'FilmStrip',
  'Layers': 'Stack',
  'GalleryHorizontal': 'Images',
  'ScanLine': 'Scan',
  'Maximize2': 'ArrowsOut',
  'Braces': 'BracketsCurly',
  'FileJson': 'FileCode',
  'Code2': 'CodeSimple',
  'FileEdit': 'NotePencil',
  'Regex': 'TextT',
  'Diff': 'GitMerge',
  'Paintbrush': 'PaintBrush',
  'Contrast': 'CircleHalf',
  'Mic': 'Microphone',
  'TextCursor': 'Cursor',
  'Volume2': 'SpeakerHigh',
  'Bot': 'Robot',
  'CalendarRange': 'Calendar',
  'LockKeyhole': 'LockKey',
  'KeyRound': 'KeyReturn',
  'Globe2': 'Globe',
  'Wifi': 'WifiHigh',
  'Box': 'Cube',
  'Type': 'TextT',
  'LayoutGrid': 'GridFour',
  'ArrowLeftRight': 'ArrowsLeftRight',
  'ListFilter': 'FunnelSimple',
  'Link2': 'LinkSimple',
  'Share2': 'ShareNetwork',
  'Twitter': 'XLogo',
  'Server': 'HardDrives',
  'DollarSign': 'CurrencyDollar',
  'CalendarDays': 'CalendarDots',
  'TrendingUp': 'TrendUp',
  'LucideIcon': 'Icon'
};

for (const [lucide, phosphor] of Object.entries(replacements)) {
  content = content.replace(new RegExp(`(\\bicon: |\\bicon:s*|,\\s*)${lucide}\\b`, 'g'), `$1${phosphor}`);
  content = content.replace(new RegExp(`\\b${lucide}\\b`, 'g'), phosphor);
}

fs.writeFileSync('src/data/tools.ts', content, 'utf-8');
console.log('Done!');
