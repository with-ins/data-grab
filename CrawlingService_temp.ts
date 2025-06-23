import { Browser } from 'playwright-core';
import { chromium } from 'playwright-core';
import { JobRegistry } from '../../entity/job/JobRegistry';
import { Job } from '../../entity/job/Job';
import { JobExecutor } from '../../entity/job/JobExecutor';
import { getKoreaTimeISO } from '../../utils/DateUtils';
import { CrawlingEvent } from './handler';
import { validateJobName } from './LambdaEventValidator';
import { TargetDate } from '../../entity/TargetDate';
import {
    Result,
    withErrorHandling,
    withSyncErrorHandling,
    isSuccess,
    isFailure,
    success,
    failure,
} from '../../utils/ErrorHandling';
import { AppError } from '../../errors/AppError';
import { ERROR_MESSAGES } from '../../constants/ErrorMessages';
import { OPERATION_CONTEXT } from '../../constants/OperationContext';

const chromiumBinary = require('@sparticuz/chromium');

export interface CrawlingResult {
    processedJobs: string[];
    results: any[]; // 크롤링된 실제 데이터
    itemCount: number;
}

export class CrawlingService {
    private browser: Browser | null = null;
    private jobExecutor: JobExecutor | null = null;

    async executeCrawling(targetDate: TargetDate, jobName: string): Promise<Result<CrawlingResult>> {
        const startTime = Date.now();
        console.log(`크롤링 시작 at ${getKoreaTimeISO()}`);

        try {
            // jobName 검증 (TargetDate는 이미 검증됨)
            validateJobName(jobName);
            const parsedDate = targetDate.dateObject;

            // 1단계: 브라우저 초기화
            const browserResult = await this.initializeBrowser();
            if (isFailure(browserResult)) {
                return failure(
                    new AppError(
                        ERROR_MESSAGES.BROWSER_INIT_FAILED,
                        OPERATION_CONTEXT.BROWSER_INIT,
                        browserResult.error instanceof Error ? browserResult.error : undefined,
                        { targetDate: targetDate.value, jobName }
                    ),
                    OPERATION_CONTEXT.BROWSER_INIT
                );
            }

            // 2단계: Job 찾기
            const jobResult = this.findJob(jobName);
            if (isFailure(jobResult)) {
                return failure(jobResult.error, OPERATION_CONTEXT.JOB_LOOKUP);
            }

            // 3단계: JobExecutor 실행
            this.jobExecutor = new JobExecutor(this.browser!);
            const executionResult = await this.executeJob(jobResult.data, {
                targetDate: parsedDate,
            });

            if (isFailure(executionResult)) {
                return failure(executionResult.error, OPERATION_CONTEXT.JOB_EXECUTION);
            }

            const endTime = Date.now();
            console.log(`Crawling completed in ${endTime - startTime}ms`);

            return success({
                processedJobs: executionResult.data.processedJobs,
                results: executionResult.data.results,
                itemCount: executionResult.data.itemCount,
            });
        } finally {
            await this.cleanup();
        }
    }

    // HOF로 래핑된 브라우저 초기화
    private initializeBrowser = withErrorHandling(async (): Promise<void> => {
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
    }, OPERATION_CONTEXT.BROWSER_INIT);

    // HOF로 래핑된 Job 찾기
    private findJob = withSyncErrorHandling((jobName: string): Job => {
        const job = JobRegistry.getJobByName(jobName);
        if (!job) {
            throw new AppError(
                ERROR_MESSAGES.JOB_NOT_FOUND,
                OPERATION_CONTEXT.JOB_LOOKUP,
                undefined,
                { 
                    requestedJobName: jobName,
                    availableJobs: JobRegistry.getJobNames()
                }
            );
        }
        console.log(`Found job: ${job.jobName}`);
        return job;
    }, OPERATION_CONTEXT.JOB_LOOKUP);

    // HOF로 래핑된 Job 실행
    private executeJob = withErrorHandling(
        async (job: Job, context: { targetDate: Date }) => {
            const result = await this.jobExecutor!.execute(job, context);
            if (isFailure(result)) {
                throw result.error;
            }
            return result.data;
        },
        OPERATION_CONTEXT.JOB_EXECUTION
    );

    private async cleanup(): Promise<void> {
        this.jobExecutor = null;
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
    }
}
