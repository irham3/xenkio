import yaml from 'js-yaml';
import { YamlValidationResult } from '../types';

export function validateAndFormatYaml(input: string): YamlValidationResult {
    const startTime = performance.now();
    try {
        const docs = yaml.loadAll(input);
        const documentCount = docs.length;

        // Dump back with consistent formatting
        const formatted = docs
            .map((doc) => yaml.dump(doc, { indent: 2, lineWidth: -1, noRefs: true }))
            .join('---\n');

        const executionTime = performance.now() - startTime;
        return { isValid: true, output: formatted.trimEnd(), executionTime, documentCount };
    } catch (err: unknown) {
        const ymlErr = err as { message?: string; mark?: { line?: number; column?: number; snippet?: string } };
        return {
            isValid: false,
            output: '',
            error: {
                message: ymlErr.message ?? String(err),
                line: ymlErr.mark?.line !== undefined ? ymlErr.mark.line + 1 : undefined,
                column: ymlErr.mark?.column !== undefined ? ymlErr.mark.column + 1 : undefined,
                snippet: ymlErr.mark?.snippet,
            },
        };
    }
}

export function yamlToJson(input: string): YamlValidationResult {
    const startTime = performance.now();
    try {
        const docs = yaml.loadAll(input);
        const output =
            docs.length === 1
                ? JSON.stringify(docs[0], null, 2)
                : JSON.stringify(docs, null, 2);
        const executionTime = performance.now() - startTime;
        return { isValid: true, output, executionTime, documentCount: docs.length };
    } catch (err: unknown) {
        const ymlErr = err as { message?: string; mark?: { line?: number; column?: number; snippet?: string } };
        return {
            isValid: false,
            output: '',
            error: {
                message: ymlErr.message ?? String(err),
                line: ymlErr.mark?.line !== undefined ? ymlErr.mark.line + 1 : undefined,
                column: ymlErr.mark?.column !== undefined ? ymlErr.mark.column + 1 : undefined,
                snippet: ymlErr.mark?.snippet,
            },
        };
    }
}

export function jsonToYaml(input: string): YamlValidationResult {
    const startTime = performance.now();
    try {
        const parsed: unknown = JSON.parse(input);
        const output = yaml.dump(parsed, { indent: 2, lineWidth: -1, noRefs: true }).trimEnd();
        const executionTime = performance.now() - startTime;
        return { isValid: true, output, executionTime };
    } catch (err: unknown) {
        const jsonErr = err as { message?: string };
        return {
            isValid: false,
            output: '',
            error: {
                message: jsonErr.message ?? String(err),
            },
        };
    }
}
