'use client';

import { useSqlFormatter } from '@/features/sql-formatter/hooks/use-sql-formatter';
import { SqlFormatterTool } from '@/features/sql-formatter/components/sql-formatter-tool';

export default function SqlFormatterClient() {
    const {
        options,
        result,
        stats,
        isFormatting,
        validationError,
        updateOption,
        format,
        reset,
        loadSample,
    } = useSqlFormatter();

    return (
        <SqlFormatterTool
            options={options}
            updateOption={updateOption}
            result={result}
            stats={stats}
            isFormatting={isFormatting}
            validationError={validationError}
            onFormat={format}
            onReset={reset}
            onLoadSample={loadSample}
        />
    );
}
