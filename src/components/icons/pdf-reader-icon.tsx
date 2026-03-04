import React from 'react';

export function PdfReaderIcon({ className, strokeWidth = 1.5 }: { className?: string; strokeWidth?: number }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* Document Base */}
            <path
                d="M4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L16 4H6C4.89543 4 4 4.89543 4 4Z"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {/* Folded Corner */}
            <path
                d="M16 4V8H20"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {/* Lines representing text */}
            <path
                d="M8 12H16"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.3"
            />
            <path
                d="M8 16H12"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.3"
            />
            {/* Red PDF Tag - Styled as a small badge */}
            <rect
                x="8"
                y="14"
                width="8"
                height="5"
                rx="1"
                fill="#EF4444" // Using Tailwind red-500 equivalent
            />
            <text
                x="12"
                y="18"
                fontSize="3"
                fontWeight="bold"
                fill="white"
                textAnchor="middle"
                fontFamily="sans-serif"
            >
                PDF
            </text>
        </svg>
    );
}
