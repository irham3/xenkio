'use client';

import { useState, useCallback, useMemo } from 'react';
import { Copy, Check, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import {
  calculateSubnet,
  maskToCidr,
  cidrToMask,
  numberToIP,
  formatNumber,
  CIDR_PRESETS,
} from '../lib/subnet-utils';
import type { SubnetInfo } from '../types';

const DEFAULT_IP = '192.168.1.0';
const DEFAULT_CIDR = 24;

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
        copied ? 'text-primary-600 bg-primary-50' : 'text-gray-400 hover:text-gray-600'
      )}
      title="Copy"
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

interface ResultRowProps {
  label: string;
  value: string;
  mono?: boolean;
  highlight?: boolean;
}

function ResultRow({ label, value, mono = true, highlight = false }: ResultRowProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between px-4 py-3 rounded-xl border transition-colors',
        highlight
          ? 'bg-primary-50 border-primary-200'
          : 'bg-white border-gray-200 hover:border-gray-300'
      )}
    >
      <span className="text-xs text-gray-500 font-medium shrink-0 mr-3">{label}</span>
      <div className="flex items-center gap-1 min-w-0">
        <span
          className={cn(
            'text-sm font-semibold text-gray-800 truncate',
            mono && 'font-mono'
          )}
        >
          {value}
        </span>
        <CopyButton text={value} />
      </div>
    </div>
  );
}

interface BinaryOctetProps {
  octet: string;
  networkBits: number;
  octetIndex: number;
}

function BinaryOctet({ octet, networkBits, octetIndex }: BinaryOctetProps) {
  const startBit = octetIndex * 8;

  return (
    <div className="flex gap-0.5">
      {octet.split('').map((bit, i) => {
        const globalBit = startBit + i;
        const isNetworkBit = globalBit < networkBits;
        return (
          <span
            key={i}
            className={cn(
              'w-5 h-6 flex items-center justify-center text-xs font-mono font-bold rounded',
              bit === '1'
                ? isNetworkBit
                  ? 'bg-primary-500 text-white'
                  : 'bg-amber-400 text-white'
                : isNetworkBit
                ? 'bg-primary-100 text-primary-400'
                : 'bg-amber-50 text-amber-300'
            )}
          >
            {bit}
          </span>
        );
      })}
    </div>
  );
}

interface BinaryRowProps {
  label: string;
  binary: string;
  networkBits: number;
  colorize?: boolean;
}

