import { TreeNode, TraversalStep } from '../types';

export const generateId = () => Math.random().toString(36).substring(2, 9);

// Add simple parsing for LeetCode style array string "[1,2,3,null,5]"
export function parseArrayInput(input: string): (number | null)[] {
    try {
        const cleaned = input.trim().replace(/^\[|\]$/g, '');
        if (!cleaned) return [];
        return cleaned.split(',').map(s => {
            const val = s.trim();
            if (val.toLowerCase() === 'null' || val === '') return null;
            const num = parseFloat(val);
            return isNaN(num) ? null : num;
        });
    } catch {
        return [];
    }
}

export function buildTreeFromArray(arr: (number | null)[]): TreeNode | null {
    if (arr.length === 0 || arr[0] === null || arr[0] === undefined) return null;

    const root: TreeNode = { id: generateId(), val: arr[0], left: null, right: null };
    const queue: TreeNode[] = [root];
    let i = 1;

    while (i < arr.length && queue.length > 0) {
        const current = queue.shift()!;

        // Left child
        if (i < arr.length) {
            const leftVal = arr[i++];
            if (leftVal !== null && leftVal !== undefined) {
                const leftNode: TreeNode = { id: generateId(), val: leftVal, left: null, right: null };
                current.left = leftNode;
                queue.push(leftNode);
            }
        }

        // Right child
        if (i < arr.length) {
            const rightVal = arr[i++];
            if (rightVal !== null && rightVal !== undefined) {
                const rightNode: TreeNode = { id: generateId(), val: rightVal, left: null, right: null };
                current.right = rightNode;
                queue.push(rightNode);
            }
        }
    }

    return root;
}

export function insertBST(root: TreeNode | null, val: number): TreeNode {
    if (!root) {
        return { id: generateId(), val, left: null, right: null };
    }

    if (val < root.val) {
        root.left = insertBST(root.left, val);
    } else if (val > root.val) {
        root.right = insertBST(root.right, val);
    }
    // Duplicate values ignored
    return root;
}

export function generateRandomTree(mode: 'array' | 'bst'): TreeNode | null {
    const size = Math.floor(Math.random() * 8) + 5; // 5 to 12 nodes
    
    if (mode === 'bst') {
        let root: TreeNode | null = null;
        const vals = new Set<number>();
        while (vals.size < size) {
            vals.add(Math.floor(Math.random() * 100));
        }
        Array.from(vals).forEach(val => {
            root = insertBST(root, val);
        });
        return root;
    } else {
        const arr: (number | null)[] = [];
        for (let i = 0; i < size * 2; i++) {
            if (i === 0) {
                arr.push(Math.floor(Math.random() * 100));
            } else if (Math.random() > 0.3 && i < Math.pow(2, 4) - 1) { 
                // Mostly dense, max depth ~4
                arr.push(Math.floor(Math.random() * 100));
            } else {
                arr.push(null);
            }
        }
        // Remove trailing nulls
        while (arr.length > 0 && arr[arr.length - 1] === null) arr.pop();
        return buildTreeFromArray(arr);
    }
}

// Tree Traversal Generators returning steps for animation
export function generateInorderSteps(root: TreeNode | null): TraversalStep[] {
    const steps: TraversalStep[] = [];
    const visitedIds: string[] = [];
    const outputVals: number[] = [];

    function traverse(node: TreeNode | null) {
        if (!node) return;
        
        steps.push({ visitedIds: [...visitedIds], currentId: node.id, outputVals: [...outputVals] });
        traverse(node.left);
        
        visitedIds.push(node.id);
        outputVals.push(node.val);
        steps.push({ visitedIds: [...visitedIds], currentId: node.id, outputVals: [...outputVals] });
        
        traverse(node.right);
    }
    
    traverse(root);
    steps.push({ visitedIds: [...visitedIds], currentId: null, outputVals: [...outputVals] });
    return steps;
}

export function generatePreorderSteps(root: TreeNode | null): TraversalStep[] {
    const steps: TraversalStep[] = [];
    const visitedIds: string[] = [];
    const outputVals: number[] = [];

    function traverse(node: TreeNode | null) {
        if (!node) return;
        
        visitedIds.push(node.id);
        outputVals.push(node.val);
        steps.push({ visitedIds: [...visitedIds], currentId: node.id, outputVals: [...outputVals] });
        
        traverse(node.left);
        traverse(node.right);
    }
    
    traverse(root);
    steps.push({ visitedIds: [...visitedIds], currentId: null, outputVals: [...outputVals] });
    return steps;
}

