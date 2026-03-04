'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { HandDetector } from '@tensorflow-models/hand-pose-detection';
import { initHandDetector, detectHands, detectSwipe, destroyDetector } from '../lib/gesture-detector';
import type { GestureDirection, HandLandmark } from '../types';

interface UseGestureControlReturn {
    isActive: boolean;
    isHandDetected: boolean;
    lowLightWarning: boolean;
    isModelLoading: boolean;
    gestureDirection: GestureDirection;
    landmarks: HandLandmark[] | null;
    error: string | null;
    videoRef: React.RefObject<HTMLVideoElement | null>;
    toggleGesture: () => void;
}

export function useGestureControl(
    onSwipeLeft: () => void,
    onSwipeRight: () => void
): UseGestureControlReturn {
    const [isActive, setIsActive] = useState(false);
    const [isHandDetected, setIsHandDetected] = useState(false);
    const [lowLightWarning, setLowLightWarning] = useState(false);
    const [isModelLoading, setIsModelLoading] = useState(false);
    const [gestureDirection, setGestureDirection] = useState<GestureDirection>('none');
    const [landmarks, setLandmarks] = useState<HandLandmark[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    const videoRef = useRef<HTMLVideoElement | null>(null);
    const detectorRef = useRef<HandDetector | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const animFrameRef = useRef<number>(0);
    const prevWristXRef = useRef<number | null>(null);
    const lastTriggerTimeRef = useRef<number>(0);
    const lastDetectedTimeRef = useRef<number>(0);
    const isRunningRef = useRef(false);

    const onSwipeLeftRef = useRef(onSwipeLeft);
    const onSwipeRightRef = useRef(onSwipeRight);

    useEffect(() => {
        onSwipeLeftRef.current = onSwipeLeft;
        onSwipeRightRef.current = onSwipeRight;
    }, [onSwipeLeft, onSwipeRight]);

    const stopDetection = useCallback(() => {
        isRunningRef.current = false;

        if (animFrameRef.current) {
            cancelAnimationFrame(animFrameRef.current);
            animFrameRef.current = 0;
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }

        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }

        prevWristXRef.current = null;
        setLandmarks(null);
        setIsHandDetected(false);
        setLowLightWarning(false);
        setGestureDirection('none');
        setIsActive(false);
    }, []);

    const startDetection = useCallback(async () => {
        try {
            setIsModelLoading(true);
            setError(null);
            setLowLightWarning(false);

            // Request camera
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: 320, height: 240 },
            });
            streamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }

            // Initialize TF.js hand detector
            const det = await initHandDetector();
            detectorRef.current = det;

            setIsActive(true);
            setIsModelLoading(false);
            isRunningRef.current = true;
            lastDetectedTimeRef.current = Date.now();

            // Detection loop
            const detect = async (): Promise<void> => {
                if (!isRunningRef.current || !videoRef.current || !detectorRef.current) return;

                try {
                    const handLandmarks = await detectHands(detectorRef.current, videoRef.current);

                    if (handLandmarks) {
                        setLandmarks(handLandmarks);
                        setIsHandDetected(true);
                        setLowLightWarning(false);
                        lastDetectedTimeRef.current = Date.now();

                        const { direction, wristX } = detectSwipe(
                            handLandmarks,
                            prevWristXRef.current,
                            lastTriggerTimeRef.current
                        );

                        prevWristXRef.current = wristX;

                        if (direction !== 'none') {
                            setGestureDirection(direction);
                            lastTriggerTimeRef.current = Date.now();

                            if (direction === 'left') {
                                onSwipeLeftRef.current();
                            } else {
                                onSwipeRightRef.current();
                            }

                            // Reset visual feedback after 400ms
                            setTimeout(() => {
                                setGestureDirection('none');
                            }, 400);
                        }
                    } else {
                        setLandmarks(null);
                        setIsHandDetected(false);
                        prevWristXRef.current = null;

                        // Check for low light or poor visibility if no hand detected for 3 seconds
                        if (Date.now() - lastDetectedTimeRef.current > 3000) {
                            setLowLightWarning(true);
                        }
                    }
                } catch (err) {
                    // Log detection errors occasionally
                    if (Math.random() > 0.99) {
                        console.error('[Gesture] Detection error:', err);
                    }
                }

                if (isRunningRef.current) {
                    animFrameRef.current = requestAnimationFrame(() => {
                        void detect();
                    });
                }
            };

            animFrameRef.current = requestAnimationFrame(() => {
                void detect();
            });
        } catch (err) {
            const message =
                err instanceof Error ? err.message : 'Failed to start gesture control';
            setError(message);
            setIsModelLoading(false);
            stopDetection();
        }
    }, [stopDetection]);

    const toggleGesture = useCallback(() => {
        if (isActive) {
            stopDetection();
        } else {
            void startDetection();
        }
    }, [isActive, startDetection, stopDetection]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            isRunningRef.current = false;
            if (animFrameRef.current) {
                cancelAnimationFrame(animFrameRef.current);
            }
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
            }
            destroyDetector();
        };
    }, []);

    return {
        isActive,
        isHandDetected,
        lowLightWarning,
        isModelLoading,
        gestureDirection,
        landmarks,
        error,
        videoRef,
        toggleGesture,
    };
}
