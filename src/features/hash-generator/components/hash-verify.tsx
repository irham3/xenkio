'use client';

import { useState } from 'react';
import { verifyHash as verifyHashUtil } from '../lib/hash-utils';
import { HASH_ALGORITHMS } from '../constants';
import { HashAlgorithm } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronDown, ShieldCheck, ShieldX, Zap, FileCheck, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export function HashVerify() {
    const [verifyText, setVerifyText] = useState('');
    const [verifyHash, setVerifyHash] = useState('');
    const [verifyAlgorithm, setVerifyAlgorithm] = useState<HashAlgorithm>('SHA256');
    const [isMatch, setIsMatch] = useState<boolean | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);

    const handleVerify = async () => {
        if (!verifyHash || !verifyText) {
            setIsMatch(null);
            return;
        }

        setIsVerifying(true);
        try {
            const match = await verifyHashUtil(verifyText, verifyHash, verifyAlgorithm);
            setIsMatch(match);
        } catch {
            setIsMatch(false);
        } finally {
            setIsVerifying(false);
        }
    };

    const handleReset = () => {
        setVerifyText('');
        setVerifyHash('');
        setVerifyAlgorithm('SHA256');
        setIsMatch(null);
        setIsVerifying(false);
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-soft">
            <div className="grid lg:grid-cols-5 gap-0">

                {/* LEFT PANEL: Inputs */}
                <div className="lg:col-span-2 p-5 lg:p-6 border-b lg:border-b-0 lg:border-r border-gray-100 bg-white">
                    <div className="space-y-5">
                        {/* Verify Text Input */}
                        <div className="space-y-2">
                            <Label htmlFor="verify-text" className="text-sm font-semibold text-gray-800">
                                Original Text
                            </Label>
                            <textarea
                                id="verify-text"
                                value={verifyText}
                                onChange={(e) => {
                                    setVerifyText(e.target.value);
                                    setIsMatch(null);
                                }}
                                placeholder="Enter the original text..."
                                className="w-full min-h-[100px] p-3 text-[14px] leading-relaxed bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 focus:bg-white outline-none transition-all resize-none placeholder:text-gray-400"
                            />
                        </div>

                        {/* Verify Algorithm Select */}
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-800">Algorithm</Label>
                            <div className="relative">
                                <select
                                    value={verifyAlgorithm}
                                    onChange={(e) => {
                                        setVerifyAlgorithm(e.target.value as HashAlgorithm);
                                        setIsMatch(null);
                                    }}
                                    className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-primary-500 focus:border-primary-500 block p-3 pr-10 outline-none transition-all hover:bg-gray-100 cursor-pointer"
                                >
                                    {HASH_ALGORITHMS.map((algo) => (
                                        <option key={algo.id} value={algo.id}>
                                            {algo.name}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                            </div>
                        </div>

                        {/* Hash to Verify Input */}
                        <div className="space-y-2">
                            <Label htmlFor="verify-hash" className="text-sm font-semibold text-gray-800">
                                Target Hash
                            </Label>
                            <Input
                                id="verify-hash"
                                value={verifyHash}
                                onChange={(e) => {
                                    setVerifyHash(e.target.value);
                                    setIsMatch(null);
                                }}
                                placeholder="Paste hash here..."
                                className={cn(
                                    "bg-gray-50 focus:bg-white font-mono text-sm",
                                    verifyHash && isMatch !== null && (isMatch
                                        ? "border-success-500 focus:ring-success-500/20"
                                        : "border-error-500 focus:ring-error-500/20")
                                )}
                            />
                        </div>

                        <div className="pt-2 flex gap-2">
                            <Button
                                onClick={handleVerify}
                                disabled={isVerifying || !verifyText || !verifyHash}
                                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white shadow-sm transition-all"
                            >
                                {isVerifying ? (
                                    <>
                                        <Zap className="w-4 h-4 mr-2 animate-pulse" />
                                        Verifying...
                                    </>
                                ) : (
                                    <>
                                        <ShieldCheck className="w-4 h-4 mr-2" />
                                        Verify Hash
                                    </>
                                )}
                            </Button>
                            <Button
                                onClick={handleReset}
                                variant="outline"
                                className="px-3 border-gray-200 hover:bg-gray-100"
                                title="Reset"
                            >
                                <RotateCcw className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* RIGHT PANEL: Results */}
                <div className="lg:col-span-3 p-5 lg:p-6 bg-gray-50/50 flex flex-col min-h-[300px] border-l border-gray-100">
                    <div className="flex flex-col h-full justify-center">
                        {isVerifying ? (
                            <div className="flex flex-col items-center justify-center p-8 opacity-60">
                                <span className="relative flex h-8 w-8 mb-4">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-8 w-8 bg-primary-500 justify-center items-center">
                                        <Zap className="w-4 h-4 text-white" />
                                    </span>
                                </span>
                                <h3 className="text-sm font-semibold text-gray-800 mb-1">Verifying...</h3>
                                <p className="text-xs text-gray-500">Comparing cryptographic signatures</p>
                            </div>
                        ) : isMatch !== null ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={cn(
                                    "p-8 rounded-2xl border-2 text-center transition-all duration-300 bg-white shadow-sm mx-auto w-full max-w-sm",
                                    isMatch
                                        ? "border-success-200 ring-4 ring-success-50"
                                        : "border-error-200 ring-4 ring-error-50"
                                )}
                            >
                                <div className={cn(
                                    "w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 shadow-sm",
                                    isMatch ? "bg-success-100 text-success-600" : "bg-error-100 text-error-600"
                                )}>
                                    {isMatch
                                        ? <ShieldCheck className="w-10 h-10" />
                                        : <ShieldX className="w-10 h-10" />
                                    }
                                </div>

                                <h4 className={cn(
                                    "text-xl font-bold mb-2 tracking-tight",
                                    isMatch ? "text-success-700" : "text-error-700"
                                )}>
                                    {isMatch ? "Match Confirmed" : "Match Failed"}
                                </h4>

                                <p className={cn(
                                    "text-sm font-medium leading-relaxed",
                                    isMatch ? "text-success-600/80" : "text-error-600/80"
                                )}>
                                    {isMatch
                                        ? "The provided hash is valid for the given text."
                                        : "The provided hash does not match the original text."
                                    }
                                </p>
                            </motion.div>
                        ) : (
                            <div className="flex flex-col items-center text-center p-8 opacity-60">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                    <FileCheck className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-sm font-semibold text-gray-800 mb-1">Ready to Verify</h3>
                                <p className="text-xs text-gray-500 max-w-[200px]">Enter original text and the hash to compare them instantly.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
