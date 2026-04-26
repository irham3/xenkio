import type { CharInfo, NormalizationInfo, UnicodeAnalysis, UnicodeStats } from '../types';

// Unicode block ranges (simplified but comprehensive)
function getUnicodeBlock(cp: number): string {
    if (cp <= 0x007F) return 'Basic Latin';
    if (cp <= 0x00FF) return 'Latin-1 Supplement';
    if (cp <= 0x017F) return 'Latin Extended-A';
    if (cp <= 0x024F) return 'Latin Extended-B';
    if (cp <= 0x02AF) return 'IPA Extensions';
    if (cp <= 0x02FF) return 'Spacing Modifier Letters';
    if (cp <= 0x036F) return 'Combining Diacritical Marks';
    if (cp <= 0x03FF) return 'Greek and Coptic';
    if (cp <= 0x04FF) return 'Cyrillic';
    if (cp <= 0x052F) return 'Cyrillic Supplement';
    if (cp <= 0x058F) return 'Armenian';
    if (cp <= 0x05FF) return 'Hebrew';
    if (cp <= 0x06FF) return 'Arabic';
    if (cp <= 0x074F) return 'Syriac';
    if (cp <= 0x077F) return 'Arabic Supplement';
    if (cp <= 0x07BF) return 'Thaana';
    if (cp <= 0x07FF) return 'NKo';
    if (cp <= 0x083F) return 'Samaritan';
    if (cp <= 0x085F) return 'Mandaic';
    if (cp <= 0x09FF) return 'Bengali / Devanagari';
    if (cp <= 0x0A7F) return 'Gurmukhi';
    if (cp <= 0x0AFF) return 'Gujarati';
    if (cp <= 0x0B7F) return 'Oriya';
    if (cp <= 0x0BFF) return 'Tamil';
    if (cp <= 0x0C7F) return 'Telugu';
    if (cp <= 0x0CFF) return 'Kannada';
    if (cp <= 0x0D7F) return 'Malayalam';
    if (cp <= 0x0DFF) return 'Sinhala';
    if (cp <= 0x0E7F) return 'Thai';
    if (cp <= 0x0EFF) return 'Lao';
    if (cp <= 0x0FFF) return 'Tibetan';
    if (cp <= 0x109F) return 'Myanmar';
    if (cp <= 0x10FF) return 'Georgian';
    if (cp <= 0x11FF) return 'Hangul Jamo';
    if (cp <= 0x137F) return 'Ethiopic';
    if (cp <= 0x177F) return 'Khmer / Cherokee';
    if (cp <= 0x18AF) return 'Mongolian';
    if (cp <= 0x1FFF) return 'Greek Extended';
    if (cp <= 0x206F) return 'General Punctuation';
    if (cp <= 0x209F) return 'Superscripts and Subscripts';
    if (cp <= 0x20CF) return 'Currency Symbols';
    if (cp <= 0x20FF) return 'Combining Diacritical Marks for Symbols';
    if (cp <= 0x214F) return 'Letterlike Symbols';
    if (cp <= 0x218F) return 'Number Forms';
    if (cp <= 0x21FF) return 'Arrows';
    if (cp <= 0x22FF) return 'Mathematical Operators';
    if (cp <= 0x23FF) return 'Miscellaneous Technical';
    if (cp <= 0x243F) return 'Control Pictures';
    if (cp <= 0x245F) return 'Optical Character Recognition';
    if (cp <= 0x24FF) return 'Enclosed Alphanumerics';
    if (cp <= 0x25FF) return 'Box Drawing / Block Elements';
    if (cp <= 0x26FF) return 'Miscellaneous Symbols';
    if (cp <= 0x27BF) return 'Dingbats';
    if (cp <= 0x2C5F) return 'Glagolitic';
    if (cp <= 0x2FFF) return 'CJK Radicals';
    if (cp <= 0x303F) return 'CJK Symbols and Punctuation';
    if (cp <= 0x309F) return 'Hiragana';
    if (cp <= 0x30FF) return 'Katakana';
    if (cp <= 0x312F) return 'Bopomofo';
    if (cp <= 0x318F) return 'Hangul Compatibility Jamo';
    if (cp <= 0x31FF) return 'Katakana Phonetic Extensions';
    if (cp <= 0x32FF) return 'Enclosed CJK Letters';
    if (cp <= 0x33FF) return 'CJK Compatibility';
    if (cp <= 0x4DBF) return 'CJK Unified Ideographs Extension A';
    if (cp <= 0x9FFF) return 'CJK Unified Ideographs';
    if (cp <= 0xA4CF) return 'Yi Syllables';
    if (cp <= 0xA4FF) return 'Yi Radicals';
    if (cp <= 0xA63F) return 'Vai';
    if (cp <= 0xA69F) return 'Cyrillic Extended-B';
    if (cp <= 0xA6FF) return 'Bamum';
    if (cp <= 0xA71F) return 'Modifier Tone Letters';
    if (cp <= 0xA7FF) return 'Latin Extended-D';
    if (cp <= 0xA82F) return 'Syloti Nagri';
    if (cp <= 0xABFF) return 'Meetei Mayek';
    if (cp <= 0xD7FF) return 'Hangul Syllables';
    if (cp <= 0xDBFF) return 'High Surrogates';
    if (cp <= 0xDFFF) return 'Low Surrogates';
    if (cp <= 0xF8FF) return 'Private Use Area';
    if (cp <= 0xFAFF) return 'CJK Compatibility Ideographs';
    if (cp <= 0xFB4F) return 'Alphabetic Presentation Forms';
    if (cp <= 0xFDFF) return 'Arabic Presentation Forms-A';
    if (cp <= 0xFE0F) return 'Variation Selectors';
    if (cp <= 0xFE1F) return 'Vertical Forms';
    if (cp <= 0xFE2F) return 'Combining Half Marks';
    if (cp <= 0xFE4F) return 'CJK Compatibility Forms';
    if (cp <= 0xFE6F) return 'Small Form Variants';
    if (cp <= 0xFEFF) return 'Arabic Presentation Forms-B';
    if (cp <= 0xFFEF) return 'Halfwidth and Fullwidth Forms';
    if (cp <= 0xFFFF) return 'Specials';
    if (cp <= 0x1007F) return 'Linear B Syllabary';
    if (cp <= 0x1FFFF) return 'Supplementary Multilingual Plane';
    if (cp <= 0x2A6DF) return 'CJK Unified Ideographs Extension B';
    if (cp <= 0x2CEAF) return 'CJK Extension C/D';
    if (cp <= 0x2EBEF) return 'CJK Extension E/F';
    if (cp <= 0x2FA1F) return 'CJK Compatibility Ideographs Supplement';
    if (cp <= 0xFFFFF) return 'Supplementary Private Use Area-A';
    return 'Supplementary Private Use Area-B';
}

