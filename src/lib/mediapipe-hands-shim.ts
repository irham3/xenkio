/**
 * Shim to fix "@tensorflow-models/hand-pose-detection" build error in Next.js/Turbopack.
 */
// @ts-expect-error - no types available for mediapipe hands
import * as HandsNS from '../../node_modules/@mediapipe/hands/hands.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const HandsConstructor = HandsNS.Hands || (HandsNS as any).default?.Hands || HandsNS;

export const Hands = HandsConstructor;
export default HandsNS;
