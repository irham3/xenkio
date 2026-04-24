'use client';

import { useState, useCallback } from 'react';
import { YamlValidatorState, YamlValidationResult, YamlValidatorMode } from '../types';
import { validateAndFormatYaml, yamlToJson, jsonToYaml } from '../lib/yaml-utils';
import { SAMPLE_YAML, SAMPLE_JSON_FOR_YAML } from '../constants';

export function useYamlValidator() {
    const [state, setState] = useState<YamlValidatorState>({
        input: '',
        mode: 'validate',
    });

    const [result, setResult] = useState<YamlValidationResult | null>(null);

    const setMode = useCallback((mode: YamlValidatorMode) => {
        setState((prev) => ({ ...prev, mode }));
        setResult(null);
    }, []);

    const setInput = useCallback((input: string) => {
        setState((prev) => ({ ...prev, input }));
        setResult(null);
    }, []);

    const process = useCallback(() => {
        if (!state.input.trim()) return;

        let res: YamlValidationResult;
        switch (state.mode) {
            case 'yaml-to-json':
                res = yamlToJson(state.input);
                break;
            case 'json-to-yaml':
                res = jsonToYaml(state.input);
                break;
            default:
                res = validateAndFormatYaml(state.input);
        }
        setResult(res);
    }, [state.input, state.mode]);

    const reset = useCallback(() => {
        setState({ input: '', mode: state.mode });
        setResult(null);
    }, [state.mode]);

    const loadSample = useCallback(() => {
        const sample = state.mode === 'json-to-yaml' ? SAMPLE_JSON_FOR_YAML : SAMPLE_YAML;
        setState((prev) => ({ ...prev, input: sample }));
        setResult(null);
    }, [state.mode]);

    return {
        state,
        result,
        setInput,
        setMode,
        process,
        reset,
        loadSample,
    };
}
