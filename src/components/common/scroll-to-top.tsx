"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function ScrollToTop() {
    const pathname = usePathname();

    useEffect(() => {
        // Disable smooth scrolling to prevent animation on page load/navigation
        document.documentElement.style.scrollBehavior = "auto";

        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "auto",
        });

        // Check if we started processing with a slight scroll (common in some browsers)
        if (window.scrollY > 0) {
            window.scrollTo(0, 0);
        }

        // Re-enable smooth scrolling after a short delay
        const timer = setTimeout(() => {
            document.documentElement.style.scrollBehavior = "";
        }, 100);

        return () => clearTimeout(timer);
    }, [pathname]);

    return null;
}
