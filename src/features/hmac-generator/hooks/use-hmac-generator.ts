
import { useState, useMemo } from 'react';
import { generateHmac, HmacAlgorithm, OutputFormat } from '../lib/hmac-utils';

export function useHmacGenerator() {
    const [message, setMessage] = useState('');
    const [secret, setSecret] = useState('');
    const [algorithm, setAlgorithm] = useState<HmacAlgorithm>('SHA256');
    const [format, setFormat] = useState<OutputFormat>('Hex');
    const [isSecretVisible, setIsSecretVisible] = useState(false);

    const result = useMemo(() => {
        return generateHmac(message, secret, algorithm, format);
    }, [message, secret, algorithm, format]);

    const toggleSecretVisibility = () => setIsSecretVisible(!isSecretVisible);

    const reset = () => {
        setMessage('');
        setSecret('');
        setAlgorithm('SHA256');
        setFormat('Hex');
    };

    return {
        message,
        setMessage,
        secret,
        setSecret,
        algorithm,
        setAlgorithm,
        format,
        setFormat,
        isSecretVisible,
        toggleSecretVisibility,
        result,
        reset
    };
}