export function generatePostorderSteps(root: TreeNode | null): TraversalStep[] {
    const steps: TraversalStep[] = [];
    const visitedIds: string[] = [];
    const outputVals: number[] = [];

    function traverse(node: TreeNode | null) {
        if (!node) return;
        
        steps.push({ visitedIds: [...visitedIds], currentId: node.id, outputVals: [...outputVals] });
        traverse(node.left);
        traverse(node.right);
        
        visitedIds.push(node.id);
        outputVals.push(node.val);
        steps.push({ visitedIds: [...visitedIds], currentId: node.id, outputVals: [...outputVals] });
    }
    
    traverse(root);
    steps.push({ visitedIds: [...visitedIds], currentId: null, outputVals: [...outputVals] });
    return steps;
}

export function generateLevelOrderSteps(root: TreeNode | null): TraversalStep[] {
    const steps: TraversalStep[] = [];
    const visitedIds: string[] = [];
    const outputVals: number[] = [];

    if (!root) return steps;

    const queue: TreeNode[] = [root];
    
    while (queue.length > 0) {
        const node = queue.shift()!;
        
        visitedIds.push(node.id);
        outputVals.push(node.val);
        steps.push({ visitedIds: [...visitedIds], currentId: node.id, outputVals: [...outputVals] });
        
        if (node.left) queue.push(node.left);
        if (node.right) queue.push(node.right);
    }
    
    steps.push({ visitedIds: [...visitedIds], currentId: null, outputVals: [...outputVals] });
    return steps;
}

export function generateBSTInsertSteps(root: TreeNode | null, targetVal: number): { steps: TraversalStep[], newRoot: TreeNode } {
    const steps: TraversalStep[] = [];
    const visitedIds: string[] = [];
    
    // Quick copy helper (deep enough for structure)
    const cloneNode = (node: TreeNode | null): TreeNode | null => {
        if (!node) return null;
        return { ...node, left: cloneNode(node.left), right: cloneNode(node.right) };
    };

    const newRoot = cloneNode(root);
    const newNode: TreeNode = { id: generateId(), val: targetVal, left: null, right: null };

    if (!newRoot) {
        steps.push({ visitedIds: [newNode.id], currentId: newNode.id, outputVals: [targetVal] });
        return { steps, newRoot: newNode };
    }

    let current: TreeNode | null = newRoot;
    let parent: TreeNode | null = null;
    let isLeft = true;

    while (current) {
        visitedIds.push(current.id);
        steps.push({ visitedIds: [...visitedIds], currentId: current.id, outputVals: [targetVal] });

        parent = current;
        if (targetVal < current.val) {
            current = current.left;
            isLeft = true;
        } else if (targetVal > current.val) {
            current = current.right;
            isLeft = false;
        } else {
            // Already exists, stop
            return { steps, newRoot };
        }
    }

    if (parent) {
        if (isLeft) parent.left = newNode;
        else parent.right = newNode;
        visitedIds.push(newNode.id);
        steps.push({ visitedIds: [...visitedIds], currentId: newNode.id, outputVals: [targetVal] });
    }

    return { steps, newRoot };
}

export function generateBSTSearchSteps(root: TreeNode | null, targetVal: number): TraversalStep[] {
    const steps: TraversalStep[] = [];
    const visitedIds: string[] = [];
    let current = root;

    while (current) {
        visitedIds.push(current.id);
        steps.push({ visitedIds: [...visitedIds], currentId: current.id, outputVals: [targetVal] });

        if (targetVal === current.val) break;
        else if (targetVal < current.val) current = current.left;
        else current = current.right;
    }
    
    if (!current) {
        steps.push({ visitedIds: [...visitedIds], currentId: null, outputVals: [targetVal] });
    }

    return steps;
}

// Layout Algorithm & Analytics Calculation
export function calculateNodePositions(root: TreeNode | null, width: number, heightContainer: number): TreeNode | null {
    if (!root) return null;

    const HORIZONTAL_SPACING = width / 2.5; 
    const VERTICAL_SPACING = Math.min(80, heightContainer / 5);
    
    // First pass calculation for height, balance factor, depth, and positions
    function traverse(node: TreeNode | null, depth: number, x: number, y: number, offset: number): number {
        if (!node) return -1; // null node height = -1

        node.x = x;
        node.y = y;
        node.depth = depth;

        // Offset decreases as depth increases to avoid overlap
        const leftHeight = traverse(node.left, depth + 1, x - offset, y + VERTICAL_SPACING, offset / 2);
        const rightHeight = traverse(node.right, depth + 1, x + offset, y + VERTICAL_SPACING, offset / 2);
        
        node.height = Math.max(leftHeight, rightHeight) + 1;
        node.balanceFactor = leftHeight - rightHeight;

        return node.height;
    }

    // Centered at width/2, somewhat from top
    traverse(root, 0, width / 2, 40, HORIZONTAL_SPACING);

    return root;
}

export function invertTreeObj(root: TreeNode | null): TreeNode | null {
    if (!root) return null;
    
    // Swap left and right
    const temp = root.left;
    root.left = root.right;
    root.right = temp;
    
    invertTreeObj(root.left);
    invertTreeObj(root.right);
    
    return root;
}