interface CategoryResult {
    name: string;
    code: string;
    group: CharInfo['categoryGroup'];
}

function getCategory(char: string): CategoryResult {
    if (/\p{Lu}/u.test(char)) return { name: 'Uppercase Letter', code: 'Lu', group: 'letter' };
    if (/\p{Ll}/u.test(char)) return { name: 'Lowercase Letter', code: 'Ll', group: 'letter' };
    if (/\p{Lt}/u.test(char)) return { name: 'Titlecase Letter', code: 'Lt', group: 'letter' };
    if (/\p{Lm}/u.test(char)) return { name: 'Modifier Letter', code: 'Lm', group: 'letter' };
    if (/\p{Lo}/u.test(char)) return { name: 'Other Letter', code: 'Lo', group: 'letter' };
    if (/\p{Mn}/u.test(char)) return { name: 'Non-spacing Mark', code: 'Mn', group: 'other' };
    if (/\p{Mc}/u.test(char)) return { name: 'Spacing Mark', code: 'Mc', group: 'other' };
    if (/\p{Me}/u.test(char)) return { name: 'Enclosing Mark', code: 'Me', group: 'other' };
    if (/\p{Nd}/u.test(char)) return { name: 'Decimal Number', code: 'Nd', group: 'number' };
    if (/\p{Nl}/u.test(char)) return { name: 'Letter Number', code: 'Nl', group: 'number' };
    if (/\p{No}/u.test(char)) return { name: 'Other Number', code: 'No', group: 'number' };
    if (/\p{Pc}/u.test(char)) return { name: 'Connector Punct.', code: 'Pc', group: 'punctuation' };
    if (/\p{Pd}/u.test(char)) return { name: 'Dash Punctuation', code: 'Pd', group: 'punctuation' };
    if (/\p{Ps}/u.test(char)) return { name: 'Open Punctuation', code: 'Ps', group: 'punctuation' };
    if (/\p{Pe}/u.test(char)) return { name: 'Close Punctuation', code: 'Pe', group: 'punctuation' };
    if (/\p{Pi}/u.test(char)) return { name: 'Initial Punctuation', code: 'Pi', group: 'punctuation' };
    if (/\p{Pf}/u.test(char)) return { name: 'Final Punctuation', code: 'Pf', group: 'punctuation' };
    if (/\p{Po}/u.test(char)) return { name: 'Other Punctuation', code: 'Po', group: 'punctuation' };
    if (/\p{Sm}/u.test(char)) return { name: 'Math Symbol', code: 'Sm', group: 'symbol' };
    if (/\p{Sc}/u.test(char)) return { name: 'Currency Symbol', code: 'Sc', group: 'symbol' };
    if (/\p{Sk}/u.test(char)) return { name: 'Modifier Symbol', code: 'Sk', group: 'symbol' };
    if (/\p{So}/u.test(char)) return { name: 'Other Symbol', code: 'So', group: 'symbol' };
    if (/\p{Zs}/u.test(char)) return { name: 'Space Separator', code: 'Zs', group: 'separator' };
    if (/\p{Zl}/u.test(char)) return { name: 'Line Separator', code: 'Zl', group: 'separator' };
    if (/\p{Zp}/u.test(char)) return { name: 'Paragraph Sep.', code: 'Zp', group: 'separator' };
    if (/\p{Cc}/u.test(char)) return { name: 'Control', code: 'Cc', group: 'control' };
    if (/\p{Cf}/u.test(char)) return { name: 'Format', code: 'Cf', group: 'control' };
    if (/\p{Co}/u.test(char)) return { name: 'Private Use', code: 'Co', group: 'other' };
    return { name: 'Unassigned', code: 'Cn', group: 'other' };
}

