/**
 * 에러 코드 Enum
 */
export enum ErrorCode {
    JOB_EXECUTION = 'JOB_EXECUTION_ERROR',
    VALIDATION = 'VALIDATION_ERROR',
    NETWORK = 'NETWORK_ERROR',
    S3 = 'S3_ERROR',
    CRAWLING = 'CRAWLING_ERROR',
    UNKNOWN = 'UNKNOWN_ERROR',
}

/**
 * 기본 애플리케이션 에러 클래스
 */
export class AppError extends Error {
    constructor(
        message: string,
        public readonly errorCode: ErrorCode,
        public readonly context?: string,
        public readonly cause?: unknown,
        public readonly metadata?: Record<string, unknown>
    ) {
        super(message);
        this.name = this.constructor.name;
        
        // Error의 prototype chain을 올바르게 설정
        Object.setPrototypeOf(this, new.target.prototype);
    }

    toJSON() {
        return {
            name: this.name,
            errorCode: this.errorCode,
            message: this.message,
            context: this.context,
            cause: this.cause,
            metadata: this.metadata,
            stack: this.stack
        };
    }
}

/**
 * Job 실행 관련 에러
 */
export class JobExecutionError extends AppError {
    constructor(
        message: string,
        cause?: unknown,
        context?: string,
        metadata?: Record<string, unknown>
    ) {
        super(message, ErrorCode.JOB_EXECUTION, context, cause, metadata);
    }
}

/**
 * 데이터 검증 관련 에러
 */
export class ValidationError extends AppError {
    constructor(
        message: string,
        context?: string,
        metadata?: Record<string, unknown>
    ) {
        super(message, ErrorCode.VALIDATION, context, null, metadata);
    }
}

/**
 * 네트워크 관련 에러
 */
export class NetworkError extends AppError {
    constructor(
        message: string,
        cause?: unknown,
        context?: string,
        metadata?: Record<string, unknown>
    ) {
        super(message, ErrorCode.NETWORK, context, cause, metadata);
    }
}

/**
 * S3 관련 에러
 */
export class S3Error extends AppError {
    constructor(
        message: string,
        cause?: unknown,
        context?: string,
        metadata?: Record<string, unknown>
    ) {
        super(message, ErrorCode.S3, context, cause, metadata);
    }
}

/**
 * 크롤링 관련 에러
 */
export class CrawlingError extends AppError {
    constructor(
        message: string,
        cause?: unknown,
        context?: string,
        metadata?: Record<string, unknown>
    ) {
        super(message, ErrorCode.CRAWLING, context, cause, metadata);
    }
} 