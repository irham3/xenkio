
import { useState, useMemo } from 'react';
import { calculatePasswordStrength, PasswordStrength } from '../lib/password-utils';

export function usePasswordStrength() {
    const [password, setPassword] = useState('');
    const [isVisible, setIsVisible] = useState(false);

    const strength = useMemo<PasswordStrength>(() => {
        return calculatePasswordStrength(password);
    }, [password]);

    const toggleVisibility = () => setIsVisible(!isVisible);

    const generatePassword = (length = 16) => {
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
        let retVal = '';
        for (let i = 0, n = charset.length; i < length; ++i) {
            retVal += charset.charAt(Math.floor(Math.random() * n));
        }
        setPassword(retVal);
    };

    return {
        password,
        setPassword,
        isVisible,
        toggleVisibility,
        strength,
        generatePassword
    };
}
