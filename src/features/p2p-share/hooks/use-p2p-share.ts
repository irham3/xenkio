'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { DataConnection, Peer as PeerType } from 'peerjs';
import type { ConnectionStatus, ReceivedItem, TransferMode, TransferPayload } from '../types';

export function useP2PShare() {
    const peerRef = useRef<PeerType | null>(null);
    const connRef = useRef<DataConnection | null>(null);

    const [peerId, setPeerId] = useState<string | null>(null);
    const [remotePeerId, setRemotePeerId] = useState('');
    const [status, setStatus] = useState<ConnectionStatus>('idle');
    const [mode, setMode] = useState<TransferMode>('receive');
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
                    id: crypto.randomUUID(),
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

    useEffect(() => {
        setStatus('initializing');

        import('peerjs')
            .then(({ default: Peer }) => {
                const peer = new Peer();
                peerRef.current = peer;

                peer.on('open', (id) => {
                    setPeerId(id);
                    setStatus('ready');
                });

                peer.on('connection', (conn) => {
                    bindConn(conn);
                });

                peer.on('error', (err) => {
                    setError(err.message);
                    setStatus('error');
                });

                peer.on('disconnected', () => {
                    if (!peer.destroyed) {
                        setStatus('ready');
                    }
                });
            })
            .catch((err: Error) => {
                setError('Failed to load PeerJS: ' + err.message);
                setStatus('error');
            });

        return () => {
            peerRef.current?.destroy();
            peerRef.current = null;
        };
    }, [bindConn]);

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
        remotePeerId,
        setRemotePeerId,
        status,
        mode,
        setMode,
        receivedItems,
        sentCount,
        error,
        connect,
        sendText,
        sendFile,
        disconnect,
        clearReceived,
    };
}
