import { Browser } from 'playwright-core';
import { chromium } from 'playwright-core';
import { JobRegistry } from '../../entity/job/JobRegistry';
import { Job } from '../../entity/job/Job';
import { JobExecutor } from '../../entity/job/JobExecutor';
import { getKoreaTimeISO } from '../../utils/DateUtils';
import { CrawlingEvent } from './handler';
import { validateJobName } from './LambdaEventValidator';
import { TargetDate } from '../../entity/TargetDate';
import { HandleErrors } from '../../utils/ErrorHandling';
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

    async executeCrawling(targetDate: TargetDate, jobName: string): Promise<CrawlingResult> {
        const startTime = Date.now();
        console.log(`크롤링 시작 at ${getKoreaTimeISO()}`);

        try {
            // jobName 검증 (TargetDate는 이미 검증됨)
            validateJobName(jobName);
            const parsedDate = targetDate.dateObject;

            // 1단계: 브라우저 초기화
            await this.initializeBrowser();

            // 2단계: Job 찾기
            const job = this.findJob(jobName);

            // 3단계: JobExecutor 실행
            this.jobExecutor = new JobExecutor(this.browser!);
            const executionResult = await this.executeJob(job, {
                targetDate: parsedDate,
            });

            const endTime = Date.now();
            console.log(`Crawling completed in ${endTime - startTime}ms`);

            return {
                processedJobs: executionResult.processedJobs,
                results: executionResult.results,
                itemCount: executionResult.itemCount,
            };
        } finally {
            await this.cleanup();
        }
    }

    @HandleErrors(OPERATION_CONTEXT.BROWSER_INIT, ERROR_MESSAGES.BROWSER_INIT_FAILED)
    private async initializeBrowser(): Promise<void> {
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
    }

    @HandleErrors(OPERATION_CONTEXT.JOB_LOOKUP, ERROR_MESSAGES.JOB_NOT_FOUND)
    private findJob(jobName: string): Job {
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
    }

    @HandleErrors(OPERATION_CONTEXT.JOB_EXECUTION, ERROR_MESSAGES.JOB_EXECUTION_FAILED)
    private async executeJob(job: Job, context: { targetDate: Date }) {
        const result = await this.jobExecutor!.execute(job, context);
        return result;
    }

    private async cleanup(): Promise<void> {
        this.jobExecutor = null;
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
    }
}
