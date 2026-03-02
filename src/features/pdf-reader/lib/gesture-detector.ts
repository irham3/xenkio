import type { HandDetector } from '@tensorflow-models/hand-pose-detection';
import type { GestureDirection, HandLandmark } from '../types';

const COOLDOWN_MS = 600;

let detector: HandDetector | null = null;

export async function initHandDetector(): Promise<HandDetector> {
    if (detector) return detector;

    const [tf, handPoseDetection] = await Promise.all([
        import('@tensorflow/tfjs-core'),
        import('@tensorflow-models/hand-pose-detection'),
    ]);

    await import('@tensorflow/tfjs-backend-webgl');
    await tf.setBackend('webgl');
    await tf.ready();

    const model = handPoseDetection.SupportedModels.MediaPipeHands;
    detector = await handPoseDetection.createDetector(model, {
        runtime: 'mediapipe' as const,
        maxHands: 1,
        modelType: 'lite',
        solutionPath: `https://cdn.jsdelivr.net/npm/@mediapipe/hands`,
    });

    return detector;
}

export function destroyDetector(): void {
    if (detector) {
        detector.dispose();
        detector = null;
    }
}

export async function detectHands(
    det: HandDetector,
    video: HTMLVideoElement
): Promise<HandLandmark[] | null> {
    const hands = await det.estimateHands(video, { flipHorizontal: true });

    if (hands.length === 0 || !hands[0].keypoints) {
        return null;
    }

    // Diagnostic log (throttled to avoid flooding)
    if (Math.random() > 0.98) {
        console.log(`[Gesture] Hand detected with ${hands[0].keypoints.length} keypoints`);
    }

    // Use 2D keypoints for screen-space movement
    // Normalize by video dimensions to keep threshold consistent
    const width = video.videoWidth || 320;
    const height = video.videoHeight || 240;

    return hands[0].keypoints.map((kp) => ({
        x: kp.x / width,
        y: kp.y / height,
        z: 0,
    }));
}

let swipeStartPos: number | null = null;
let swipeStartTime: number = 0;

export function detectSwipe(
    currentLandmarks: HandLandmark[],
    _prevWristX: number | null, // Kept for signature compatibility
    lastTriggerTime: number
): { direction: GestureDirection; wristX: number } {
    // Wrist is landmark index 0 in MediaPipe Hands
    const wristX = currentLandmarks[0].x;

    const now = Date.now();
    if (now - lastTriggerTime < COOLDOWN_MS) {
        swipeStartPos = null;
        return { direction: 'none', wristX };
    }

    // Initialize or reset swipe start
    if (swipeStartPos === null) {
        swipeStartPos = wristX;
        swipeStartTime = now;
        return { direction: 'none', wristX };
    }

    // If movement takes too long, reset start position
    const timeElapsed = now - swipeStartTime;
    if (timeElapsed > 800) {
        swipeStartPos = wristX;
        swipeStartTime = now;
    }

    const totalDeltaX = wristX - swipeStartPos;

    // Physical Hand moves to the LEFT -> In mirror view, Hand Image moves to the RIGHT (X Increases)
    // This is the "Swipe Left" motion to flick to the NEXT page.
    if (totalDeltaX > 0.15) {
        console.log('[Gesture] Trigger: NEXT (Physical Left / Mirror Right)');
        swipeStartPos = null;
        return { direction: 'left', wristX };
    }

    // Physical Hand moves to the RIGHT -> In mirror view, Hand Image moves to the LEFT (X Decreases)
    // This is the "Swipe Right" motion to bring the PREVIOUS page back.
    if (totalDeltaX < -0.15) {
        console.log('[Gesture] Trigger: PREV (Physical Right / Mirror Left)');
        swipeStartPos = null;
        return { direction: 'right', wristX };
    }

    return { direction: 'none', wristX };
}

export function getKeypoints2D(
    hands: Awaited<ReturnType<HandDetector['estimateHands']>>
): Array<{ x: number; y: number }> | null {
    if (hands.length === 0) return null;
    return hands[0].keypoints.map((kp) => ({ x: kp.x, y: kp.y }));
}
