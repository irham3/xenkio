'use client';

import { usePasswordGenerator } from '@/features/password-generator/hooks/use-password-generator';
import { PasswordDisplay } from '@/features/password-generator/components/password-display';
import { ConfigPanel } from '@/features/password-generator/components/config-panel';
import { HistorySidebar } from '@/features/password-generator/components/history-sidebar';

export default function PasswordGeneratorClient() {
  const { config, updateConfig, password, strength, history, generate } = usePasswordGenerator();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-20">
      <div className="md:col-span-2 space-y-6">
        <PasswordDisplay
          password={password}
          strength={strength}
          onGenerate={generate}
        />
        <ConfigPanel
          config={config}
          updateConfig={updateConfig}
        />
      </div>
      <HistorySidebar history={history} />
    </div>
  );
}
