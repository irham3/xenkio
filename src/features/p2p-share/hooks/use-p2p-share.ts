'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { DataConnection, Peer as PeerType } from 'peerjs';
import type { ConnectionStatus, ReceivedItem, TransferMode, TransferPayload } from '../types';

const generatePeerId = () => `xk-${Math.random().toString(36).slice(2, 8)}`;
const CUSTOM_PEER_ID_REGEX = /^[a-z0-9-]{4,20}$/;

const createItemId = () => {
    if (typeof globalThis.crypto !== 'undefined' && typeof globalThis.crypto.randomUUID === 'function') {
        return globalThis.crypto.randomUUID();
    }

    return `item-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

export function useP2PShare() {
    const peerRef = useRef<PeerType | null>(null);
    const connRef = useRef<DataConnection | null>(null);

    const [peerId, setPeerId] = useState<string | null>(null);
    const [remotePeerId, setRemotePeerId] = useState('');
    const [status, setStatus] = useState<ConnectionStatus>('idle');
    const [mode, setMode] = useState<TransferMode>('receive');
    const [customPeerId, setCustomPeerId] = useState<string | null>(null);
    const [receivedItems, setReceivedItems] = useState<ReceivedItem[]>([]);
    const [sentCount, setSentCount] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const bindConn = useCallback((conn: DataConnection) => {
        connRef.current = conn;
        setStatus('connected');
        setError(null);

        conn.on('data', (data) => {
            setReceivedItems((prev) => [
                {
                    id: createItemId(),
                    payload: data as TransferPayload,
                    timestamp: Date.now(),
                },
                ...prev,
            ]);
        });

        conn.on('close', () => {
            connRef.current = null;
            setStatus('ready');
        });

        conn.on('error', (err) => {
            setError(err.message);
        });
    }, []);

    const applyCustomPeerId = useCallback((nextPeerId: string) => {
        const normalized = nextPeerId.trim().toLowerCase();

        if (!normalized) {
            setCustomPeerId(null);
            return { ok: true as const, mode: 'random' as const };
        }

        if (!CUSTOM_PEER_ID_REGEX.test(normalized)) {
            return {
                ok: false as const,
                error: 'Peer ID must be 4-20 characters and use only a-z, 0-9, or -',
            };
        }

        setCustomPeerId(normalized);
        return { ok: true as const, mode: 'custom' as const, value: normalized };
    }, []);

    useEffect(() => {
        setStatus('initializing');
        setError(null);
        setPeerId(null);
        let disposed = false;

        import('peerjs')
            .then(({ default: Peer }) => {
                const initPeer = (attempt = 0, forceRandom = false) => {
                    if (disposed) return;

                    const targetId = !forceRandom && customPeerId ? customPeerId : generatePeerId();
                    const peer = new Peer(targetId);
                    peerRef.current = peer;

                    peer.on('open', (id) => {
                        setPeerId(id);
                        if (id !== targetId) {
                            setCustomPeerId(null);
                        }
                        setStatus('ready');
                    });

                    peer.on('connection', (conn) => {
                        bindConn(conn);
                    });

                    peer.on('error', (err) => {
                        const errType = (err as { type?: string }).type;

                        // Fallback to random ID when custom ID is unavailable.
                        if (errType === 'unavailable-id' && !forceRandom && customPeerId) {
                            peer.destroy();
                            setError(`Peer ID "${customPeerId}" is unavailable. Switched to random ID.`);
                            setCustomPeerId(null);
                            initPeer(0, true);
                            return;
                        }

                        // Retry with another short random ID when current one is unavailable.
                        if (errType === 'unavailable-id' && attempt < 4) {
                            peer.destroy();
                            initPeer(attempt + 1, true);
                            return;
                        }

                        setError(err.message);
                        setStatus('error');
                    });

                    peer.on('disconnected', () => {
                        if (!peer.destroyed) {
                            setStatus('ready');
                        }
                    });
                };

                initPeer();
            })
            .catch((err: Error) => {
                setError('Failed to load PeerJS: ' + err.message);
                setStatus('error');
            });

        return () => {
            disposed = true;
            connRef.current = null;
            peerRef.current?.destroy();
            peerRef.current = null;
        };
    }, [bindConn, customPeerId]);

    const connect = useCallback(
        (targetId: string) => {
            if (!peerRef.current || status !== 'ready') return;
            setStatus('connecting');
            setError(null);

            const conn = peerRef.current.connect(targetId, { reliable: true });

            conn.on('open', () => {
                bindConn(conn);
            });

            conn.on('error', (err) => {
                setError(err.message);
                setStatus('ready');
            });
        },
        [status, bindConn],
    );

    const sendText = useCallback((text: string): boolean => {
        if (!connRef.current?.open) return false;
        const payload: TransferPayload = { type: 'text', text };
        connRef.current.send(payload);
        setSentCount((n) => n + 1);
        return true;
    }, []);

    const sendFile = useCallback((file: File): Promise<boolean> => {
        return new Promise((resolve) => {
            if (!connRef.current?.open) {
                resolve(false);
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result;
                if (!(result instanceof ArrayBuffer)) {
                    resolve(false);
                    return;
                }
                const payload: TransferPayload = {
                    type: 'file',
                    file: {
                        name: file.name,
                        mimeType: file.type,
                        size: file.size,
                        data: result,
                    },
                };
                connRef.current?.send(payload);
                setSentCount((n) => n + 1);
                resolve(true);
            };
            reader.onerror = () => resolve(false);
            reader.readAsArrayBuffer(file);
        });
    }, []);

    const disconnect = useCallback(() => {
        connRef.current?.close();
        connRef.current = null;
        setStatus('ready');
    }, []);

    const clearReceived = useCallback(() => {
        setReceivedItems([]);
    }, []);

    return {
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
    };
}
