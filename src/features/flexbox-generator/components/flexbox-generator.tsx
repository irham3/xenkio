'use client';

import { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Copy, Check, Plus, Trash2, Shuffle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type FlexDirection = 'row' | 'row-reverse' | 'column' | 'column-reverse';
type FlexWrap = 'nowrap' | 'wrap' | 'wrap-reverse';
type JustifyContent = 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
type AlignItems = 'stretch' | 'flex-start' | 'flex-end' | 'center' | 'baseline';
type AlignContent = 'stretch' | 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around';

interface FlexItem {
  id: string;
  order: number;
  flexGrow: number;
  flexShrink: number;
  flexBasis: string;
  alignSelf: 'auto' | 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch';
}

interface FlexContainerConfig {
  flexDirection: FlexDirection;
  flexWrap: FlexWrap;
  justifyContent: JustifyContent;
  alignItems: AlignItems;
  alignContent: AlignContent;
  gap: number;
}

interface PresetLayout {
  name: string;
  container: FlexContainerConfig;
  itemCount: number;
}

function createId(): string {
  return Math.random().toString(36).substring(2, 9);
}

function createItem(overrides?: Partial<Omit<FlexItem, 'id'>>): FlexItem {
  return {
    id: createId(),
    order: 0,
    flexGrow: 0,
    flexShrink: 1,
    flexBasis: 'auto',
    alignSelf: 'auto',
    ...overrides,
  };
}

const DEFAULT_CONTAINER: FlexContainerConfig = {
  flexDirection: 'row',
  flexWrap: 'nowrap',
  justifyContent: 'flex-start',
  alignItems: 'stretch',
  alignContent: 'stretch',
  gap: 8,
};

const PRESET_LAYOUTS: PresetLayout[] = [
  {
    name: 'Centered',
    container: { ...DEFAULT_CONTAINER, justifyContent: 'center', alignItems: 'center' },
    itemCount: 1,
  },
  {
    name: 'Space Between',
    container: { ...DEFAULT_CONTAINER, justifyContent: 'space-between', alignItems: 'center' },
    itemCount: 3,
  },
  {
    name: 'Column Stack',
    container: { ...DEFAULT_CONTAINER, flexDirection: 'column', alignItems: 'stretch', gap: 12 },
    itemCount: 3,
  },
  {
    name: 'Wrap Grid',
    container: { ...DEFAULT_CONTAINER, flexWrap: 'wrap', gap: 12 },
    itemCount: 6,
  },
  {
    name: 'Navbar',
    container: { ...DEFAULT_CONTAINER, justifyContent: 'space-between', alignItems: 'center' },
    itemCount: 3,
  },
  {
    name: 'Holy Grail',
    container: { ...DEFAULT_CONTAINER, flexWrap: 'wrap', gap: 0 },
    itemCount: 5,
  },
  {
    name: 'Sidebar Layout',
    container: { ...DEFAULT_CONTAINER, alignItems: 'stretch', gap: 0 },
    itemCount: 2,
  },
  {
    name: 'Equal Width',
    container: { ...DEFAULT_CONTAINER, gap: 12 },
    itemCount: 3,
  },
];

const ITEM_COLORS = [
  'bg-primary-100 border-primary-300',
  'bg-accent-100 border-accent-300',
  'bg-success-100 border-success-300',
  'bg-error-100 border-error-300',
  'bg-primary-200 border-primary-400',
  'bg-accent-200 border-accent-400',
  'bg-success-200 border-success-400',
  'bg-error-200 border-error-400',
  'bg-primary-50 border-primary-200',
  'bg-accent-50 border-accent-200',
];

const DIRECTION_OPTIONS: { value: FlexDirection; label: string }[] = [
  { value: 'row', label: 'Row' },
  { value: 'row-reverse', label: 'Row Reverse' },
  { value: 'column', label: 'Column' },
  { value: 'column-reverse', label: 'Col Reverse' },
];

const WRAP_OPTIONS: { value: FlexWrap; label: string }[] = [
  { value: 'nowrap', label: 'No Wrap' },
  { value: 'wrap', label: 'Wrap' },
  { value: 'wrap-reverse', label: 'Wrap Reverse' },
];

const JUSTIFY_OPTIONS: { value: JustifyContent; label: string }[] = [
  { value: 'flex-start', label: 'Start' },
  { value: 'flex-end', label: 'End' },
  { value: 'center', label: 'Center' },
  { value: 'space-between', label: 'Between' },
  { value: 'space-around', label: 'Around' },
  { value: 'space-evenly', label: 'Evenly' },
];

const ALIGN_ITEMS_OPTIONS: { value: AlignItems; label: string }[] = [
  { value: 'stretch', label: 'Stretch' },
  { value: 'flex-start', label: 'Start' },
  { value: 'flex-end', label: 'End' },
  { value: 'center', label: 'Center' },
  { value: 'baseline', label: 'Baseline' },
];

const ALIGN_CONTENT_OPTIONS: { value: AlignContent; label: string }[] = [
  { value: 'stretch', label: 'Stretch' },
  { value: 'flex-start', label: 'Start' },
  { value: 'flex-end', label: 'End' },
  { value: 'center', label: 'Center' },
  { value: 'space-between', label: 'Between' },
  { value: 'space-around', label: 'Around' },
];

const ALIGN_SELF_OPTIONS: { value: FlexItem['alignSelf']; label: string }[] = [
  { value: 'auto', label: 'Auto' },
  { value: 'flex-start', label: 'Start' },
  { value: 'flex-end', label: 'End' },
  { value: 'center', label: 'Center' },
  { value: 'baseline', label: 'Baseline' },
  { value: 'stretch', label: 'Stretch' },
];

function buildContainerCss(config: FlexContainerConfig): string {
  const lines = [
    'display: flex;',
    `flex-direction: ${config.flexDirection};`,
    `flex-wrap: ${config.flexWrap};`,
    `justify-content: ${config.justifyContent};`,
    `align-items: ${config.alignItems};`,
  ];
  if (config.flexWrap !== 'nowrap') {
    lines.push(`align-content: ${config.alignContent};`);
  }
  if (config.gap > 0) {
    lines.push(`gap: ${config.gap}px;`);
  }
  return lines.join('\n');
}

function buildItemCss(item: FlexItem): string {
  const lines: string[] = [];
  if (item.order !== 0) lines.push(`order: ${item.order};`);
  if (item.flexGrow !== 0) lines.push(`flex-grow: ${item.flexGrow};`);
  if (item.flexShrink !== 1) lines.push(`flex-shrink: ${item.flexShrink};`);
  if (item.flexBasis !== 'auto') lines.push(`flex-basis: ${item.flexBasis};`);
  if (item.alignSelf !== 'auto') lines.push(`align-self: ${item.alignSelf};`);
  return lines.join('\n');
}

function buildFullCss(config: FlexContainerConfig, items: FlexItem[]): string {
  let css = `.container {\n  display: flex;\n  flex-direction: ${config.flexDirection};\n  flex-wrap: ${config.flexWrap};\n  justify-content: ${config.justifyContent};\n  align-items: ${config.alignItems};`;
  if (config.flexWrap !== 'nowrap') {
    css += `\n  align-content: ${config.alignContent};`;
  }
  if (config.gap > 0) {
    css += `\n  gap: ${config.gap}px;`;
  }
  css += '\n}';

  items.forEach((item, index) => {
    const itemCss = buildItemCss(item);
    if (itemCss) {
      css += `\n\n.item-${index + 1} {\n  ${itemCss.split('\n').join('\n  ')}\n}`;
    }
  });

  return css;
}

const DEFAULT_ITEMS: FlexItem[] = [
  createItem(),
  createItem(),
  createItem(),
];

function OptionButtons<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            'px-2.5 py-1 text-xs rounded-md border transition-all font-medium',
            value === opt.value
              ? 'bg-primary-500 text-white border-primary-500'
              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function FlexboxGenerator() {
  const [container, setContainer] = useState<FlexContainerConfig>(DEFAULT_CONTAINER);
  const [items, setItems] = useState<FlexItem[]>(DEFAULT_ITEMS);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fullCss = useMemo(() => buildFullCss(container, items), [container, items]);
  const containerCssPreview = useMemo(() => buildContainerCss(container), [container]);

  const updateContainer = useCallback(<K extends keyof FlexContainerConfig>(key: K, value: FlexContainerConfig[K]): void => {
    setContainer((prev) => ({ ...prev, [key]: value }));
  }, []);

  const updateItem = useCallback((id: string, updates: Partial<Omit<FlexItem, 'id'>>): void => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  }, []);

  const addItem = useCallback((): void => {
    setItems((prev) => [...prev, createItem()]);
  }, []);

  const removeItem = useCallback((id: string): void => {
    setItems((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((item) => item.id !== id);
    });
    setSelectedItem((prev) => (prev === id ? null : prev));
  }, []);

  const handleCopy = useCallback(async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(fullCss);
      setCopied(true);
      toast.success('CSS copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy CSS');
    }
  }, [fullCss]);

  const handleRandom = useCallback((): void => {
    const directions: FlexDirection[] = ['row', 'row-reverse', 'column', 'column-reverse'];
    const wraps: FlexWrap[] = ['nowrap', 'wrap', 'wrap-reverse'];
    const justifies: JustifyContent[] = ['flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'space-evenly'];
    const aligns: AlignItems[] = ['stretch', 'flex-start', 'flex-end', 'center', 'baseline'];

    setContainer({
      flexDirection: directions[Math.floor(Math.random() * directions.length)],
      flexWrap: wraps[Math.floor(Math.random() * wraps.length)],
      justifyContent: justifies[Math.floor(Math.random() * justifies.length)],
      alignItems: aligns[Math.floor(Math.random() * aligns.length)],
      alignContent: 'stretch',
      gap: Math.round(Math.random() * 24),
    });

    const numItems = 2 + Math.floor(Math.random() * 5);
    const newItems: FlexItem[] = [];
    for (let i = 0; i < numItems; i++) {
      newItems.push(createItem({
        flexGrow: Math.random() > 0.5 ? Math.floor(Math.random() * 3) : 0,
      }));
    }
    setItems(newItems);
    setSelectedItem(null);
  }, []);

  const applyPreset = useCallback((preset: PresetLayout): void => {
    setContainer({ ...preset.container });
    const newItems: FlexItem[] = [];
    for (let i = 0; i < preset.itemCount; i++) {
      if (preset.name === 'Equal Width') {
        newItems.push(createItem({ flexGrow: 1 }));
      } else if (preset.name === 'Holy Grail' && i === 0) {
        newItems.push(createItem({ flexBasis: '100%' }));
      } else if (preset.name === 'Holy Grail' && i === 4) {
        newItems.push(createItem({ flexBasis: '100%' }));
      } else if (preset.name === 'Holy Grail' && (i === 1 || i === 3)) {
        newItems.push(createItem({ flexBasis: '100px' }));
      } else if (preset.name === 'Holy Grail' && i === 2) {
        newItems.push(createItem({ flexGrow: 1 }));
      } else if (preset.name === 'Sidebar Layout' && i === 0) {
        newItems.push(createItem({ flexBasis: '200px' }));
      } else if (preset.name === 'Sidebar Layout' && i === 1) {
        newItems.push(createItem({ flexGrow: 1 }));
      } else if (preset.name === 'Wrap Grid') {
        newItems.push(createItem({ flexBasis: '30%' }));
      } else {
        newItems.push(createItem());
      }
    }
    setItems(newItems);
    setSelectedItem(null);
  }, []);

  const selectedItemData = items.find((item) => item.id === selectedItem);

  return (
    <div className="w-full">
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-soft">
        {/* Preview */}
        <div className="w-full rounded-t-2xl bg-gray-100 p-6" style={{ minHeight: '280px' }}>
          <div
            className="w-full border-2 border-dashed border-gray-300 rounded-xl p-4 min-h-[220px]"
            style={{
              display: 'flex',
              flexDirection: container.flexDirection,
              flexWrap: container.flexWrap,
              justifyContent: container.justifyContent,
              alignItems: container.alignItems,
              alignContent: container.alignContent,
              gap: `${container.gap}px`,
            }}
          >
            {items.map((item, index) => (
              <button
                key={item.id}
                onClick={() => setSelectedItem(item.id === selectedItem ? null : item.id)}
                className={cn(
                  'rounded-lg border-2 transition-all flex items-center justify-center text-sm font-semibold cursor-pointer min-w-[60px] min-h-[60px] px-4 py-3',
                  ITEM_COLORS[index % ITEM_COLORS.length],
                  item.id === selectedItem && 'ring-2 ring-primary-500 ring-offset-2'
                )}
                style={{
                  order: item.order,
                  flexGrow: item.flexGrow,
                  flexShrink: item.flexShrink,
                  flexBasis: item.flexBasis,
                  alignSelf: item.alignSelf,
                }}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-0">
          {/* LEFT PANEL: Container Controls */}
          <div className="lg:col-span-2 p-5 lg:p-6 border-b lg:border-b-0 lg:border-r border-gray-100 bg-white">
            <div className="space-y-5">
              {/* Direction */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-800">Direction</Label>
                <OptionButtons
                  options={DIRECTION_OPTIONS}
                  value={container.flexDirection}
                  onChange={(v) => updateContainer('flexDirection', v)}
                />
              </div>

              {/* Wrap */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-800">Wrap</Label>
                <OptionButtons
                  options={WRAP_OPTIONS}
                  value={container.flexWrap}
                  onChange={(v) => updateContainer('flexWrap', v)}
                />
              </div>

              {/* Justify Content */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-800">Justify Content</Label>
                <OptionButtons
                  options={JUSTIFY_OPTIONS}
                  value={container.justifyContent}
                  onChange={(v) => updateContainer('justifyContent', v)}
                />
              </div>

              {/* Align Items */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-800">Align Items</Label>
                <OptionButtons
                  options={ALIGN_ITEMS_OPTIONS}
                  value={container.alignItems}
                  onChange={(v) => updateContainer('alignItems', v)}
                />
              </div>

              {/* Align Content (only when wrapping) */}
              {container.flexWrap !== 'nowrap' && (
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-800">Align Content</Label>
                  <OptionButtons
                    options={ALIGN_CONTENT_OPTIONS}
                    value={container.alignContent}
                    onChange={(v) => updateContainer('alignContent', v)}
                  />
                </div>
              )}

              {/* Gap */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold text-gray-800">Gap</Label>
                  <span className="text-xs text-gray-500 tabular-nums">{container.gap}px</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={48}
                  value={container.gap}
                  onChange={(e) => updateContainer('gap', parseInt(e.target.value))}
                  aria-label="Gap"
                  className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-primary-500 bg-gray-200"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRandom}
                  className="flex-1 gap-1.5"
                >
                  <Shuffle className="w-4 h-4" />
                  Random
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addItem}
                  className="flex-1 gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Add Item
                </Button>
              </div>

              {/* Presets */}
              <div className="space-y-2 pt-4 border-t border-gray-200">
                <Label className="text-sm font-semibold text-gray-800">Presets</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PRESET_LAYOUTS.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => applyPreset(preset)}
                      className="px-2.5 py-2 text-xs rounded-lg border border-gray-200 hover:ring-2 hover:ring-primary-500 hover:ring-offset-1 transition-all bg-white text-gray-700 font-medium text-center"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: Item Properties & CSS Output */}
          <div className="lg:col-span-3 p-5 lg:p-6 bg-gray-50/50">
            <div className="space-y-6">
              {/* Item Properties */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold text-gray-800">
                    Items ({items.length})
                  </Label>
                </div>

                {/* Item List */}
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {items.map((item, index) => (
                    <div
                      key={item.id}
                      className={cn(
                        'flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer',
                        item.id === selectedItem
                          ? 'bg-primary-50 border-primary-300'
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      )}
                      onClick={() => setSelectedItem(item.id === selectedItem ? null : item.id)}
                    >
                      <span className="text-xs font-medium text-gray-700">
                        Item {index + 1}
                        {buildItemCss(item) && (
                          <span className="ml-1.5 text-gray-400">
                            (customized)
                          </span>
                        )}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeItem(item.id);
                        }}
                        disabled={items.length <= 1}
                        className={cn(
                          'p-1 rounded-md transition-colors',
                          items.length <= 1
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                        )}
                        aria-label={`Remove item ${index + 1}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Selected Item Properties */}
                {selectedItemData && (
                  <div className="p-3 bg-white rounded-lg border border-primary-200 space-y-3">
                    <span className="text-xs font-semibold text-primary-700">
                      Item {items.findIndex((i) => i.id === selectedItem) + 1} Properties
                    </span>

                    {/* Flex Grow / Shrink */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Grow</span>
                          <span className="text-xs text-gray-500 tabular-nums">{selectedItemData.flexGrow}</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={5}
                          value={selectedItemData.flexGrow}
                          onChange={(e) => updateItem(selectedItemData.id, { flexGrow: parseInt(e.target.value) })}
                          aria-label="Flex grow"
                          className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-primary-500 bg-gray-200"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Shrink</span>
                          <span className="text-xs text-gray-500 tabular-nums">{selectedItemData.flexShrink}</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={5}
                          value={selectedItemData.flexShrink}
                          onChange={(e) => updateItem(selectedItemData.id, { flexShrink: parseInt(e.target.value) })}
                          aria-label="Flex shrink"
                          className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-primary-500 bg-gray-200"
                        />
                      </div>
                    </div>

                    {/* Order */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Order</span>
                        <span className="text-xs text-gray-500 tabular-nums">{selectedItemData.order}</span>
                      </div>
                      <input
                        type="range"
                        min={-5}
                        max={5}
                        value={selectedItemData.order}
                        onChange={(e) => updateItem(selectedItemData.id, { order: parseInt(e.target.value) })}
                        aria-label="Order"
                        className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-primary-500 bg-gray-200"
                      />
                    </div>

                    {/* Flex Basis */}
                    <div className="space-y-1.5">
                      <span className="text-xs text-gray-500">Basis</span>
                      <div className="flex flex-wrap gap-1.5">
                        {['auto', '0', '50px', '100px', '150px', '25%', '33%', '50%'].map((basis) => (
                          <button
                            key={basis}
                            onClick={() => updateItem(selectedItemData.id, { flexBasis: basis })}
                            className={cn(
                              'px-2 py-1 text-xs rounded-md border transition-all',
                              selectedItemData.flexBasis === basis
                                ? 'bg-primary-500 text-white border-primary-500'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                            )}
                          >
                            {basis}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Align Self */}
                    <div className="space-y-1.5">
                      <span className="text-xs text-gray-500">Align Self</span>
                      <OptionButtons
                        options={ALIGN_SELF_OPTIONS}
                        value={selectedItemData.alignSelf}
                        onChange={(v) => updateItem(selectedItemData.id, { alignSelf: v })}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* CSS Output */}
              <div className="space-y-2 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold text-gray-800">CSS Code</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    className={cn(
                      'h-7 text-xs gap-1.5 transition-all',
                      copied && 'text-green-600 border-green-500 bg-green-50'
                    )}
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Copied!' : 'Copy CSS'}
                  </Button>
                </div>
                <div className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-sm leading-relaxed overflow-x-auto whitespace-pre">
                  <span className="text-purple-400">.container</span>
                  <span className="text-gray-400">{' {\n'}</span>
                  {containerCssPreview.split('\n').map((line, i) => (
                    <span key={i}>
                      <span className="text-gray-400">{'  '}</span>
                      <span className="text-blue-400">{line.split(':')[0]}</span>
                      <span className="text-gray-400">: </span>
                      <span className="text-green-400">{line.split(': ').slice(1).join(': ').replace(';', '')}</span>
                      <span className="text-gray-400">;</span>
                      {'\n'}
                    </span>
                  ))}
                  <span className="text-gray-400">{'}'}</span>
                  {items.map((item, index) => {
                    const itemCss = buildItemCss(item);
                    if (!itemCss) return null;
                    return (
                      <span key={item.id}>
                        {'\n\n'}
                        <span className="text-purple-400">{`.item-${index + 1}`}</span>
                        <span className="text-gray-400">{' {\n'}</span>
                        {itemCss.split('\n').map((line, i) => (
                          <span key={i}>
                            <span className="text-gray-400">{'  '}</span>
                            <span className="text-blue-400">{line.split(':')[0]}</span>
                            <span className="text-gray-400">: </span>
                            <span className="text-green-400">{line.split(': ').slice(1).join(': ').replace(';', '')}</span>
                            <span className="text-gray-400">;</span>
                            {'\n'}
                          </span>
                        ))}
                        <span className="text-gray-400">{'}'}</span>
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
