// eslint-disable-next-line @typescript-eslint/no-explicit-any
let model: any = null;

export async function loadBlazeFace(): Promise<void> {
    if (model) return;

    const tf = await import('@tensorflow/tfjs-core');
    await import('@tensorflow/tfjs-backend-webgl');
    await tf.setBackend('webgl');
    await tf.ready();

    const blazeface = await import('@tensorflow-models/blazeface');
    model = await blazeface.load();
}

export interface RawFace {
    topLeft: [number, number];
    bottomRight: [number, number];
    probability: number;
}

export async function detectFaces(imageEl: HTMLImageElement): Promise<RawFace[]> {
    if (!model) {
        throw new Error('Model not loaded. Call loadBlazeFace() first.');
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const predictions: any[] = await model.estimateFaces(imageEl, false);

    return predictions.map((p) => ({
        topLeft: p.topLeft as [number, number],
        bottomRight: p.bottomRight as [number, number],
        probability: Array.isArray(p.probability) ? (p.probability[0] as number) : (p.probability as number),
    }));
}
