
import { useState, useMemo } from 'react';
import { CollisionConfig, IdTypeKey } from '../types';
import { computeCollisionResult, getIdType } from '../lib/collision-utils';

const DEFAULT_CONFIG: CollisionConfig = {
    idType: 'uuid-v4',
    customBits: 64,
    idCount: 1_000_000,
};

export function useCollisionCalculator() {
    const [config, setConfig] = useState<CollisionConfig>(DEFAULT_CONFIG);

    const effectiveBits = useMemo(() => {
        if (config.idType === 'custom') return config.customBits;
        return getIdType(config.idType).bits;
    }, [config.idType, config.customBits]);

    const result = useMemo(
        () => computeCollisionResult(config.idCount, effectiveBits),
        [config.idCount, effectiveBits]
    );

    function updateIdType(idType: IdTypeKey) {
        setConfig((prev) => ({ ...prev, idType }));
    }

    function updateIdCount(idCount: number) {
        setConfig((prev) => ({ ...prev, idCount }));
    }

    function updateCustomBits(customBits: number) {
        setConfig((prev) => ({ ...prev, customBits }));
    }

    return {
        config,
        effectiveBits,
        result,
        updateIdType,
        updateIdCount,
        updateCustomBits,
    };
}
