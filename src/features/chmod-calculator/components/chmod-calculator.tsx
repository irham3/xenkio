'use client';

import { useState, useCallback } from 'react';
import { Copy, Check, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  calculateResult,
  octalToPermissions,
  COMMON_PRESETS,
} from '../lib/chmod-utils';
import type { ChmodPermissions, PermissionEntity, PermissionType } from '../types';

const DEFAULT_PERMISSIONS: ChmodPermissions = {
  owner: { read: true, write: true, execute: false },
  group: { read: true, write: false, execute: false },
  others: { read: true, write: false, execute: false },
  sticky: false,
  setgid: false,
  setuid: false,
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className={cn(
        'p-1.5 rounded-lg transition-all duration-200 hover:bg-gray-100',
        copied ? 'text-green-600 bg-green-50' : 'text-gray-400 hover:text-gray-600'
      )}
      title="Copy"
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

interface PermissionRowProps {
  entity: PermissionEntity;
  label: string;
  sublabel: string;
  permissions: ChmodPermissions;
  onToggle: (entity: PermissionEntity, type: PermissionType) => void;
}

function PermissionRow({ entity, label, sublabel, permissions, onToggle }: PermissionRowProps) {
  const bits = permissions[entity];
  const types: PermissionType[] = ['read', 'write', 'execute'];

  return (
    <div className="flex items-center gap-3 py-3">
      <div className="w-20 shrink-0">
        <div className="text-sm font-semibold text-gray-800">{label}</div>
        <div className="text-xs text-gray-400">{sublabel}</div>
      </div>
      <div className="flex gap-2 flex-1">
        {types.map((type) => {
          const active = bits[type];
          return (
            <button
              key={type}
              onClick={() => onToggle(entity, type)}
              className={cn(
                'flex-1 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 select-none',
                active
                  ? type === 'read'
                    ? 'bg-blue-500 border-blue-500 text-white shadow-sm'
                    : type === 'write'
                    ? 'bg-amber-500 border-amber-500 text-white shadow-sm'
                    : 'bg-green-500 border-green-500 text-white shadow-sm'
                  : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-500'
              )}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          );
        })}
      </div>
      <div className="w-8 text-center text-sm font-mono font-bold text-gray-700">
        {(bits.read ? 4 : 0) + (bits.write ? 2 : 0) + (bits.execute ? 1 : 0)}
      </div>
    </div>
  );
}

interface SpecialBitRowProps {
  label: string;
  description: string;
  active: boolean;
  onToggle: () => void;
}

function SpecialBitRow({ label, description, active, onToggle }: SpecialBitRowProps) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        'flex items-center gap-3 w-full px-3 py-2 rounded-xl border text-left transition-all duration-200',
        active
          ? 'bg-purple-50 border-purple-300 text-purple-700'
          : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
      )}
    >
      <div
        className={cn(
          'w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all',
          active ? 'bg-purple-500 border-purple-500' : 'border-gray-300'
        )}
      >
        {active && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
      </div>
      <div>
        <span className="text-xs font-semibold">{label}</span>
        <span className="text-xs text-gray-400 ml-2">{description}</span>
      </div>
    </button>
  );
}

