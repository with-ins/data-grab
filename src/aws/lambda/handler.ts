import { Context } from 'aws-lambda';
import { CrawlingService } from './CrawlingService';
import { S3Service } from '../s3/S3Service';
import { getKoreaTimeISO } from '../../utils/DateUtils';
import { TargetDate } from '../../entity/TargetDate';
import { validateEvent } from './LambdaEventValidator';
import { ERROR_MESSAGES } from '../../constants/ErrorMessages';
import { AppError } from '../../errors/AppError';
import { OPERATION_CONTEXT } from '../../constants/OperationContext';

// Lambda Invocation용 이벤트 인터페이스
export interface CrawlingEvent {
    targetDate: string;
    jobName: string;
}

// Lambda Invocation용 응답 인터페이스
export interface CrawlingResponse {
    success: boolean;
    message: string;        // 사용자 친화적 메시지
    targetDate: string;
    jobName: string;
    data?: {
        processedJobs: string[];
        s3Location: string;
        itemCount: number;
        duration: number;
    };
    error?: {               // 단순화된 Error 구조!
        message: string;    // 기술적 에러 메시지 (디버깅용)
        context: string;    // 에러 발생 위치/컨텍스트
        stack?: string;     // 스택 트레이스
    };
    timestamp: string;
}

export const crawl = async (event: CrawlingEvent, context: Context): Promise<CrawlingResponse> => {
    const startTime = Date.now();

    console.log('크롤링 Lambda 함수 호출', {
        event,
        remainingTimeInMillis: context.getRemainingTimeInMillis(),
    });

    // 기본 TargetDate 설정
    validateEvent(event);
    const targetDate = TargetDate.from(event.targetDate)
    const jobName = event.jobName;

    try {
        console.log('크롤링 요청 인자', { targetDate: targetDate.value, jobName });

        // 1. 크롤링 실행
        const crawlingService = new CrawlingService();
        const crawlingResult = await crawlingService.executeCrawling(targetDate, jobName);

        // 2. S3 업로드
        const s3Service = new S3Service();
        const uploadResult = await s3Service.uploadResults(crawlingResult.results, targetDate, jobName);

        // 3. 최종 성공 응답
        return createSuccessResponse(targetDate, jobName, crawlingResult, uploadResult, calcDuration(startTime));
    } catch (error) {
        const duration = calcDuration(startTime);

        if (error instanceof AppError) {
            return handleAppError(error, targetDate, jobName, duration, context);
        }

        return handleSystemError(error, targetDate, jobName, duration, context);
    }
};

const createSuccessResponse = (
    targetDate: TargetDate,
    jobName: string,
    crawlingResult: { processedJobs: string[]; itemCount: number },
    s3Location: string,
    duration: number
): CrawlingResponse => {
    console.log('크롤링 성공 결과', {
        targetDate: targetDate.value,
        jobName,
        data: {
            processedJobs: crawlingResult.processedJobs,
            s3Location,
            itemCount: crawlingResult.itemCount,
            duration,
        },
    })

    return {
        success: true,
        message: ERROR_MESSAGES.SUCCESS,
        targetDate: targetDate.value,
        jobName,
        data: {
            processedJobs: crawlingResult.processedJobs,
            s3Location,
            itemCount: crawlingResult.itemCount,
            duration,
        },
        timestamp: getKoreaTimeISO(),
    };
};

const handleAppError = (
    error: AppError, 
    targetDate: TargetDate, 
    jobName: string, 
    duration: number, 
    context: Context
): CrawlingResponse => {
    console.error('크롤링 실패', {
        error: error.message,
        context: error.context,
        metadata: error.metadata,
        cause: error.cause instanceof Error ? error.cause.message : error.cause,
        duration: `${duration}ms`,
        remainingTime: context.getRemainingTimeInMillis(),
    });

    return {
        success: false,
        message: ERROR_MESSAGES.CRAWLING_FAILED,
        targetDate: targetDate.value,
        jobName,
        error: {
            message: (error.cause instanceof Error ? error.cause.message : undefined) || error.message,
            context: error.context,
            stack: (error.cause instanceof Error ? error.cause.stack : undefined) || error.stack
        },
        timestamp: getKoreaTimeISO(),
    };
};

const handleSystemError = (
    error: unknown, 
    targetDate: TargetDate, 
    jobName: string, 
    duration: number, 
    context: Context
): CrawlingResponse => {
    const errorMessage = error instanceof Error ? error.message : String(error);

    console.error('시스템 에러', {
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
        duration: `${duration}ms`,
        remainingTime: context.getRemainingTimeInMillis(),
    });

    return {
        success: false,
        message: ERROR_MESSAGES.SYSTEM_ERROR,
        targetDate: targetDate.value,
        jobName,
        error: {
            message: errorMessage,
            context: OPERATION_CONTEXT.SYSTEM_ERROR,
            stack: error instanceof Error ? error.stack : undefined
        },
        timestamp: getKoreaTimeISO(),
    };
};

const calcDuration = (startTime: number): number => {
    return Date.now() - startTime;
};