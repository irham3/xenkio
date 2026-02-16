
export interface PasswordStrength {
    score: number; // 0-4
    entropy: number;
    crackTime: string;
    crackTimeSeconds: number;
    feedback: {
        warning: string | null;
        suggestions: string[];
    };
    metrics: {
        length: number;
        hasLower: boolean;
        hasUpper: boolean;
        hasNumber: boolean;
        hasSymbol: boolean;
        isCommon: boolean;
    };
}

const COMMON_PASSWORDS = [
    'password', '123456', 'qwerty', 'admin', 'welcome', 'love', 'secret',
    '12345678', '111111', '123123', 'admin123', 'password123'
];

export function calculatePasswordStrength(password: string): PasswordStrength {
    if (!password) {
        return {
            score: 0,
            entropy: 0,
            crackTime: 'Instant',
            crackTimeSeconds: 0,
            feedback: { warning: null, suggestions: [] },
            metrics: { length: 0, hasLower: false, hasUpper: false, hasNumber: false, hasSymbol: false, isCommon: false }
        };
    }

    const length = password.length;
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSymbol = /[^a-zA-Z0-9]/.test(password);
    const isCommon = COMMON_PASSWORDS.includes(password.toLowerCase());

    // Calculate Pool Size
    let poolSize = 0;
    if (hasLower) poolSize += 26;
    if (hasUpper) poolSize += 26;
    if (hasNumber) poolSize += 10;
    if (hasSymbol) poolSize += 32;

    // Calculate Entropy
    // E = L * log2(R)
    const entropy = length * Math.log2(Math.max(poolSize, 1));

    // Calculate Crack Time (1 trillion guesses per second - fast GPU cluster)
    const guessesPerSecond = 1e12;
    const combinations = Math.pow(poolSize, length);
    const crackTimeSeconds = combinations / guessesPerSecond;

    // Determine Score (0-4)
    let score = 0;
    if (isCommon) {
        score = 0;
    } else if (entropy < 28) {
        score = 0; // Very Weak
    } else if (entropy < 36) {
        score = 1; // Weak
    } else if (entropy < 60) {
        score = 2; // Fair
    } else if (entropy < 128) {
        score = 3; // Strong
    } else {
        score = 4; // Very Strong
    }

    // Adjust score based on length for usability
    if (length < 8 && score > 1) score = 1;
    if (length < 6) score = 0;

    // Generate Feedback
    const suggestions: string[] = [];
    let warning: string | null = null;

    if (isCommon) {
        warning = 'This is a very common password.';
    } else if (length < 8) {
        warning = 'Your password is too short.';
    }

    if (length < 12) suggestions.push('Add more characters');
    if (!hasLower) suggestions.push('Add lowercase letters');
    if (!hasUpper) suggestions.push('Add uppercase letters');
    if (!hasNumber) suggestions.push('Add numbers');
    if (!hasSymbol) suggestions.push('Add symbols');

    return {
        score,
        entropy: Math.round(entropy),
        crackTime: formatCrackTime(crackTimeSeconds),
        crackTimeSeconds,
        feedback: {
            warning,
            suggestions
        },
        metrics: {
            length,
            hasLower,
            hasUpper,
            hasNumber,
            hasSymbol,
            isCommon
        }
    };
}

function formatCrackTime(seconds: number): string {
    if (seconds < 1) return 'Instantly';
    if (seconds < 60) return 'Less than a minute';
    if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
    if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
    if (seconds < 2592000) return `${Math.round(seconds / 86400)} days`;
    if (seconds < 31536000) return `${Math.round(seconds / 2592000)} months`;
    if (seconds < 3153600000) return `${Math.round(seconds / 31536000)} years`;
    return 'Centuries';
}
