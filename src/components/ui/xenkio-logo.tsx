import { cn } from "@/lib/utils"

export function XenkioLogo({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            className={cn("w-full h-full", className)}
        >
            {/* 
        The "Weave" Concept - Cleaned Up
        Represents the intersection of Innovation (Xen) and Tools (Kio).
        Constructed from two intersecting rounded capsules with a 'cutout' to simulate depth.
      */}

            {/* Main Diagonal (Bottom-Left to Top-Right) - The "Foundation" */}
            <path
                d="M5.636 20.364L19.78 6.22a2 2 0 0 0-2.828-2.828L2.808 17.536a2 2 0 0 0 2.828 2.828z"
                className="opacity-100"
            />

            {/* Cross Diagonal (Top-Left to Bottom-Right) - The "Integration" */}
            {/* Top Segment */}
            <path
                d="M3.636 5.636L8.5 10.5 10.5 8.5 5.636 3.636a2 2 0 0 0-2 2z"
                className="opacity-70"
            />

            {/* Bottom Segment */}
            <path
                d="M15.5 13.5l1.918 1.918 2.946 2.946a2 2 0 0 0 2.828-2.828l-5.774-5.774-1.918 3.738z"
                // Correcting path to be a simple segment
                // Let's use simpler geometry: 
                // 13.5,15.5 start -> 20.364,18.364 end
                d="M13.5 15.5 L18.364 20.364 a2 2 0 0 0 2.828-2.828 L16.328 12.672 L13.5 15.5 z"
                className="opacity-70"
            />
            {/* 
          Let's redo the second diagonal to be chemically perfect.
          It's a capsule from (4,4) to (20,20), but cut in middle.
          Cutout is approx from (10,10) to (14,14).
       */}
            <path
                d="M4.22 3.636a2 2 0 0 0-2.828 2.828l4.828 4.828 2.828-2.828-4.828-4.828z"
                className="opacity-70 mix-blend-screen"
            />
            <path
                d="M14.95 11.879l2.828-2.828 0 0-2.828 2.828z"
                // Resetting to a cleaner single path for the second diagonal
                // Visually: A split capsule
                className="hidden"
            />

            {/* Improved Second Diagonal: Split into Top-Left and Bottom-Right parts */}
            {/* Top Left Part */}
            <path
                d="M3.636 6.464 A2 2 0 0 1 6.464 3.636 L9.5 6.672 L6.672 9.5 L3.636 6.464 Z"
                className="opacity-80"
            />
            {/* Bottom Right Part */}
            <path
                d="M17.328 14.5 L14.5 17.328 L17.536 20.364 A2 2 0 0 0 20.364 17.536 L17.328 14.5 Z"
                className="opacity-80"
            />
        </svg>
    )
}
