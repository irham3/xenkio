import { JsonFormatterOptions, JsonFormatterResult, FormatStats } from '../types';

/**
 * Sorts object keys recursively
 */
export function sortObjectKeys(obj: unknown): unknown {
    if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
        return obj;
    }

    return Object.keys(obj as object)
        .sort()
        .reduce((acc: Record<string, unknown>, key) => {
            acc[key] = sortObjectKeys((obj as Record<string, unknown>)[key]);
            return acc;
        }, {} as Record<string, unknown>);
}

export function formatJson(options: JsonFormatterOptions): JsonFormatterResult {
    const startTime = performance.now();
    const { json, indentType, indentSize, sortKeys } = options;

    if (!json.trim()) {
        return {
            formatted: '',
            originalSize: 0,
            formattedSize: 0,
            executionTime: 0,
            isValid: true,
        };
    }

    try {
        let parsed = JSON.parse(json);

        if (sortKeys) {
            parsed = sortObjectKeys(parsed);
        }

        const indent = indentType === 'spaces' ? indentSize : '\t';
        const formatted = JSON.stringify(parsed, null, indent);
        const endTime = performance.now();

        return {
            formatted,
            originalSize: json.length,
            formattedSize: formatted.length,
            executionTime: endTime - startTime,
            isValid: true,
        };
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
            formatted: json,
            originalSize: json.length,
            formattedSize: json.length,
            executionTime: performance.now() - startTime,
            error: errorMessage,
            isValid: false,
        };
    }
}

export function minifyJson(json: string): JsonFormatterResult {
    const startTime = performance.now();
    if (!json.trim()) {
        return {
            formatted: '',
            originalSize: 0,
            formattedSize: 0,
            executionTime: 0,
            isValid: true,
        };
    }

    try {
        const parsed = JSON.parse(json);
        const formatted = JSON.stringify(parsed);
        const endTime = performance.now();

        return {
            formatted,
            originalSize: json.length,
            formattedSize: formatted.length,
            executionTime: endTime - startTime,
            isValid: true,
        };
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
            formatted: json,
            originalSize: json.length,
            formattedSize: json.length,
            executionTime: performance.now() - startTime,
            error: errorMessage,
            isValid: false,
        };
    }
}

export function calculateStats(original: string, formatted: string): FormatStats {
    return {
        originalSize: original.length,
        formattedSize: formatted.length,
        compressionRatio: original.length > 0 ? (formatted.length / original.length) : 1,
    };
}

export function isValidJson(json: string): { valid: boolean; error?: string } {
    if (!json.trim()) return { valid: true };
    try {
        JSON.parse(json);
        return { valid: true };
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return { valid: false, error: errorMessage };
    }
}

/**
 * Converts JSON string to TypeScript Interfaces
 */
export function jsonToTypeScript(json: string, rootName: string = 'RootObject'): string {
    try {
        const parsed = JSON.parse(json);
        const interfaces: string[] = [];
        const seenInterfaces = new Set<string>();

        function toPascalCase(str: string): string {
            return str
                .replace(/[^a-z0-9]/gi, ' ')
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join('');
        }

        function generateInterface(obj: Record<string, unknown>, name: string): string {
            const interfaceName = toPascalCase(name);
            if (seenInterfaces.has(interfaceName)) return interfaceName;

            seenInterfaces.add(interfaceName);

            let result = `export interface ${interfaceName} {\n`;

            for (const key in obj) {
                const value = obj[key];
                const type = typeof value;
                let tsType = '';

                if (value === null) {
                    tsType = 'null | any';
                } else if (Array.isArray(value)) {
                    if (value.length > 0) {
                        const firstItem = value[0];
                        if (typeof firstItem === 'object' && firstItem !== null) {
                            const subName = interfaceName + toPascalCase(key.replace(/s$/, ''));
                            generateInterface(firstItem as Record<string, unknown>, subName);
                            tsType = `${toPascalCase(subName)}[]`;
                        } else {
                            tsType = `${typeof firstItem}[]`;
                        }
                    } else {
                        tsType = 'any[]';
                    }
                } else if (type === 'object') {
                    const subName = interfaceName + toPascalCase(key);
                    generateInterface(value as Record<string, unknown>, subName);
                    tsType = toPascalCase(subName);
                } else {
                    tsType = type;
                }

                result += `    ${key}: ${tsType};\n`;
            }

            result += `}\n`;
            interfaces.unshift(result);
            return interfaceName;
        }

        if (Array.isArray(parsed)) {
            if (parsed.length > 0) {
                generateInterface(parsed[0] as Record<string, unknown>, rootName);
                return interfaces.join('\n');
            }
            return `export type ${rootName} = any[];`;
        } else if (typeof parsed === 'object' && parsed !== null) {
            generateInterface(parsed as Record<string, unknown>, rootName);
            return interfaces.join('\n');
        } else {
            return `export type ${rootName} = ${typeof parsed};`;
        }
    } catch {
        return '// Invalid JSON provided';
    }
}
