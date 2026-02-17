'use client';

import { useState, useCallback, useEffect } from 'react';
import * as jose from 'jose';
import { JwtOptions, JwtResult, DEFAULT_HEADER, createDefaultPayload } from '../types';

export function useJwtDebugger() {
    const [options, setOptions] = useState<JwtOptions>({
        mode: 'encode',
        token: '',
        secret: 'your-256-bit-secret',
        // Use a static date (2024-01-01) for initial render to avoid hydration mismatch
        payload: createDefaultPayload(1704067200),
        header: DEFAULT_HEADER,
        algorithm: 'HS256'
    });

    const [result, setResult] = useState<JwtResult>({
        decodedHeader: null,
        decodedPayload: null,
        encodedToken: '',
        isValid: false,
        isVerified: null,
        verificationError: null,
        error: null
    });

    const [isProcessing, setIsProcessing] = useState(false);

    const updateOption = useCallback(<K extends keyof JwtOptions>(key: K, value: JwtOptions[K]) => {
        setOptions(prev => ({ ...prev, [key]: value }));
    }, []);

    const decode = useCallback(async () => {
        if (!options.token) {
            setResult({
                decodedHeader: null,
                decodedPayload: null,
                encodedToken: '',
                isValid: false,
                isVerified: null,
                verificationError: null,
                error: null
            });
            return;
        }

        try {
            const header = jose.decodeProtectedHeader(options.token);
            const payload = jose.decodeJwt(options.token);

            let isVerified = null;
            let verificationError = null;

            if (options.secret) {
                try {
                    const secretKey = new TextEncoder().encode(options.secret);
                    await jose.jwtVerify(options.token.trim(), secretKey, {
                        clockTolerance: 999999999, // Effectively ignore exp/nbf by allowing huge clock skew
                        algorithms: ['HS256', 'HS384', 'HS512']
                    });
                    isVerified = true;
                } catch (e) {
                    isVerified = false;
                    verificationError = e instanceof Error ? e.message : 'Signature verification failed';
                }
            }

            setResult({
                decodedHeader: header,
                decodedPayload: payload,
                encodedToken: '',
                isValid: true,
                isVerified,
                verificationError,
                error: null
            });
        } catch {
            setResult(prev => ({
                ...prev,
                isValid: false,
                isVerified: false,
                verificationError: 'Invalid JWT format',
                error: 'Invalid JWT format'
            }));
        }
    }, [options.token, options.secret]);

    const encode = useCallback(async () => {
        setIsProcessing(true);
        try {
            const parsedPayload = JSON.parse(options.payload);
            const secretKey = new TextEncoder().encode(options.secret);

            const jwt = await new jose.SignJWT(parsedPayload)
                .setProtectedHeader({ alg: options.algorithm })
                .sign(secretKey);

            setResult({
                decodedHeader: null,
                decodedPayload: null,
                encodedToken: jwt,
                isValid: true,
                isVerified: true,
                verificationError: null,
                error: null
            });
        } catch (err) {
            setResult(prev => ({
                ...prev,
                error: err instanceof Error ? err.message : 'Encoding failed'
            }));
        } finally {
            setIsProcessing(false);
        }
    }, [options.payload, options.secret, options.algorithm]);

    useEffect(() => {
        if (options.mode === 'decode') {
            decode();
        } else {
            encode();
        }
    }, [options.mode, options.token, options.secret, options.payload, options.algorithm, decode, encode]);

    const trigger = useCallback(() => {
        if (options.mode === 'decode') {
            decode();
        } else {
            encode();
        }
    }, [options.mode, decode, encode]);

    return {
        options,
        result,
        isProcessing,
        updateOption,
        trigger
    };
}
