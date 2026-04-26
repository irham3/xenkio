declare module 'svgo/dist/svgo.browser.js' {
    export function optimize(
        svgString: string,
        config?: {
            multipass?: boolean;
            plugins?: (string | { name: string; params?: Record<string, unknown> })[];
        }
    ): { data: string };
}
