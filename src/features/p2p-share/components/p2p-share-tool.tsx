'use client';

import { useRef, useState } from 'react';
import {
    AlertCircle,
    Check,
    Copy,
    Download,
    FileText,
    Loader2,
    MessageSquare,
    Send,
    Trash2,
    Upload,
    Wifi,
    WifiOff,
    X,
} from 'lucide-react';
import { toast } from 'sonner';
import { useP2PShare } from '../hooks/use-p2p-share';
import { downloadFile, formatFileSize } from '../lib/peer-utils';
import type { ConnectionStatus, ReceivedItem } from '../types';

function StatusBadge({ status }: { status: ConnectionStatus }) {
    const map: Record<
        ConnectionStatus,
        { label: string; className: string }
    > = {
        idle: { label: 'Idle', className: 'bg-gray-100 text-gray-500' },
        initializing: {
            label: 'Initializing...',
            className: 'bg-yellow-50 text-yellow-600',
        },
        ready: { label: 'Ready', className: 'bg-blue-50 text-blue-600' },
        connecting: {
            label: 'Connecting...',
            className: 'bg-yellow-50 text-yellow-600',
        },
        connected: {
            label: 'Connected',
            className: 'bg-green-50 text-green-600',
        },
        error: { label: 'Error', className: 'bg-red-50 text-red-600' },
        disconnected: {
            label: 'Disconnected',
            className: 'bg-gray-100 text-gray-500',
        },
    };

    const { label, className } = map[status];
    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${className}`}
        >
            {status === 'initializing' || status === 'connecting' ? (
                <Loader2 size={10} className="animate-spin" />
            ) : status === 'connected' ? (
                <Wifi size={10} />
            ) : status === 'error' || status === 'disconnected' ? (
                <WifiOff size={10} />
            ) : null}
            {label}
        </span>
    );
}

function ReceivedItemCard({ item, onCopy, onDownload }: {
    item: ReceivedItem;
    onCopy: (text: string) => void;
    onDownload: (item: ReceivedItem) => void;
}) {
    const isText = item.payload.type === 'text';
    return (
        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div className="w-8 h-8 bg-white border border-gray-200 rounded-lg flex items-center justify-center shrink-0">
                {isText
                    ? <MessageSquare size={15} className="text-gray-500" />
                    : <FileText size={15} className="text-gray-500" />
                }
            </div>
            <div className="flex-1 min-w-0">
                {isText ? (
                    <>
                        <p className="text-xs text-gray-400 mb-1">
                            Text · {new Date(item.timestamp).toLocaleTimeString()}
                        </p>
                        <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">
                            {item.payload.text}
                        </p>
                        <button
                            onClick={() => onCopy(item.payload.text ?? '')}
                            className="mt-2 flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors"
                        >
                            <Copy size={12} />
                            Copy text
                        </button>
                    </>
                ) : (
                    <>
                        <p className="text-xs text-gray-400 mb-1">
                            File · {new Date(item.timestamp).toLocaleTimeString()}
                        </p>
                        <p className="text-sm font-medium text-gray-800 truncate">
                            {item.payload.file?.name}
                        </p>
                        <p className="text-xs text-gray-400">
                            {formatFileSize(item.payload.file?.size ?? 0)}
                        </p>
                        <button
                            onClick={() => onDownload(item)}
                            className="mt-2 flex items-center gap-1.5 text-xs text-blue-500 hover:text-blue-700 transition-colors font-medium"
                        >
                            <Download size={12} />
                            Download
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

export function P2PShareTool() {
    const {
        peerId,
        customPeerId,
        remotePeerId,
        setRemotePeerId,
        status,
        mode,
        setMode,
        receivedItems,
        sentCount,
        error,
        applyCustomPeerId,
        connect,
        sendText,
        sendFile,
        disconnect,
        clearReceived,
    } = useP2PShare();

    const [textInput, setTextInput] = useState('');
    const [idCopied, setIdCopied] = useState(false);
    const [sendingFile, setSendingFile] = useState(false);
    const [peerIdInput, setPeerIdInput] = useState(() => customPeerId ?? '');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isConnected = status === 'connected';
    const isReady = status === 'ready';

    const copyToClipboard = async (text: string) => {
        try {
            if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(text);
                return true;
            }

            if (typeof document !== 'undefined') {
                const textarea = document.createElement('textarea');
                textarea.value = text;
                textarea.setAttribute('readonly', '');
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.select();

                const copied = document.execCommand('copy');
                document.body.removeChild(textarea);
                return copied;
            }
        } catch {
            return false;
        }

        return false;
    };

    const handleCopyPeerId = async () => {
        if (!peerId) return;
        const copied = await copyToClipboard(peerId);
        if (!copied) {
            toast.error('Clipboard is not available on this browser/context');
            return;
        }

        setIdCopied(true);
        toast.success('Peer ID copied to clipboard');
        setTimeout(() => setIdCopied(false), 2000);
    };

    const handleConnect = () => {
        if (remotePeerId.trim()) connect(remotePeerId.trim());
    };

    const handleApplyPeerId = () => {
        const result = applyCustomPeerId(peerIdInput);
        if (!result.ok) {
            toast.error(result.error);
            return;
        }

        if (result.mode === 'custom') {
            setPeerIdInput(result.value);
        }

        toast.success(
            result.mode === 'custom'
                ? 'Applying custom Peer ID...'
                : 'Switched to random Peer ID...',
        );
    };

    const handleUseRandomPeerId = () => {
        setPeerIdInput('');
        const result = applyCustomPeerId('');
        if (result.ok) {
            toast.success('Switched to random Peer ID...');
        }
    };

    const handleSendText = () => {
        if (!textInput.trim()) return;
        const ok = sendText(textInput.trim());
        if (ok) {
            setTextInput('');
            toast.success('Text sent!');
        } else {
            toast.error('Not connected to a peer');
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setSendingFile(true);
        const ok = await sendFile(file);
        setSendingFile(false);
        if (ok) {
            toast.success(`"${file.name}" sent!`);
        } else {
            toast.error('Failed to send file');
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleCopyText = async (text: string) => {
        const copied = await copyToClipboard(text);
        if (!copied) {
            toast.error('Failed to copy text');
            return;
        }

        toast.success('Copied to clipboard');
    };

    const handleDownload = (item: ReceivedItem) => {
        if (item.payload.file) {
            downloadFile(
                item.payload.file.data,
                item.payload.file.name,
                item.payload.file.mimeType,
            );
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-5">
            {/* Mode toggle */}
            <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
                {(['receive', 'send'] as const).map((m) => (
                    <button
                        key={m}
                        onClick={() => setMode(m)}
                        className={`px-6 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                            mode === m
                                ? 'bg-white shadow text-gray-900'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        {m}
                    </button>
                ))}
            </div>

            {/* Your Peer ID */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="font-semibold text-gray-900">Your Peer ID</h2>
                    <StatusBadge status={status} />
                </div>
                <div className="flex items-center gap-3">
                    <code className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono text-gray-800 truncate select-all">
                        {peerId ?? 'Generating…'}
                    </code>
                    <button
                        onClick={handleCopyPeerId}
                        disabled={!peerId}
                        className="flex items-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-700 disabled:opacity-40 transition-all shrink-0"
                    >
                        {idCopied
                            ? <Check size={16} />
                            : <Copy size={16} />
                        }
                        <span className="text-sm">{idCopied ? 'Copied' : 'Copy'}</span>
                    </button>
                </div>
                <p className="mt-2 text-xs text-gray-400">
                    Share this ID with the other person so they can connect to you.
                </p>

                <div className="mt-4 border-t border-gray-100 pt-4 space-y-2">
                    <label className="block text-xs font-medium text-gray-600">
                        Custom Peer ID (optional)
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <input
                            type="text"
                            value={peerIdInput}
                            onChange={(e) => setPeerIdInput(e.target.value)}
                            placeholder="e.g. booth-a1"
                            className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                        />
                        <button
                            onClick={handleApplyPeerId}
                            className="px-4 py-2 rounded-xl bg-gray-900 text-white text-sm hover:bg-gray-700 transition-all"
                        >
                            Apply
                        </button>
                        <button
                            onClick={handleUseRandomPeerId}
                            className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 text-sm hover:bg-gray-50 transition-all"
                        >
                            Use Random
                        </button>
                    </div>
                    <p className="text-[11px] text-gray-400">
                        Allowed: 4-20 chars, lowercase letters, numbers, and hyphen (-).
                        Applying a new ID will reconnect this device.
                    </p>
                </div>
            </div>

            {/* Error banner */}
            {error && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700">
                    <AlertCircle size={16} className="shrink-0" />
                    <span className="text-sm">{error}</span>
                </div>
            )}

            {/* SEND mode */}
            {mode === 'send' && (
                <div className="space-y-4">
                    {/* Connect panel */}
                    {!isConnected && (
                        <div className="bg-white border border-gray-200 rounded-2xl p-6">
                            <h2 className="font-semibold text-gray-900 mb-4">Connect to Peer</h2>
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={remotePeerId}
                                    onChange={(e) => setRemotePeerId(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
                                    placeholder="Enter receiver's Peer ID…"
                                    disabled={!isReady}
                                    className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:opacity-50"
                                />
                                <button
                                    onClick={handleConnect}
                                    disabled={!isReady || !remotePeerId.trim()}
                                    className="flex items-center gap-2 px-5 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-700 disabled:opacity-40 transition-all whitespace-nowrap text-sm"
                                >
                                    {status === 'connecting'
                                        ? <Loader2 size={16} className="animate-spin" />
                                        : <Wifi size={16} />
                                    }
                                    Connect
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Send panel */}
                    {isConnected && (
                        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
                            <div className="flex items-center justify-between">
                                <h2 className="font-semibold text-gray-900">Send Data</h2>
                                <button
                                    onClick={disconnect}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                                >
                                    <X size={14} />
                                    Disconnect
                                </button>
                            </div>

                            {/* Text */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Send Text
                                </label>
                                <textarea
                                    value={textInput}
                                    onChange={(e) => setTextInput(e.target.value)}
                                    placeholder="Type your message…"
                                    rows={3}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
                                />
                                <button
                                    onClick={handleSendText}
                                    disabled={!textInput.trim()}
                                    className="mt-2 flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-700 disabled:opacity-40 transition-all text-sm"
                                >
                                    <Send size={14} />
                                    Send Text
                                </button>
                            </div>

                            <hr className="border-gray-100" />

                            {/* File */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Send File
                                </label>
                                <label className="flex items-center gap-3 px-4 py-4 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-gray-400 transition-colors">
                                    {sendingFile ? (
                                        <>
                                            <Loader2 size={18} className="text-gray-400 animate-spin" />
                                            <span className="text-sm text-gray-500">Sending…</span>
                                        </>
                                    ) : (
                                        <>
                                            <Upload size={18} className="text-gray-400" />
                                            <span className="text-sm text-gray-500">
                                                Click to select a file to send
                                            </span>
                                        </>
                                    )}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        className="hidden"
                                        onChange={handleFileChange}
                                        disabled={sendingFile}
                                    />
                                </label>
                            </div>

                            {sentCount > 0 && (
                                <p className="text-xs text-gray-400">
                                    {sentCount} item{sentCount !== 1 ? 's' : ''} sent this session
                                </p>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* RECEIVE mode */}
            {mode === 'receive' && (
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                            Received Items
                            {receivedItems.length > 0 && (
                                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                                    {receivedItems.length}
                                </span>
                            )}
                        </h2>
                        {receivedItems.length > 0 && (
                            <button
                                onClick={clearReceived}
                                className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-500 transition-colors"
                            >
                                <Trash2 size={14} />
                                Clear all
                            </button>
                        )}
                    </div>

                    {isReady && receivedItems.length === 0 && (
                        <div className="flex flex-col items-center py-12 text-center">
                            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <Wifi size={24} className="text-gray-400" />
                            </div>
                            <p className="font-medium text-gray-700 mb-1">
                                Waiting for connection
                            </p>
                            <p className="text-sm text-gray-400">
                                Share your Peer ID above with the sender
                            </p>
                        </div>
                    )}

                    {isConnected && receivedItems.length === 0 && (
                        <div className="flex flex-col items-center py-12 text-center">
                            <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mb-4">
                                <Check size={24} className="text-green-500" />
                            </div>
                            <p className="font-medium text-gray-700 mb-1">Connected!</p>
                            <p className="text-sm text-gray-400">
                                Waiting for the sender to send data…
                            </p>
                        </div>
                    )}

                    {receivedItems.length > 0 && (
                        <div className="space-y-3">
                            {receivedItems.map((item) => (
                                <ReceivedItemCard
                                    key={item.id}
                                    item={item}
                                    onCopy={handleCopyText}
                                    onDownload={handleDownload}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
