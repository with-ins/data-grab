/**
 * 단순화된 애플리케이션 에러 클래스
 * 모든 에러를 하나의 클래스로 통합하여 복잡도를 줄입니다.
 */
export class AppError extends Error {
    constructor(
        message: string,
        public readonly context: string,
        public readonly cause?: Error,
        public readonly metadata?: Record<string, unknown>
    ) {
        super(message);
        this.name = 'AppError';
        
        // Error의 prototype chain을 올바르게 설정
        Object.setPrototypeOf(this, new.target.prototype);
    }

    toJSON() {
        return {
            name: this.name,
            message: this.message,
            context: this.context,
            cause: this.cause,
            metadata: this.metadata,
            stack: this.stack
        };
    }
} 