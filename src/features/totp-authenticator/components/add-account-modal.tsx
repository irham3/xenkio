'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { X, Upload, KeyRound, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TotpAlgorithm } from '../types';
import type { AddAccountForm } from '../hooks/use-totp-authenticator';

interface AddAccountModalProps {
    onAdd: (form: AddAccountForm) => void;
    onClose: () => void;
    onQrScan: (file: File) => Promise<Partial<AddAccountForm> | null>;
}

const DEFAULT_FORM: AddAccountForm = {
    name: '',
    issuer: '',
    secret: '',
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
};

export function AddAccountModal({ onAdd, onClose, onQrScan }: AddAccountModalProps) {
    const [form, setForm] = useState<AddAccountForm>(DEFAULT_FORM);
    const [tab, setTab] = useState<'manual' | 'qr'>('manual');
    const [isDragging, setIsDragging] = useState(false);
    const [qrError, setQrError] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const secretRef = useRef<HTMLInputElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const processQrFile = useCallback(async (file: File) => {
        setIsScanning(true);
        setQrError(null);
        const result = await onQrScan(file);
        setIsScanning(false);
        if (result) {
            setForm(prev => ({ ...prev, ...result }));
            setTab('manual');
        } else {
            setQrError('Could not read QR code. Try a clearer image.');
        }
    }, [onQrScan]);

    const handlePaste = useCallback(async (e: ClipboardEvent) => {
        const items = e.clipboardData?.items;
        if (!items) return;
        for (const item of items) {
            if (item.type.startsWith('image/')) {
                const file = item.getAsFile();
                if (file) {
                    e.preventDefault();
                    await processQrFile(file);
                    return;
                }
            }
        }
    }, [processQrFile]);

    useEffect(() => {
        document.addEventListener('paste', handlePaste);
        return () => document.removeEventListener('paste', handlePaste);
    }, [handlePaste]);

    const handleFileDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            await processQrFile(file);
        }
    }, [processQrFile]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) await processQrFile(file);
        e.target.value = '';
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim() || !form.secret.trim()) return;
        onAdd(form);
    };

    const isValid = form.name.trim().length > 0 && form.secret.trim().length > 0;

    return (
        <div
            ref={overlayRef}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
        >
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-gray-200 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-base font-bold text-gray-900">Add Account</h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-1 p-1.5 mx-6 mt-4 bg-gray-100 rounded-xl border border-gray-200">
                    <button
                        onClick={() => setTab('manual')}
                        className={cn(
                            'flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer',
                            tab === 'manual'
                                ? 'bg-white text-primary-600 shadow-sm border border-gray-100'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                        )}
                    >
                        <KeyRound className="w-3.5 h-3.5" />
                        Manual Entry
                    </button>
                    <button
                        onClick={() => setTab('qr')}
                        className={cn(
                            'flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer',
                            tab === 'qr'
                                ? 'bg-white text-primary-600 shadow-sm border border-gray-100'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                        )}
                    >
                        <Upload className="w-3.5 h-3.5" />
                        QR Code
                    </button>
                </div>

                <div className="px-6 pb-6 pt-4">
                    {tab === 'qr' ? (
                        <div className="space-y-3">
                            <div
                                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                onDragLeave={() => setIsDragging(false)}
                                onDrop={handleFileDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className={cn(
                                    'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors',
                                    isDragging
                                        ? 'border-primary-400 bg-primary-50'
                                        : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                                )}
                            >
                                <Upload className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                                <p className="text-sm font-medium text-gray-700">
                                    {isScanning ? 'Scanning...' : 'Drop QR image here or click to browse'}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">Also paste with Ctrl+V</p>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                            </div>
                            {qrError && (
                                <p className="text-sm text-error-600 bg-error-50 rounded-lg px-3 py-2">{qrError}</p>
                            )}
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Account Name <span className="text-error-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="user@example.com"
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Issuer
                                    </label>
                                    <input
                                        type="text"
                                        value={form.issuer}
                                        onChange={e => setForm(prev => ({ ...prev, issuer: e.target.value }))}
                                        placeholder="GitHub"
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Secret Key <span className="text-error-500">*</span>
                                </label>
                                <input
                                    ref={secretRef}
                                    type="text"
                                    value={form.secret}
                                    onChange={e => setForm(prev => ({ ...prev, secret: e.target.value.toUpperCase().replace(/\s/g, '') }))}
                                    placeholder="JBSWY3DPEHPK3PXP"
                                    className="w-full px-3 py-2 text-sm font-mono border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Algorithm</label>
                                    <div className="relative">
                                        <select
                                            value={form.algorithm}
                                            onChange={e => setForm(prev => ({ ...prev, algorithm: e.target.value as TotpAlgorithm }))}
                                            className="w-full appearance-none px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent bg-white cursor-pointer pr-8"
                                        >
                                            <option value="SHA1">SHA1</option>
                                            <option value="SHA256">SHA256</option>
                                            <option value="SHA512">SHA512</option>
                                        </select>
                                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Digits</label>
                                    <div className="relative">
                                        <select
                                            value={form.digits}
                                            onChange={e => setForm(prev => ({ ...prev, digits: Number(e.target.value) as 6 | 8 }))}
                                            className="w-full appearance-none px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent bg-white cursor-pointer pr-8"
                                        >
                                            <option value={6}>6 digits</option>
                                            <option value={8}>8 digits</option>
                                        </select>
                                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!isValid}
                                    className={cn(
                                        'flex-1 px-4 py-2.5 text-sm font-semibold rounded-xl transition-colors cursor-pointer',
                                        isValid
                                            ? 'bg-primary-500 text-white hover:bg-primary-600'
                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    )}
                                >
                                    Add Account
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
