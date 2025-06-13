export class Optimizer {
    private readonly optimizes: Set<string> = new Set();

    register(optimizer: Optimize) {
        this.optimizes.add(optimizer);
    }
    registerAll(optimizes: Optimize[]) {
        optimizes.forEach((optimize) => this.register(optimize));
    }

    isBlocked(resourceType: string): boolean {
        return this.optimizes.has(resourceType);
    }
}
export enum Optimize {
    CSS = 'stylesheet', // CSS 파일들
    JS = 'script', // JavaScript 파일
    IMAGE = 'image', // PNG, JPG, GIF, SVG 등
    FONT = 'font', // WOFF, WOFF2, TTF 등
    MEDIA = 'media', // 비디오/오디오 파일
}
