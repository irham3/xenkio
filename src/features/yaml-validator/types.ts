
export type YamlValidatorMode = 'validate' | 'yaml-to-json' | 'json-to-yaml';

export interface YamlValidatorState {
    input: string;
    mode: YamlValidatorMode;
}

export interface YamlValidationResult {
    isValid: boolean;
    output: string;
    error?: YamlValidationError;
    executionTime?: number;
    documentCount?: number;
}

export interface YamlValidationError {
    message: string;
    line?: number;
    column?: number;
    snippet?: string;
}
