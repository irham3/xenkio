import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';

interface JsonHighlighterProps {
    json: string;
    keyTooltips?: Record<string, string>;
}

export function JsonHighlighter({ json, keyTooltips = {} }: JsonHighlighterProps) {
    // Split using capturing group so that delimiters (tokens) are included
    // The parts between tokens (even indices) are "unknown" or "invalid" text
    const parts = json.split(/(".*?"|true|false|null|-?\d+\.?\d*|[:,{}\[\]]|\s+)/g);

    return (
        <>
            {parts.map((token, i) => {
                if (!token) return null;

                // Even indices are "unmatched" parts -> invalid text
                if (i % 2 === 0) {
                    return <span key={i} className="text-red-500 font-bold bg-red-50">{token}</span>;
                }

                // Odd indices are matched tokens -> apply syntax highlighting

                // Determine if this token is a key
                let isKey = false;
                if (token.startsWith('"')) {
                    // Check ahead for next significant token
                    // parts is [unmatched, matched, unmatched, matched...]
                    // We are at `i` (matched). Next matched token is at `i + 2`.
                    // We need to skip whitespace tokens to find if next is ':'
                    for (let j = i + 2; j < parts.length; j += 2) {
                        const t = parts[j];
                        // If it's pure whitespace, continue
                        if (/^\s+$/.test(t)) continue;
                        // If it's unmatched text (even index), it breaks the key:value structure, so stop
                        // But wait, parts[j] IS matched (odd index) in this loop stepping by 2?
                        // No. `j` starts at `i + 2` (odd).
                        // If we encounter matched token that is ':', then it is a key.
                        if (t === ':') isKey = true;
                        break;
                    }
                }

                if (isKey) {
                    const keyName = token.slice(1, -1);
                    const claimInfo = keyTooltips[keyName];

                    if (claimInfo) {
                        return (
                            <Tooltip key={i}>
                                <TooltipTrigger asChild>
                                    <span className="text-blue-600 font-semibold border-b border-dotted border-blue-400 cursor-help pointer-events-auto hover:text-blue-800 transition-colors">
                                        {token}
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-xs text-xs">
                                    <p>{claimInfo}</p>
                                </TooltipContent>
                            </Tooltip>
                        );
                    }
                    return <span key={i} className="text-blue-600 font-semibold">{token}</span>;
                }

                if (token.startsWith('"')) return <span key={i} className="text-green-600 font-medium">{token}</span>;
                if (/^true|false$/.test(token)) return <span key={i} className="text-purple-600 font-semibold">{token}</span>;
                if (/^-?\d+\.?\d*$/.test(token)) return <span key={i} className="text-orange-600 font-medium">{token}</span>;
                if (token === 'null') return <span key={i} className="text-gray-500 italic">{token}</span>;

                // Structural characters
                return <span key={i} className="text-gray-500">{token}</span>;
            })}
        </>
    );
}
