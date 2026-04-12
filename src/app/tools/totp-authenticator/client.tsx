'use client';

import { useRef } from 'react';
import { Plus, Download, Upload, Trash2, ShieldCheck } from 'lucide-react';
import { useTotpAuthenticator } from '@/features/totp-authenticator/hooks/use-totp-authenticator';
import { AccountCard } from '@/features/totp-authenticator/components/account-card';
import { AddAccountModal } from '@/features/totp-authenticator/components/add-account-modal';
import { cn } from '@/lib/utils';

export function TotpAuthenticatorClient() {
    const {
        accounts,
        codes,
        showAddModal,
        showClearConfirm,
        setShowAddModal,
        setShowClearConfirm,
        addAccount,
        removeAccount,
        handleClearAll,
        handleExport,
        handleImport,
        handleQrScan,
        copyCode,
    } = useTotpAuthenticator();

    const importRef = useRef<HTMLInputElement>(null);

    const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const text = ev.target?.result;
            if (typeof text === 'string') handleImport(text);
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    return (
        <div className="w-full">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors cursor-pointer shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        New Account
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                        title="Export accounts as text file"
                    >
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                    <button
                        onClick={() => importRef.current?.click()}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                        title="Import accounts from text file"
                    >
                        <Upload className="w-4 h-4" />
                        Import
                        <input
                            ref={importRef}
                            type="file"
                            accept=".txt,text/plain"
                            className="hidden"
                            onChange={handleImportFile}
                        />
                    </button>
                    {accounts.length > 0 && (
                        <button
                            onClick={() => setShowClearConfirm(true)}
                            className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-error-600 bg-white border border-error-200 rounded-xl hover:bg-error-50 transition-colors cursor-pointer"
                            title="Clear all accounts"
                        >
                            <Trash2 className="w-4 h-4" />
                            Clear All
                        </button>
                    )}
                </div>
            </div>

            {/* Account Grid */}
            {accounts.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center">
                    <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <ShieldCheck className="w-7 h-7 text-primary-500" />
                    </div>
                    <h3 className="text-base font-bold text-gray-900 mb-2">No accounts yet</h3>
                    <p className="text-sm text-gray-500 max-w-xs mx-auto mb-6">
                        Add your first 2FA account by entering a secret key or scanning a QR code from your authenticator app.
                    </p>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        Add Account
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {accounts.map(account => (
                        <AccountCard
                            key={account.id}
                            account={account}
                            codeEntry={codes[account.id]}
                            onCopy={copyCode}
                            onRemove={removeAccount}
                        />
                    ))}
                </div>
            )}

            {/* Clear Confirm Dialog */}
            {showClearConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm border border-gray-200 p-6 space-y-4">
                        <div className="space-y-1">
                            <h3 className="text-base font-bold text-gray-900">Clear all accounts?</h3>
                            <p className="text-sm text-gray-500">
                                This will permanently remove all {accounts.length} account{accounts.length !== 1 ? 's' : ''} from this device. This action cannot be undone.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowClearConfirm(false)}
                                className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleClearAll}
                                className={cn(
                                    'flex-1 px-4 py-2.5 text-sm font-semibold rounded-xl transition-colors cursor-pointer',
                                    'bg-error-500 text-white hover:bg-error-600'
                                )}
                            >
                                Clear All
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Account Modal */}
            {showAddModal && (
                <AddAccountModal
                    onAdd={addAccount}
                    onClose={() => setShowAddModal(false)}
                    onQrScan={handleQrScan}
                />
            )}
        </div>
    );
}
