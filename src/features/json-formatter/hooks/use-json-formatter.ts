
import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';

export type Indentation = 2 | 4 | 'tab';

export function useJsonFormatter() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [indentation, setIndentation] = useState<Indentation>(2);

    // Auto-format effect with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (!input.trim()) {
                setOutput('');
                setError(null);
                return;
            }

            try {
                const parsed = JSON.parse(input);
                const space = indentation === 'tab' ? '\t' : indentation;
                const formatted = JSON.stringify(parsed, null, space);
                setOutput(formatted);
                setError(null);
            } catch (err: unknown) {
                // For auto-format, we just update the error state silently
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError('Invalid JSON');
                }
                // We generally don't clear output on intermediate errors during typing
                // to prevent flickering, unless the input is completely empty (handled above).
                // But if the parse fails, the 'formatted' output is technically invalid/stale.
                // Let's keep the previous output if possible, or clear it?
                // Clearing it might be less confusing than showing stale data.
                // However, typical behavior is to keep the old valid output until new valid input.
                // But for a formatter, seeing the output update is key.
                // I'll clear it for consistency with the manual action, usually.
                // Actually, let's NOT clear it. Let the user see the error overlay on input.
                // The output panel will just show the last valid format or be empty.
                // If I clear it, the user loses the formatted view while fixing a typo.
                // Let's TRY keeping it.
            }
        }, 800); // 800ms debounce for smoother typing experience

        return () => clearTimeout(timer);
    }, [input, indentation]);


    const formatJson = useCallback(() => {
        setError(null);
        if (!input.trim()) {
            setOutput('');
            return;
        }

        try {
            const parsed = JSON.parse(input);
            const space = indentation === 'tab' ? '\t' : indentation;
            const formatted = JSON.stringify(parsed, null, space);
            setOutput(formatted);
            toast.success('JSON formatted successfully');
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
                toast.error('Invalid JSON: ' + err.message);
            } else {
                setError('Unknown error');
                toast.error('Invalid JSON');
            }
            setOutput('');
        }
    }, [input, indentation]);

    const minifyJson = useCallback(() => {
        setError(null);
        if (!input.trim()) {
            setOutput('');
            return;
        }

        try {
            const parsed = JSON.parse(input);
            const minified = JSON.stringify(parsed);
            setOutput(minified);
            toast.success('JSON minified successfully');
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
                toast.error('Invalid JSON: ' + err.message);
            } else {
                setError('Unknown error');
                toast.error('Invalid JSON');
            }
            setOutput('');
        }
    }, [input]);

    const clear = useCallback(() => {
        setInput('');
        setOutput('');
        setError(null);
    }, []);

    const loadSample = useCallback(() => {
        const sample = {
            "project": "Xenkio",
            "version": 1.0,
            "features": ["JSON Formatter", "HMAC Generator", "Image Tools"],
            "settings": {
                "theme": "light",
                "notifications": true
            },
            "active": true
        };
        setInput(JSON.stringify(sample, null, 2));
        // Output defaults to empty, but the effect will pick it up and format it shortly.
        // Or we can set it immediately for instant gratification.
        const space = indentation === 'tab' ? '\t' : indentation;
        setOutput(JSON.stringify(sample, null, space));
        setError(null);
    }, [indentation]);

    return {
        input,
        setInput,
        output,
        error,
        indentation,
        setIndentation,
        formatJson,
        minifyJson,
        clear,
        loadSample
    };
}
