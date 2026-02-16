
import { IndentType, IndentSize } from '../types';

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export function formatJson(
    json: string,
    indentType: IndentType,
    indentSize: IndentSize,
    sortKeys: boolean
): string {
    const space = indentType === 'TAB' ? '\t' : ' '.repeat(indentSize);
    let parsed: JsonValue = JSON.parse(json);

    if (sortKeys) {
        parsed = sortObjectKeys(parsed) as JsonValue;
    }

    return JSON.stringify(parsed, null, space);
}

export function minifyJson(json: string): string {
    const parsed = JSON.parse(json);
    return JSON.stringify(parsed);
}

function sortObjectKeys(obj: unknown): unknown {
    if (typeof obj !== 'object' || obj === null) {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(sortObjectKeys);
    }

    const objectVal = obj as Record<string, unknown>;
    return Object.keys(objectVal)
        .sort()
        .reduce((acc: Record<string, unknown>, key) => {
            acc[key] = sortObjectKeys(objectVal[key]);
            return acc;
        }, {});
}

export function jsonToTypeScript(json: string, interfaceName: string = 'RootObject'): string {
    try {
        const obj = JSON.parse(json);
        return JsonToTs(obj, interfaceName);
    } catch {
        return '// Invalid JSON';
    }
}

function JsonToTs(obj: unknown, name: string): string {
    if (obj === null) return `export interface ${name} { [key: string]: any; }`;

    const output: string[] = [];
    const nestedInterfaces: string[] = [];

    if (Array.isArray(obj)) {
        if (obj.length > 0) {
            return `export type ${name} = ${getType(obj[0])}[];\n`;
        }
        return `export type ${name} = any[];\n`;
    }

    if (typeof obj === 'object') {
        output.push(`export interface ${name} {`);

        const objectVal = obj as Record<string, unknown>;
        for (const key in objectVal) {
            const value = objectVal[key];
            const type = getType(value);

            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                const nestedName = capitalize(key);
                nestedInterfaces.push(JsonToTs(value, nestedName));
                output.push(`  ${key}: ${nestedName};`);
            } else if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
                const nestedName = capitalize(key.replace(/s$/, '')) || 'Item';
                nestedInterfaces.push(JsonToTs(value[0], nestedName));
                output.push(`  ${key}: ${nestedName}[];`);
            }
            else {
                output.push(`  ${key}: ${type};`);
            }
        }
        output.push('}');
    }

    return nestedInterfaces.join('\n\n') + (nestedInterfaces.length > 0 ? '\n\n' : '') + output.join('\n');
}

function getType(value: unknown): string {
    if (value === null) return 'any';
    if (Array.isArray(value)) {
        if (value.length > 0) return `${getType(value[0])}[]`;
        return 'any[]';
    }
    return typeof value;
}

function capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
}
