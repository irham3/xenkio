import { ImageResponse } from 'next/og'

// Route segment config
export const runtime = 'edge'

// Image metadata
export const size = {
    width: 32,
    height: 32,
}
export const contentType = 'image/png'

// Image generation
export default function Icon() {
    return new ImageResponse(
        (
            // ImageResponse JSX element
            <div
                style={{
                    fontSize: 24,
                    background: 'linear-gradient(135deg, #0EA5E9 0%, #0369A1 100%)',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    borderRadius: '8px',
                }}
            >
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    {/* Main Diagonal */}
                    <path
                        d="M5.636 20.364L19.78 6.22a2 2 0 0 0-2.828-2.828L2.808 17.536a2 2 0 0 0 2.828 2.828z"
                        fill="white"
                        fillOpacity="1"
                    />
                    {/* Top Left Part */}
                    <path
                        d="M3.636 6.464 A2 2 0 0 1 6.464 3.636 L9.5 6.672 L6.672 9.5 L3.636 6.464 Z"
                        fill="white"
                        fillOpacity="0.8"
                    />
                    {/* Bottom Right Part */}
                    <path
                        d="M17.328 14.5 L14.5 17.328 L17.536 20.364 A2 2 0 0 0 20.364 17.536 L17.328 14.5 Z"
                        fill="white"
                        fillOpacity="0.8"
                    />
                </svg>
            </div>
        ),
        // ImageResponse options
        {
            ...size,
        }
    )
}
