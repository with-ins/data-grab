import { Context } from 'aws-lambda';
import { CrawlingService } from './CrawlingService';
import { S3Service } from '../s3/S3Service';
import { getKoreaTimeISO } from '../../utils/DateUtils';
import { isSuccess, isFailure } from '../../utils/ErrorHandling';

// Lambda Invocation용 이벤트 인터페이스
export interface CrawlingEvent {
    targetDate: string;
    jobName: string;
}

// Lambda Invocation용 응답 인터페이스
export interface CrawlingResponse {
    success: boolean;
    message: string;
    data?: {
        processedJobs: string[];
        s3Location: string;
        itemCount: number;
        duration: number;
    };
    error?: string;
    timestamp: string;
}

export const crawl = async (event: CrawlingEvent, context: Context): Promise<CrawlingResponse> => {
    const startTime = Date.now();

    console.log('크롤링 Lambda 함수 호출', {
        event,
        remainingTimeInMillis: context.getRemainingTimeInMillis(),
    });

    try {
        // 기본값 설정
        const targetDate = event.targetDate || new Date().toISOString().split('T')[0];
        const jobName = event.jobName;

        console.log('크롤링 요청 인자', { targetDate, jobName });

        // 1. 크롤링 실행
        const crawlingService = new CrawlingService();
        const crawlingResult = await crawlingService.executeCrawling(event);

        if (isFailure(crawlingResult)) {
            return {
                success: false,
                message: '크롤링 실패',
                error: crawlingResult.error.message,
                timestamp: getKoreaTimeISO(),
            };
        }

        // 2. S3 업로드
        const s3Service = new S3Service();
        const uploadResult = await s3Service.uploadResults(crawlingResult.data.results, {
            targetDate,
            jobName,
        });

        if (isFailure(uploadResult)) {
            return {
                success: false,
                message: '크롤링 성공했으나 S3 업로드 실패',
                error: uploadResult.error.message,
                timestamp: getKoreaTimeISO(),
            };
        }

        // 3. 최종 성공 응답
        const duration = Date.now() - startTime;
        return {
            success: true,
            message: '크롤링 및 S3 업로드 성공',
            data: {
                processedJobs: crawlingResult.data.processedJobs,
                s3Location: uploadResult.data,
                itemCount: crawlingResult.data.itemCount,
                duration,
            },
            timestamp: getKoreaTimeISO(),
        };
    } catch (error) {
        // 예상치 못한 시스템 에러
        const duration = Date.now() - startTime;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        console.error('시스템 에러', {
            error: errorMessage,
            stack: error instanceof Error ? error.stack : undefined,
            duration: `${duration}ms`,
            remainingTime: context.getRemainingTimeInMillis(),
        });

        return {
            success: false,
            message: '시스템 에러',
            error: errorMessage,
            timestamp: getKoreaTimeISO(),
        };
    }
};

// 헬스체크 핸들러 (선택사항)
export const healthCheck = async (
    event: any,
    context: Context
): Promise<{ status: string; timestamp: string; version: string }> => {
    console.log('🏥 Health check called');

    return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.LAMBDA_VERSION || '1.0.0',
    };
};