export function ChmodCalculator() {
  const [permissions, setPermissions] = useState<ChmodPermissions>(DEFAULT_PERMISSIONS);
  const [octalInput, setOctalInput] = useState('');
  const [octalError, setOctalError] = useState(false);

  const result = calculateResult(permissions);

  const togglePermission = useCallback((entity: PermissionEntity, type: PermissionType) => {
    setPermissions((prev) => ({
      ...prev,
      [entity]: {
        ...prev[entity],
        [type]: !prev[entity][type],
      },
    }));
  }, []);

  const toggleSpecial = useCallback((bit: 'sticky' | 'setgid' | 'setuid') => {
    setPermissions((prev) => ({ ...prev, [bit]: !prev[bit] }));
  }, []);

  const applyPreset = useCallback((octal: string) => {
    const parsed = octalToPermissions(octal);
    if (parsed) {
      setPermissions(parsed);
      setOctalInput('');
      setOctalError(false);
    }
  }, []);

  const handleOctalInput = useCallback((value: string) => {
    setOctalInput(value);
    if (value === '') {
      setOctalError(false);
      return;
    }
    const parsed = octalToPermissions(value);
    if (parsed) {
      setPermissions(parsed);
      setOctalError(false);
    } else {
      setOctalError(true);
    }
  }, []);

  const handleReset = useCallback(() => {
    setPermissions(DEFAULT_PERMISSIONS);
    setOctalInput('');
    setOctalError(false);
  }, []);

  return (
    <div className="space-y-6">
      {/* Main Calculator Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">Permission Bits</h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">or enter octal:</span>
            <Input
              type="text"
              placeholder="e.g. 755"
              value={octalInput}
              onChange={(e) => handleOctalInput(e.target.value)}
              maxLength={4}
              className={cn(
                'w-24 h-8 text-sm font-mono text-center',
                octalError && 'border-red-400 focus-visible:ring-red-300'
              )}
            />
            <button
              onClick={handleReset}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              title="Reset"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Column headers */}
        <div className="flex items-center gap-3 px-5 py-2 bg-gray-50 border-b border-gray-100">
          <div className="w-20 text-xs text-gray-400 font-medium">Entity</div>
          <div className="flex-1 grid grid-cols-3 gap-2 text-xs text-gray-400 font-medium text-center">
            <span>Read (4)</span>
            <span>Write (2)</span>
            <span>Execute (1)</span>
          </div>
          <div className="w-8 text-xs text-gray-400 font-medium text-center">Val</div>
        </div>

        {/* Permission rows */}
        <div className="px-5 divide-y divide-gray-50">
          <PermissionRow
            entity="owner"
            label="Owner"
            sublabel="user (u)"
            permissions={permissions}
            onToggle={togglePermission}
          />
          <PermissionRow
            entity="group"
            label="Group"
            sublabel="group (g)"
            permissions={permissions}
            onToggle={togglePermission}
          />
          <PermissionRow
            entity="others"
            label="Others"
            sublabel="world (o)"
            permissions={permissions}
            onToggle={togglePermission}
          />
        </div>

        {/* Special bits */}
        <div className="px-5 pt-3 pb-4 border-t border-gray-100 space-y-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Special Bits</p>
          <div className="grid sm:grid-cols-3 gap-2">
            <SpecialBitRow
              label="Sticky"
              description="restrict deletion"
              active={permissions.sticky}
              onToggle={() => toggleSpecial('sticky')}
            />
            <SpecialBitRow
              label="SetGID"
              description="inherit group"
              active={permissions.setgid}
              onToggle={() => toggleSpecial('setgid')}
            />
            <SpecialBitRow
              label="SetUID"
              description="run as owner"
              active={permissions.setuid}
              onToggle={() => toggleSpecial('setuid')}
            />
          </div>
        </div>
      </div>

      {/* Results Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={result.octal}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
          className="bg-gray-900 rounded-2xl p-5 text-white"
        >
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Result</p>
          <div className="grid sm:grid-cols-3 gap-4">
            {/* Octal */}
            <div className="bg-gray-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400">Octal</span>
                <CopyButton text={result.octal} />
              </div>
              <div className="text-2xl font-mono font-bold text-white">{result.octal}</div>
              <div className="text-xs text-gray-500 mt-1">chmod {result.octal}</div>
            </div>

            {/* Symbolic */}
            <div className="bg-gray-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400">Symbolic</span>
                <CopyButton text={result.symbolic} />
              </div>
              <div className="text-2xl font-mono font-bold text-white tracking-widest">{result.symbolic}</div>
              <div className="text-xs text-gray-500 mt-1">ls -la format</div>
            </div>

            {/* Numeric */}
            <div className="bg-gray-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400">Numeric</span>
                <CopyButton text={String(result.numeric)} />
              </div>
              <div className="text-2xl font-mono font-bold text-white">{result.numeric}</div>
              <div className="text-xs text-gray-500 mt-1">decimal value</div>
            </div>
          </div>

          {/* Command preview */}
          <div className="mt-4 bg-gray-800 rounded-xl p-3 flex items-center justify-between gap-3">
            <code className="text-sm font-mono text-green-400">
              chmod {result.octal} filename
            </code>
            <CopyButton text={`chmod ${result.octal} filename`} />
          </div>

          {/* Description */}
          {result.description !== 'no permissions' && (
            <p className="text-xs text-gray-400 mt-3 leading-relaxed capitalize">
              {result.description}
            </p>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Quick Presets */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <p className="text-sm font-semibold text-gray-700 mb-3">Common Presets</p>
        <div className="grid sm:grid-cols-2 gap-2">
          {COMMON_PRESETS.map((preset) => (
            <Button
              key={preset.octal}
              variant="outline"
              onClick={() => applyPreset(preset.octal)}
              className={cn(
                'h-auto py-2 px-3 justify-start gap-3 hover:bg-gray-50 transition-all',
                result.octal === preset.octal && 'border-blue-400 bg-blue-50 hover:bg-blue-50'
              )}
            >
              <span className={cn(
                'font-mono font-bold text-base w-10 shrink-0',
                result.octal === preset.octal ? 'text-blue-600' : 'text-gray-700'
              )}>
                {preset.label}
              </span>
              <span className="text-xs text-gray-500 text-left leading-tight">{preset.description}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
