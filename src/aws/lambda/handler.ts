import { Context } from 'aws-lambda';
import { CrawlingService } from './CrawlingService';
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
        // 입력 검증
        validateEvent(event);

        // 기본값 설정
        const targetDate = event.targetDate || new Date().toISOString().split('T')[0];
        const jobName = event.jobName;

        console.log('크롤링 요청 인자', { targetDate, jobName });

        const crawlingService = new CrawlingService();
        const result = await crawlingService.executeCrawling(targetDate, jobName);

        const duration = Date.now() - startTime;

        // Result 타입 처리
        if (isSuccess(result)) {
            const response: CrawlingResponse = {
                success: true,
                message: '크롤링 성공',
                data: {
                    processedJobs: result.data.processedJobs,
                    s3Location: result.data.s3Location,
                    itemCount: result.data.itemCount,
                    duration,
                },
                timestamp: getKoreaTimeISO(),
            };

            console.log('크롤링 성공', {
                processedJobs: result.data.processedJobs.length,
                itemCount: result.data.itemCount,
                duration: `${duration}ms`,
            });

            return response;
        } else {
            // CrawlingService에서 Result로 처리된 실패
            console.error('크롤링 서비스 실패', {
                error: result.error.message,
                context: result.context,
                duration: `${duration}ms`,
                remainingTime: context.getRemainingTimeInMillis(),
            });

            return {
                success: false,
                message: '크롤링 실패',
                error: `${result.context}: ${result.error.message}`,
                timestamp: getKoreaTimeISO(),
            };
        }
    } catch (error) {
        // 예상치 못한 시스템 에러 (입력 검증 실패 등)
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
// 입력 검증
function validateEvent(event: CrawlingEvent): void {
    // targetDate 형식 검증 - 'YYYY-MM-DD' 형식
    if (event.targetDate) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(event.targetDate)) {
            throw new Error('targetDate는 YYYY-MM-DD 형식이여야 합니다');
        }

        const date = new Date(event.targetDate);
        if (isNaN(date.getTime())) {
            throw new Error('유효하지 않은 날짜입니다');
        }
    }

    // jobName 검증 - 빈 문자열 "", 공백 " " 검증
    if (event.jobName && event.jobName.trim().length === 0) {
        throw new Error('jobName은 빈 문자열일 수 없습니다');
    }
}