function BinaryRow({ label, binary, networkBits, colorize = false }: BinaryRowProps) {
  const octets = binary.split('.');

  return (
    <div className="space-y-1">
      <span className="text-xs text-gray-400 font-medium">{label}</span>
      <div className="flex flex-wrap gap-1.5 items-center">
        {octets.map((octet, i) => (
          <div key={i} className="flex items-center gap-1.5">
            {colorize ? (
              <BinaryOctet octet={octet} networkBits={networkBits} octetIndex={i} />
            ) : (
              <div className="flex gap-0.5">
                {octet.split('').map((bit, j) => (
                  <span
                    key={j}
                    className={cn(
                      'w-5 h-6 flex items-center justify-center text-xs font-mono font-bold rounded',
                      bit === '1' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-400'
                    )}
                  >
                    {bit}
                  </span>
                ))}
              </div>
            )}
            {i < 3 && <span className="text-gray-300 text-sm font-mono">.</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

interface BadgeProps {
  label: string;
  value: string;
  color: 'blue' | 'green' | 'orange' | 'purple' | 'gray';
}

function Badge({ label, value, color }: BadgeProps) {
  const colorMap = {
    blue: 'bg-primary-50 text-primary-700 border-primary-200',
    green: 'bg-success-50 text-success-700 border-success-100',
    orange: 'bg-accent-50 text-accent-700 border-accent-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    gray: 'bg-gray-50 text-gray-600 border-gray-200',
  };
  return (
    <div
      className={cn(
        'inline-flex flex-col items-center justify-center px-4 py-3 rounded-xl border text-center',
        colorMap[color]
      )}
    >
      <span className="text-[10px] font-medium uppercase tracking-wide opacity-70">{label}</span>
      <span className="text-sm font-bold mt-0.5">{value}</span>
    </div>
  );
}

export function IPv4SubnetCalculator() {
  const [ipInput, setIpInput] = useState(DEFAULT_IP);
  const [cidrInput, setCidrInput] = useState(String(DEFAULT_CIDR));
  const [maskInput, setMaskInput] = useState('');
  const [useMaskMode, setUseMaskMode] = useState(false);
  const [ipError, setIpError] = useState(false);
  const [prefixError, setPrefixError] = useState(false);
  const [showBinary, setShowBinary] = useState(false);
  const [showReference, setShowReference] = useState(false);

  const result: SubnetInfo | null = useMemo(() => {
    const prefix = parseInt(cidrInput, 10);
    if (!Number.isInteger(prefix) || prefix < 0 || prefix > 32) return null;
    return calculateSubnet(ipInput, prefix);
  }, [ipInput, cidrInput]);

  const handleIPChange = useCallback((value: string) => {
    setIpInput(value);
    const parts = value.split('.');
    const valid =
      parts.length === 4 &&
      parts.every((p) => {
        const n = Number(p);
        return p !== '' && Number.isInteger(n) && n >= 0 && n <= 255;
      });
    setIpError(value.length > 0 && !valid);
  }, []);

  const handleCidrChange = useCallback((value: string) => {
    setCidrInput(value);
    if (value === '') {
      setPrefixError(false);
      return;
    }
    const n = parseInt(value, 10);
    const valid = Number.isInteger(n) && n >= 0 && n <= 32;
    setPrefixError(!valid);
    if (valid) {
      setMaskInput(numberToIP(cidrToMask(n)));
    }
  }, []);

  const handleMaskChange = useCallback((value: string) => {
    setMaskInput(value);
    const prefix = maskToCidr(value);
    if (prefix !== null) {
      setCidrInput(String(prefix));
      setPrefixError(false);
    } else {
      setPrefixError(value.length > 0);
    }
  }, []);

  const handlePreset = useCallback((prefix: number) => {
    setCidrInput(String(prefix));
    setMaskInput(numberToIP(cidrToMask(prefix)));
    setPrefixError(false);
  }, []);

  const handleReset = useCallback(() => {
    setIpInput(DEFAULT_IP);
    setCidrInput(String(DEFAULT_CIDR));
    setMaskInput('');
    setIpError(false);
    setPrefixError(false);
  }, []);

  const handleToggleMode = useCallback(() => {
    setUseMaskMode((prev) => {
      const next = !prev;
      if (next) {
        const prefix = parseInt(cidrInput, 10);
        if (Number.isInteger(prefix) && prefix >= 0 && prefix <= 32) {
          setMaskInput(numberToIP(cidrToMask(prefix)));
        }
      }
      return next;
    });
  }, [cidrInput]);

  return (
    <div className="space-y-4">
      {/* Input Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">IP Address &amp; Prefix</h2>
          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            title="Reset to default"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-3">
          {/* IP field */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500">IPv4 Address</label>
            <Input
              type="text"
              placeholder="e.g. 192.168.1.0"
              value={ipInput}
              onChange={(e) => handleIPChange(e.target.value)}
              className={cn(
                'font-mono text-sm h-10',
                ipError && 'border-red-400 focus-visible:ring-red-300'
              )}
              spellCheck={false}
            />
            {ipError && (
              <p className="text-xs text-red-500">Enter a valid IPv4 address (e.g. 192.168.1.0)</p>
            )}
          </div>

          {/* Prefix / Mask toggle */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-gray-500">
                {useMaskMode ? 'Subnet Mask' : 'Prefix Length (CIDR)'}
              </label>
              <button
                onClick={handleToggleMode}
                className="text-xs text-primary-600 hover:text-primary-700 font-medium transition-colors"
              >
                Switch to {useMaskMode ? 'CIDR' : 'Subnet Mask'}
              </button>
            </div>

            {useMaskMode ? (
              <Input
                type="text"
                placeholder="e.g. 255.255.255.0"
                value={maskInput}
                onChange={(e) => handleMaskChange(e.target.value)}
                className={cn(
                  'font-mono text-sm h-10',
                  prefixError && 'border-red-400 focus-visible:ring-red-300'
                )}
                spellCheck={false}
              />
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-gray-500 font-mono text-sm font-semibold">/</span>
                <Input
                  type="number"
                  min={0}
                  max={32}
                  placeholder="0–32"
                  value={cidrInput}
                  onChange={(e) => handleCidrChange(e.target.value)}
                  className={cn(
                    'w-24 font-mono text-sm h-10',
                    prefixError && 'border-red-400 focus-visible:ring-red-300'
                  )}
                />
                <input
                  type="range"
                  min={0}
                  max={32}
                  value={parseInt(cidrInput, 10) || 0}
                  onChange={(e) => handleCidrChange(e.target.value)}
                  className="flex-1 accent-primary-500 h-1.5 rounded-full cursor-pointer"
                />
              </div>
            )}
            {prefixError && (
              <p className="text-xs text-red-500">
                {useMaskMode
                  ? 'Enter a valid subnet mask (e.g. 255.255.255.0)'
                  : 'Prefix must be between 0 and 32'}
              </p>
            )}
          </div>

          {/* Quick CIDR chips */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {[8, 16, 24, 25, 26, 27, 28, 29, 30, 31, 32].map((p) => (
              <button
                key={p}
                onClick={() => handlePreset(p)}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-xs font-mono font-semibold border transition-all',
                  parseInt(cidrInput, 10) === p
                    ? 'bg-primary-500 border-primary-500 text-white'
                    : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700'
                )}
              >
                /{p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            key={`${result.networkAddress}-${result.cidr}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="space-y-4"
          >
            {/* Summary badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Badge
                label="Usable Hosts"
                value={formatNumber(result.usableHosts)}
                color="blue"
              />
              <Badge
                label="Total Addresses"
                value={formatNumber(result.totalHosts)}
                color="green"
              />
              <Badge label="IP Class" value={`Class ${result.ipClass}`} color="purple" />
              <Badge label="IP Type" value={result.ipType} color="orange" />
            </div>

            {/* Main result grid */}
            <div className="bg-gray-900 rounded-2xl p-5 space-y-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Network Details
              </p>
              <div className="grid sm:grid-cols-2 gap-2">
                <div className="bg-gray-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400">Network Address</span>
                    <CopyButton text={result.networkAddress} />
                  </div>
                  <div className="text-xl font-mono font-bold text-white">
                    {result.networkAddress}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">/{result.cidr}</div>
                </div>
                <div className="bg-gray-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400">Broadcast Address</span>
                    <CopyButton text={result.broadcastAddress} />
                  </div>
                  <div className="text-xl font-mono font-bold text-white">
                    {result.broadcastAddress}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">last address in subnet</div>
                </div>
              </div>
            </div>

            {/* Detailed rows */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                Address Details
              </p>
              <ResultRow label="IP Address" value={`${result.ipAddress}/${result.cidr}`} highlight />
              <ResultRow label="Subnet Mask" value={result.subnetMask} />
              <ResultRow label="Wildcard Mask" value={result.wildcardMask} />
              <ResultRow label="First Usable Host" value={result.firstHost} />
              <ResultRow label="Last Usable Host" value={result.lastHost} />
              <ResultRow label="Network Bits" value={String(result.networkBits)} mono={false} />
              <ResultRow label="Host Bits" value={String(result.hostBits)} mono={false} />
            </div>

            {/* Binary Visualization (collapsible) */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <button
                onClick={() => setShowBinary((v) => !v)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-semibold text-gray-700">Binary Visualization</span>
                {showBinary ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </button>

              <AnimatePresence>
                {showBinary && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 space-y-4 border-t border-gray-100">
                      {/* Legend */}
                      <div className="flex items-center gap-4 pt-4 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <span className="w-5 h-5 bg-primary-500 rounded text-[10px] text-white flex items-center justify-center font-bold">
                            1
                          </span>
                          <span className="text-xs text-gray-500">Network bit (1)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-5 h-5 bg-amber-400 rounded text-[10px] text-white flex items-center justify-center font-bold">
                            1
                          </span>
                          <span className="text-xs text-gray-500">Host bit (1)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-5 h-5 bg-primary-100 rounded text-[10px] text-primary-400 flex items-center justify-center font-bold">
                            0
                          </span>
                          <span className="text-xs text-gray-500">Network bit (0)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-5 h-5 bg-amber-50 rounded text-[10px] text-amber-300 flex items-center justify-center font-bold">
                            0
                          </span>
                          <span className="text-xs text-gray-500">Host bit (0)</span>
                        </div>
                      </div>

                      <div className="space-y-3 overflow-x-auto">
                        <BinaryRow
                          label="IP Address"
                          binary={result.binaryIp}
                          networkBits={result.cidr}
                          colorize
                        />
                        <BinaryRow
                          label="Subnet Mask"
                          binary={result.binarySubnetMask}
                          networkBits={result.cidr}
                        />
                        <BinaryRow
                          label="Network Address"
                          binary={result.binaryNetworkAddress}
                          networkBits={result.cidr}
                        />
                        <BinaryRow
                          label="Broadcast Address"
                          binary={result.binaryBroadcastAddress}
                          networkBits={result.cidr}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* CIDR Reference (collapsible) */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <button
                onClick={() => setShowReference((v) => !v)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-semibold text-gray-700">CIDR Reference Table</span>
                {showReference ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </button>

              <AnimatePresence>
                {showReference && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-gray-100 overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">
                              Prefix
                            </th>
                            <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">
                              Subnet Mask
                            </th>
                            <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500">
                              Usable Hosts
                            </th>
                            <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 hidden sm:table-cell">
                              Common Use
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {CIDR_PRESETS.map((preset) => (
                            <tr
                              key={preset.prefix}
                              onClick={() => handlePreset(preset.prefix)}
                              className={cn(
                                'cursor-pointer transition-colors hover:bg-gray-50',
                                parseInt(cidrInput, 10) === preset.prefix &&
                                  'bg-primary-50 hover:bg-primary-50'
                              )}
                            >
                              <td className="px-4 py-2.5 font-mono font-bold text-gray-800 text-sm">
                                {preset.label}
                              </td>
                              <td className="px-4 py-2.5 font-mono text-xs text-gray-500">
                                {numberToIP(cidrToMask(preset.prefix))}
                              </td>
                              <td className="px-4 py-2.5 text-right font-mono text-xs text-gray-700">
                                {preset.hosts.toLocaleString()}
                              </td>
                              <td className="px-4 py-2.5 text-xs text-gray-400 hidden sm:table-cell">
                                {preset.usage}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
