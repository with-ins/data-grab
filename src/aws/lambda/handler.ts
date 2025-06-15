import { Context } from 'aws-lambda';
import { CrawlingService } from './CrawlingService';
import { S3Service } from '../s3/S3Service';
import { getKoreaTimeISO } from '../../utils/DateUtils';
import { isSuccess, isFailure } from '../../utils/ErrorHandling';
import { TargetDate } from '../../entity/TargetDate';
import { validateEvent } from './LambdaEventValidator';
import { ERROR_MESSAGES } from '../../constants/ErrorMessages';

// Lambda Invocation용 이벤트 인터페이스
export interface CrawlingEvent {
    targetDate: string;
    jobName: string;
}

// Lambda Invocation용 응답 인터페이스
export interface CrawlingResponse {
    success: boolean;
    message: string;
    targetDate: string;
    jobName: string;
    data?: {
        processedJobs: string[];
        s3Location: string;
        itemCount: number;
        duration: number;
    };
    // TODO 디버깅하기 쉽게 에러 메시지가 좀 더 구체적으로 명시되어야 할지 고민
    error?: string;
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

        if (isFailure(crawlingResult)) {
            return {
                success: false,
                message: crawlingResult.context || ERROR_MESSAGES.CRAWLING_FAILED,
                targetDate: targetDate.value,
                jobName,
                error: crawlingResult.error.message,
                timestamp: getKoreaTimeISO(),
            };
        }

        // 2. S3 업로드
        const s3Service = new S3Service();
        const uploadResult = await s3Service.uploadResults(crawlingResult.data.results, targetDate, jobName);

        if (isFailure(uploadResult)) {
            return {
                success: false,
                message: uploadResult.context || ERROR_MESSAGES.CRAWLING_SUCCESS_UPLOAD_FAILED,
                targetDate: targetDate.value,
                jobName,
                error: uploadResult.error.message,
                timestamp: getKoreaTimeISO(),
            };
        }

        // 3. 최종 성공 응답
        const duration = Date.now() - startTime;
        return {
            success: true,
            message: ERROR_MESSAGES.SUCCESS,
            targetDate: targetDate.value,
            jobName,
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
            message: ERROR_MESSAGES.SYSTEM_ERROR,
            targetDate: targetDate.value,
            jobName: event.jobName,
            error: errorMessage,
            timestamp: getKoreaTimeISO(),
        };
    }
};
