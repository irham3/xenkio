import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';

export const STANDARD_CLAIMS: Record<string, string> = {
    iss: 'Issuer: Identifies the principal that issued the JWT.',
    sub: 'Subject: Identifies the principal that is the subject of the JWT.',
    aud: 'Audience: Identifies the recipients that the JWT is intended for.',
    exp: 'Expiration Time: Identifies the expiration time on or after which the JWT must not be accepted.',
    nbf: 'Not Before: Identifies the time before which the JWT must not be accepted.',
    iat: 'Issued At: Identifies the time at which the JWT was issued.',
    jti: 'JWT ID: Provides a unique identifier for the JWT.'
};

export function JsonHighlighter({ json }: { json: string }) {
    // Improved tokenizer that captures string contents, primitives, structural chars, and whitespace separately
    const tokens = json.match(/(".*?"|true|false|null|-?\d+\.?\d*|[:,{}\[\]]|\s+)/g) || [];

    return (
        <>
            {tokens.map((token, i) => {
                // Determine if this token is a key
                // A string followed by a colon is likely a key, but we need to track braces context properly for robustness.
                // Simplified heuristic: If token is a string and next non-whitespace token is ':', treat as key.

                let isKey = false;
                if (token.startsWith('"')) {
                    // Check ahead for next significant token
                    for (let j = i + 1; j < tokens.length; j++) {
                        const t = tokens[j].trim();
                        if (!t) continue;
                        if (t === ':') isKey = true;
                        break;
                    }
                }

                if (isKey) {
                    const keyName = token.slice(1, -1);
                    const claimInfo = STANDARD_CLAIMS[keyName];

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

                return <span key={i} className="text-gray-500">{token}</span>;
            })}
        </>
    );
}
