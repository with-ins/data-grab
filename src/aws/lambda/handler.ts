import { Context } from 'aws-lambda';
import { CrawlingService } from './CrawlingService';
import { S3Service } from '../s3/S3Service';
import { getKoreaTimeISO } from '../../utils/DateUtils';
import { TargetDate } from '../../entity/TargetDate';
import { validateEvent } from './LambdaEventValidator';
import { ERROR_MESSAGES } from '../../constants/ErrorMessages';
import { AppError } from '../../errors/AppError';

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
        const duration = Date.now() - startTime;
        return {
            success: true,
            message: ERROR_MESSAGES.SUCCESS,
            targetDate: targetDate.value,
            jobName,
            data: {
                processedJobs: crawlingResult.processedJobs,
                s3Location: uploadResult,
                itemCount: crawlingResult.itemCount,
                duration,
            },
            timestamp: getKoreaTimeISO(),
        };
    } catch (error) {
        // 예상치 못한 시스템 에러 또는 AppError
        const duration = Date.now() - startTime;
        
        if (error instanceof AppError) {
            // AppError인 경우 더 구체적인 에러 정보 제공
            console.error('비즈니스 로직 에러', {
                error: error.message,
                context: error.context,
                metadata: error.metadata,
                cause: error.cause instanceof Error ? error.cause.message : error.cause,
                duration: `${duration}ms`,
                remainingTime: context.getRemainingTimeInMillis(),
            });

            return {
                success: false,
                message: "크롤링 실패",                        // 일반적 메시지
                targetDate: targetDate.value,
                jobName,
                error: {
                    message: (error.cause instanceof Error ? error.cause.message : undefined) || error.message,  // 원본 에러 우선
                    context: error.context,                          // 비즈니스 컨텍스트
                    stack: (error.cause instanceof Error ? error.cause.stack : undefined) || error.stack         // 원본 스택 우선
                },
                timestamp: getKoreaTimeISO(),
            };
        }

        // 예상치 못한 시스템 에러
        const errorMessage = error instanceof Error ? error.message : String(error);

        console.error('시스템 에러', {
            error: errorMessage,
            stack: error instanceof Error ? error.stack : undefined,
            duration: `${duration}ms`,
            remainingTime: context.getRemainingTimeInMillis(),
        });

        return {
            success: false,
            message: ERROR_MESSAGES.SYSTEM_ERROR,   // 일반적 메시지
            targetDate: targetDate.value,
            jobName: event.jobName,
            error: {
                message: errorMessage,             // 기술적 에러 메시지
                context: "시스템 에러",             // 시스템 레벨 컨텍스트
                stack: error instanceof Error ? error.stack : undefined
            },
            timestamp: getKoreaTimeISO(),
        };
    }
};
