import { Browser } from 'playwright-core';
import { chromium } from 'playwright-core';
import { JobRegistry } from '../../entity/job/JobRegistry';
import { Job } from '../../entity/job/Job';
import { JobExecutor } from '../../entity/job/JobExecutor';
import { S3Service } from '../s3/S3Service';
import { getKoreaTimeISO } from '../../utils/DateUtils';
import { CrawlingEvent } from './handler';
import { validateEvent } from './LambdaEventValidator';
import {
    Result,
    withErrorHandling,
    withSyncErrorHandling,
    isSuccess,
    isFailure,
} from '../../utils/ErrorHandling';
import { AppError, CrawlingError, ErrorCode } from '../../errors/AppError';

const chromiumBinary = require('@sparticuz/chromium');

export interface CrawlingResult {
    processedJobs: string[];
    s3Location: string;
    itemCount: number;
}

export class CrawlingService {
    private browser: Browser | null = null;
    private s3Service: S3Service;
    private jobExecutor: JobExecutor | null = null;

    constructor() {
        this.s3Service = new S3Service();
    }

    async executeCrawling(event: CrawlingEvent): Promise<Result<CrawlingResult>> {
        const targetDate = event.targetDate;
        const jobName = event.jobName;

        const startTime = Date.now();
        console.log(`크롤링 시작 at ${getKoreaTimeISO()}`);

        try {
            // 입력 검증
            validateEvent(event);

            // 1단계: 브라우저 초기화
            const browserResult = await this.initializeBrowserSafely();
            if (isFailure(browserResult)) {
                return {
                    success: false,
                    error: new CrawlingError(
                        `브라우저 초기화 실패: ${browserResult.error.message}`,
                        browserResult.error,
                        'Browser initialization'
                    ),
                    context: 'Browser initialization',
                };
            }

            // 2단계: Job 찾기
            const jobResult = this.findJobSafely(jobName);
            if (isFailure(jobResult)) {
                return {
                    success: false,
                    error: jobResult.error,
                    context: 'Job lookup',
                };
            }

            // 3단계: 날짜 파싱
            const dateResult = this.parseDateSafely(targetDate);
            if (isFailure(dateResult)) {
                return {
                    success: false,
                    error: dateResult.error,
                    context: 'Date parsing',
                };
            }

            // 4단계: JobExecutor 실행
            this.jobExecutor = new JobExecutor(this.browser!);
            const executionResult = await this.executeJobSafely(jobResult.data, {
                targetDate: dateResult.data,
            });

            if (isFailure(executionResult)) {
                // Job 실행 실패해도 빈 결과로 서비스 계속 진행
                console.warn(
                    `Job 실행 실패하지만 서비스 계속 진행:`,
                    executionResult.error.message
                );

                const emptyUploadResult = await this.s3Service.uploadEmptyResult(targetDate, jobName);
                if (isFailure(emptyUploadResult)) {
                    return {
                        success: false,
                        error: new CrawlingError(
                            `Job 실행 실패 후 빈 결과 업로드도 실패: ${emptyUploadResult.error.message}`,
                            emptyUploadResult.error,
                            'Empty result upload after job failure'
                        ),
                        context: 'Empty result upload after job failure',
                    };
                }

                return {
                    success: true,
                    data: this.createCrawlingResult([], emptyUploadResult.data, 0),
                };
            }

            // 5단계: S3 업로드
            const uploadResult = await this.s3Service.uploadResults(executionResult.data.results, {
                targetDate,
                jobName,
            });

            if (isFailure(uploadResult)) {
                return uploadResult;
            }

            const endTime = Date.now();
            console.log(`Crawling completed in ${endTime - startTime}ms`);

            return {
                success: true,
                data: this.createCrawlingResult(
                    executionResult.data.processedJobs,
                    uploadResult.data,
                    executionResult.data.itemCount
                ),
            };
        } finally {
            await this.cleanup();
        }
    }

    // HOF로 래핑된 브라우저 초기화
    private initializeBrowserSafely = withErrorHandling(async (): Promise<void> => {
        console.log('Initializing browser...');
        this.browser = await chromium.launch({
            headless: true,
            executablePath: await chromiumBinary.executablePath(),
            args: [
                ...chromiumBinary.args,
                '--no-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--disable-features=VizDisplayCompositor',
                '--disable-background-timer-throttling',
                '--disable-backgrounding-occluded-windows',
                '--disable-renderer-backgrounding',
                '--disable-web-security',
                '--single-process',
                '--disable-setuid-sandbox',
                '--no-zygote',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-default-browser-check',
                '--disable-extensions',
                '--disable-plugins',
            ],
        });
        console.log('Browser initialized successfully');
    }, '브라우저 초기화');

    // HOF로 래핑된 Job 찾기
    private findJobSafely = withSyncErrorHandling((jobName: string): Job => {
        const job = JobRegistry.getJobByName(jobName);
        if (!job) {
            throw new Error(
                `Job not found: ${jobName}. Available jobs: ${JobRegistry.getJobNames().join(', ')}`
            );
        }
        console.log(`Found job: ${job.jobName}`);
        return job;
    }, 'Job 조회');

    // HOF로 래핑된 날짜 파싱
    private parseDateSafely = withSyncErrorHandling((dateString: string): Date => {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            throw new Error(`Invalid date format: ${dateString}`);
        }
        return date;
    }, '날짜 파싱');

    // HOF로 래핑된 Job 실행
    private executeJobSafely = withErrorHandling(
        async (job: Job, context: { targetDate: Date }) => {
            return await this.jobExecutor!.execute(job, context);
        },
        'Job 실행'
    );

    private createCrawlingResult(
        processedJobs: string[],
        s3Location: string,
        itemCount: number
    ): CrawlingResult {
        return {
            processedJobs,
            s3Location,
            itemCount,
        };
    }

    private async cleanup(): Promise<void> {
        this.jobExecutor = null; // JobExecutor 참조 제거
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
    }
}
