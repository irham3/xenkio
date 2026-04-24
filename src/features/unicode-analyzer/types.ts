export interface CharInfo {
    index: number;
    char: string;
    codePoint: number;
    codePointHex: string;
    utf8Bytes: number[];
    utf16Units: number[];
    category: string;
    categoryCode: string;
    categoryGroup: 'letter' | 'number' | 'punctuation' | 'symbol' | 'separator' | 'control' | 'other';
    block: string;
    isASCII: boolean;
    isSpecial: boolean;
    specialNote: string;
}

export interface NormalizationInfo {
    form: 'NFC' | 'NFD' | 'NFKC' | 'NFKD';
    label: string;
    description: string;
    result: string;
    changed: boolean;
    codePoints: string[];
}

export interface UnicodeStats {
    totalCodePoints: number;
    uniqueCodePoints: number;
    asciiCount: number;
    nonAsciiCount: number;
    specialCount: number;
    utf8ByteCount: number;
    utf16ByteCount: number;
    byCategory: Record<string, number>;
}

export interface UnicodeAnalysis {
    input: string;
    chars: CharInfo[];
    stats: UnicodeStats;
    normalizations: NormalizationInfo[];
    isAlreadyNFC: boolean;
}