// Well-known special / invisible characters
const SPECIAL_CHARS: Record<number, string> = {
    0x0000: 'NULL',
    0x0008: 'Backspace',
    0x0009: 'Horizontal Tab',
    0x000A: 'Line Feed (LF)',
    0x000D: 'Carriage Return (CR)',
    0x001B: 'Escape',
    0x0020: 'Space',
    0x00A0: 'Non-Breaking Space',
    0x00AD: 'Soft Hyphen',
    0x034F: 'Combining Grapheme Joiner',
    0x200B: 'Zero Width Space',
    0x200C: 'Zero Width Non-Joiner',
    0x200D: 'Zero Width Joiner',
    0x200E: 'Left-to-Right Mark',
    0x200F: 'Right-to-Left Mark',
    0x2028: 'Line Separator',
    0x2029: 'Paragraph Separator',
    0x202A: 'Left-to-Right Embedding',
    0x202B: 'Right-to-Left Embedding',
    0x202C: 'Pop Directional Formatting',
    0x202D: 'Left-to-Right Override',
    0x202E: 'Right-to-Left Override',
    0x2060: 'Word Joiner',
    0x2061: 'Function Application',
    0x2062: 'Invisible Times',
    0x2063: 'Invisible Separator',
    0x2064: 'Invisible Plus',
    0x206A: 'Inhibit Symmetric Swapping',
    0x206B: 'Activate Symmetric Swapping',
    0x206C: 'Inhibit Arabic Form Shaping',
    0x206D: 'Activate Arabic Form Shaping',
    0x206E: 'National Digit Shapes',
    0x206F: 'Nominal Digit Shapes',
    0xFEFF: 'Byte Order Mark / Zero Width No-Break Space',
    0xFFFD: 'Replacement Character',
};

function toUtf8Bytes(cp: number): number[] {
    if (cp < 0x80) return [cp];
    if (cp < 0x800) return [0xC0 | (cp >> 6), 0x80 | (cp & 0x3F)];
    if (cp < 0x10000) return [0xE0 | (cp >> 12), 0x80 | ((cp >> 6) & 0x3F), 0x80 | (cp & 0x3F)];
    return [
        0xF0 | (cp >> 18),
        0x80 | ((cp >> 12) & 0x3F),
        0x80 | ((cp >> 6) & 0x3F),
        0x80 | (cp & 0x3F),
    ];
}

