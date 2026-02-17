'use client';

import { useUUIDGenerator } from '@/features/uuid-generator/hooks/use-uuid-generator';
import { GeneratorSettings } from '@/features/uuid-generator/components/generator-settings';
import { GeneratedList } from '@/features/uuid-generator/components/generated-list';
import { HistorySidebar } from '@/features/uuid-generator/components/history-sidebar';

export default function UUIDGeneratorClient() {
    const { config, uuids, history, generate, updateConfig, clearHistory } = useUUIDGenerator();

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
            <div className="lg:col-span-2 space-y-8">
                <GeneratorSettings
                    config={config}
                    updateConfig={updateConfig}
                    onGenerate={generate}
                    uuids={uuids}
                />
                <GeneratedList uuids={uuids} />
            </div>

            <HistorySidebar
                history={history}
                onClear={clearHistory}
            />
        </div>
    );
}
