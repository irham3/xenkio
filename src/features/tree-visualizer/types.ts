export type TreeMode = 'array' | 'bst';
export type TraversalType = 'inorder' | 'preorder' | 'postorder' | 'level-order';

export interface TreeNode {
    id: string; // Unique ID for animations
    val: number;
    left: TreeNode | null;
    right: TreeNode | null;
    // Visualization positions (relative 0-1 or absolute coords)
    x?: number;
    y?: number;
}

export interface TreeEdge {
    source: TreeNode;
    target: TreeNode;
}

export interface TraversalStep {
    // Array of node IDs representing the state of visited nodes up to this step
    visitedIds: string[];
    // The node ID currently being processed/highlighted
    currentId: string | null;
    description?: string;
    // Output array values accumulated so far
    outputVals: number[];
}

export interface TreeVisualizerState {
    mode: TreeMode;
    arrayInput: string;
    bstInput: string;
    root: TreeNode | null;
    error: string | null;

    // Animation state
    traversalType: TraversalType;
    traversalSteps: TraversalStep[];
    currentStepIndex: number;
    isPlaying: boolean;
    speed: number; // Interval in ms
}
