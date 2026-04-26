import { Metadata } from 'next';
import { TOOLS } from '@/data/tools';
import { notFound } from 'next/navigation';
import TreeVisualizerClient from './client';

const slug = 'tree-visualizer';

export const metadata: Metadata = {
    title: 'Tree Visualizer - Xenkio',
    description:
        'Online interactive Tree Visualizer: build binary trees from arrays, visualize BST insertions, and watch step-by-step traversal animations (inorder, preorder, postorder, BFS).',
    keywords: [
        'tree visualizer',
        'binary tree visualizer',
        'BST visualizer',
        'tree traversal animation',
        'inorder traversal',
        'preorder traversal',
        'postorder traversal',
        'level order traversal',
        'binary search tree'
    ],
    openGraph: {
        title: 'Tree Visualizer | Xenkio',
        description:
            'Interactive Tree Visualizer for binary trees and BSTs with traversal animations.',
        type: 'website',
        images: [
            {
                url: '/og-image.jpg',
                width: 1200,
                height: 630,
                alt: 'Xenkio | Free Browser-Based Tools',
                type: 'image/jpeg',
            },
        ],
    },
};

export default function TreeVisualizerPage() {
    const tool = TOOLS.find((t) => t.slug === slug);

    if (!tool) {
        notFound();
    }

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Tree Visualizer',
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Any',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
        },
        description: tool.description,
        featureList: [
            'Array to Binary Tree generation',
            'Inorder Traversal Animation',
            'Preorder Traversal Animation',
            'Postorder Traversal Animation',
            'Breadth-First Search (BFS) Animation',
            'Export Tree as SVG'
        ],
    };

    return (
        <div className="container mx-auto px-4 py-12 max-w-7xl">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
                    Tree Visualizer
                </h1>
                <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed">
                    Build and animate binary trees instantly. See how data structures work with interactive step-by-step traversal visualizations. No account required.
                </p>
            </div>

            <TreeVisualizerClient />
        </div>
    );
}