function toUtf16Units(cp: number): number[] {
    if (cp < 0x10000) return [cp];
    const adjusted = cp - 0x10000;
    return [0xD800 + (adjusted >> 10), 0xDC00 + (adjusted & 0x3FF)];
}

export function formatCodePoint(cp: number): string {
    const hex = cp.toString(16).toUpperCase().padStart(4, '0');
    return `U+${hex}`;
}

export function analyzeText(text: string): UnicodeAnalysis {
    const chars: CharInfo[] = [];
    const byCategory: Record<string, number> = {};
    let asciiCount = 0;
    let specialCount = 0;

    // Iterate over actual Unicode code points (handles surrogate pairs)
    let index = 0;
    const codePointIterator = text[Symbol.iterator]();
    for (const char of codePointIterator) {
        const cp = char.codePointAt(0)!;
        const hex = cp.toString(16).toUpperCase().padStart(4, '0');
        const cat = getCategory(char);
        const utf8Bytes = toUtf8Bytes(cp);
        const utf16Units = toUtf16Units(cp);
        const isASCII = cp <= 0x7F;
        const specialNote = SPECIAL_CHARS[cp] ?? '';
        const isSpecial = specialNote !== '' || cat.group === 'control';

        chars.push({
            index,
            char,
            codePoint: cp,
            codePointHex: `U+${hex}`,
            utf8Bytes,
            utf16Units,
            category: cat.name,
            categoryCode: cat.code,
            categoryGroup: cat.group,
            block: getUnicodeBlock(cp),
            isASCII,
            isSpecial,
            specialNote: isSpecial && specialNote ? specialNote : (cat.group === 'control' ? 'Control Character' : ''),
        });

        byCategory[cat.group] = (byCategory[cat.group] ?? 0) + 1;
        if (isASCII) asciiCount++;
        if (isSpecial) specialCount++;
        index++;
    }

    const uniqueCodePoints = new Set(chars.map((c) => c.codePoint)).size;
    const utf8ByteCount = chars.reduce((s, c) => s + c.utf8Bytes.length, 0);
    const utf16ByteCount = chars.reduce((s, c) => s + c.utf16Units.length * 2, 0);

    const stats: UnicodeStats = {
        totalCodePoints: chars.length,
        uniqueCodePoints,
        asciiCount,
        nonAsciiCount: chars.length - asciiCount,
        specialCount,
        utf8ByteCount,
        utf16ByteCount,
        byCategory,
    };

    const normForms: Array<{ form: NormalizationInfo['form']; label: string; description: string }> = [
        { form: 'NFC', label: 'NFC', description: 'Canonical Decomposition, followed by Canonical Composition. Preferred for web/storage.' },
        { form: 'NFD', label: 'NFD', description: 'Canonical Decomposition. Splits accented characters into base + combining marks.' },
        { form: 'NFKC', label: 'NFKC', description: 'Compatibility Decomposition + Canonical Composition. Normalizes lookalikes (ﬁ → fi).' },
        { form: 'NFKD', label: 'NFKD', description: 'Compatibility Decomposition. Most aggressive: decomposes and removes visual variants.' },
    ];

    const normalizations: NormalizationInfo[] = normForms.map(({ form, label, description }) => {
        const result = text.normalize(form);
        const cps: string[] = [];
        for (const c of result) {
            cps.push(formatCodePoint(c.codePointAt(0)!));
        }
        return {
            form,
            label,
            description,
            result,
            changed: result !== text,
            codePoints: cps,
        };
    });

    const isAlreadyNFC = text.normalize('NFC') === text;

    return { input: text, chars, stats, normalizations, isAlreadyNFC };
}

export function formatHexBytes(bytes: number[]): string {
    return bytes.map((b) => b.toString(16).toUpperCase().padStart(2, '0')).join(' ');
}

export function getCodePointsList(chars: CharInfo[], separator: string): string {
    return chars.map((c) => c.codePointHex).join(separator);
}
