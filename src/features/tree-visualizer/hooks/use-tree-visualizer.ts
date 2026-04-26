import { useState, useCallback, useEffect, useRef } from 'react';
import type { TreeVisualizerState, TraversalType, TreeNode } from '../types';
import { 
    parseArrayInput, 
    buildTreeFromArray, 
    generateRandomTree,
    generateInorderSteps,
    generatePreorderSteps,
    generatePostorderSteps,
    generateLevelOrderSteps,
    calculateNodePositions,
    invertTreeObj,
    generateBSTInsertSteps,
    generateBSTSearchSteps
} from '../lib/tree-utils';

const DEFAULT_ARRAY = "[1, 2, 3, null, 5, null, 7]";

export function useTreeVisualizer() {
    const [state, setState] = useState<TreeVisualizerState>({
        mode: 'array',
        arrayInput: DEFAULT_ARRAY,
        bstInput: '',
        root: null,
        error: null,
        traversalType: 'inorder',
        traversalSteps: [],
        currentStepIndex: 0,
        isPlaying: false,
        speed: 800,
    });

    const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const stopAnimation = useCallback(() => {
        setState(prev => ({ 
            ...prev, 
            isPlaying: false, 
            currentStepIndex: 0,
            traversalSteps: [] 
        }));
    }, []);

    const setMode = useCallback((mode: 'array' | 'bst') => {
        stopAnimation();
        setState(prev => ({ ...prev, mode, error: null }));
    }, [stopAnimation]);

    const handleArrayInput = useCallback((input: string) => {
        stopAnimation();
        
        try {
            const parsed = parseArrayInput(input);
            const newRoot = buildTreeFromArray(parsed);
            
            const positionedRoot = calculateNodePositions(newRoot, dimensions.width, dimensions.height);

            setState(prev => ({
                ...prev,
                mode: 'array',
                arrayInput: input,
                root: positionedRoot,
                error: null
            }));
        } catch {
            setState(prev => ({
                ...prev,
                arrayInput: input,
                error: 'Invalid array format.'
            }));
        }
    }, [dimensions, stopAnimation]);

    const handleBSTInput = useCallback((input: string) => {
        stopAnimation();
        
        try {
            // We just clear error for now since BST mode builds from scratch array
            setState(prev => ({
                ...prev,
                mode: 'bst',
                bstInput: input,
                error: null
            }));
        } catch {
            setState(prev => ({ ...prev, error: 'Invalid input' }));
        }
    }, [stopAnimation]);


    const generateRandom = useCallback(() => {
        stopAnimation();
        const mode = state.mode;
        const newRoot = generateRandomTree(mode);
        const positionedRoot = calculateNodePositions(newRoot, dimensions.width, dimensions.height);
        
        // Convert back to array string for display
        const buildLevelOrderStr = (root: TreeNode | null) => {
            if (!root) return "[]";
            const q = [root];
            const res: (number | null)[] = [];
            while (q.length > 0) {
                const n = q.shift()!;
                if (n) {
                    res.push(n.val);
                    q.push(n.left as TreeNode);
                    q.push(n.right as TreeNode);
                } else {
                    res.push(null);
                }
            }
            while(res[res.length-1] === null) res.pop();
            return `[${res.join(', ')}]`.replace(/null/g, 'null');
        };

        const arrStr = buildLevelOrderStr(newRoot);

        setState(prev => ({
            ...prev,
            root: positionedRoot,
            arrayInput: arrStr,
            error: null
        }));
    }, [dimensions, state.mode, stopAnimation]);

    const invertCurrentTree = useCallback(() => {
        stopAnimation();
        if (!state.root) return;

        const newRoot = invertTreeObj(JSON.parse(JSON.stringify(state.root)));
        const positionedRoot = calculateNodePositions(newRoot, dimensions.width, dimensions.height);

        const buildLevelOrderStr = (root: TreeNode | null) => {
            if (!root) return "[]";
            const q = [root];
            const res: (number | null)[] = [];
            while (q.length > 0) {
                const n = q.shift()!;
                if (n) {
                    res.push(n.val);
                    q.push((n.left as TreeNode) || null);
                    q.push((n.right as TreeNode) || null);
                } else {
                    res.push(null);
                }
            }
            while(res.length > 0 && res[res.length-1] === null) res.pop();
            return `[${res.join(', ')}]`.replace(/null/g, 'null');
        };

        const arrStr = buildLevelOrderStr(newRoot);
        
        setState(prev => ({
            ...prev,
            root: positionedRoot,
            arrayInput: arrStr
        }));
    }, [state.root, dimensions.width, dimensions.height, stopAnimation]);

    // Initial load
    useEffect(() => {
        handleArrayInput(DEFAULT_ARRAY);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Layout calculation when root or dimensions change
    useEffect(() => {
        if (state.root) {
            const positionedRoot = calculateNodePositions(
                JSON.parse(JSON.stringify(state.root)), // deep copy to avoid mutations
                dimensions.width,
                dimensions.height
            );
            
            // Only update if it actually changed to avoid loop
            // We use a simple ref check since the structure is same just layout updated
            setState(s => ({ ...s, root: positionedRoot }));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dimensions.width, dimensions.height]); // don't depend on state.root to avoid infinite loop

    // Animation interval
    useEffect(() => {
        if (state.isPlaying) {
            timerRef.current = setInterval(() => {
                setState(prev => {
                    if (prev.currentStepIndex < prev.traversalSteps.length - 1) {
                        return { ...prev, currentStepIndex: prev.currentStepIndex + 1 };
                    }
                    return { ...prev, isPlaying: false };
                });
            }, state.speed);
        } else if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [state.isPlaying, state.speed]);

    const playTraversal = useCallback((type: TraversalType) => {
        if (!state.root) return;

        let steps: TraversalStepType[] = [];
        switch (type) {
            case 'inorder': steps = generateInorderSteps(state.root); break;
            case 'preorder': steps = generatePreorderSteps(state.root); break;
            case 'postorder': steps = generatePostorderSteps(state.root); break;
            case 'level-order': steps = generateLevelOrderSteps(state.root); break;
        }

        setState(prev => ({
            ...prev,
            traversalType: type,
            traversalSteps: steps,
            currentStepIndex: 0,
            isPlaying: true
        }));
    }, [state.root]);

    const playBSTInsert = useCallback((val: number) => {
        stopAnimation();
        const { steps, newRoot } = generateBSTInsertSteps(state.root, val);
        
        // Compute positions for the new root
        const positionedRoot = calculateNodePositions(newRoot, dimensions.width, dimensions.height);

        setState(prev => ({
            ...prev,
            root: positionedRoot, 
            traversalType: 'bst-insert',
            traversalSteps: steps,
            currentStepIndex: 0,
            isPlaying: true
        }));
    }, [state.root, dimensions, stopAnimation]);

    const playBSTSearch = useCallback((val: number) => {
        stopAnimation();
        if (!state.root) return;
        const steps = generateBSTSearchSteps(state.root, val);

        setState(prev => ({
            ...prev,
            traversalType: 'bst-search',
            traversalSteps: steps,
            currentStepIndex: 0,
            isPlaying: true
        }));
    }, [state.root, stopAnimation]);

    const togglePlay = useCallback(() => {
        setState(prev => {
            if (prev.traversalSteps.length === 0) return prev;
            
            // If ended, replay
            if (!prev.isPlaying && prev.currentStepIndex >= prev.traversalSteps.length - 1) {
                return { ...prev, isPlaying: true, currentStepIndex: 0 };
            }
            
            return { ...prev, isPlaying: !prev.isPlaying };
        });
    }, []);

    const setSpeed = useCallback((speed: number) => {
        setState(prev => ({ ...prev, speed }));
    }, []);

    const stepForward = useCallback(() => {
        setState(prev => {
            if (prev.currentStepIndex < prev.traversalSteps.length - 1) {
                return { ...prev, currentStepIndex: prev.currentStepIndex + 1, isPlaying: false };
            }
            return { ...prev, isPlaying: false };
        });
    }, []);

    const stepBackward = useCallback(() => {
        setState(prev => {
            if (prev.currentStepIndex > 0) {
                return { ...prev, currentStepIndex: prev.currentStepIndex - 1, isPlaying: false };
            }
            return { ...prev, isPlaying: false };
        });
    }, []);

    const updateDimensions = useCallback((width: number, height: number) => {
        if (width !== dimensions.width || height !== dimensions.height) {
            setDimensions({ width, height });
        }
    }, [dimensions]);

    return {
        state,
        handleArrayInput,
        handleBSTInput,
        generateRandom,
        playTraversal,
        togglePlay,
        setSpeed,
        stepForward,
        stepBackward,
        updateDimensions,
        invertCurrentTree,
        setMode,
        playBSTInsert,
        playBSTSearch
    };
}

type TraversalStepType = import('../types').TraversalStep;
