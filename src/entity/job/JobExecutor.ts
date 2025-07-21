import { Browser, Page } from 'playwright-core';
import { Job } from './Job';
import { AppError } from '../../errors/AppError';
import { ERROR_MESSAGES } from '../../constants/ErrorMessages';
import { OPERATION_CONTEXT } from '../../constants/OperationContext';

export interface ExecutionContext {
    targetDate: Date;
    pageOptions?: PageOptions;
}

export interface PageOptions {
    viewport?: { width: number; height: number };
    timeout?: number;
}

/**
 * Job 실행을 담당하는 클래스
 * 순수 도메인 클래스 - Job 실행과 결과 변환
 * 성공시: JobExecutionResult 반환
 * 실패시: AppError 예외 발생
 */
export class JobExecutor {
    private browser: Browser;

    constructor(browser: Browser) {
        this.browser = browser;
    }

    async execute(job: Job, context: ExecutionContext): Promise<Record<string, any[] | null>> {

        console.log(`${job.jobName} Job 실행 시작`);

        let page: Page | null = null;

        try {
            page = await this.createPage(context.pageOptions);
            const result = await job.run(page, context.targetDate);

            console.log(`${job.jobName} Job 실행 성공`);

            return result;
        } catch (error) {
            console.warn(`Job execution failed: ${job.jobName}`, error);
            throw new AppError(
                ERROR_MESSAGES.JOB_EXECUTION_FAILED,
                OPERATION_CONTEXT.JOB_EXECUTION,
                error instanceof Error ? error : undefined,
                { jobName: job.jobName }
            );
        } finally {
            await page?.close();
        }
    }

    private async createPage(options?: PageOptions): Promise<Page> {
        const page = await this.browser.newPage();

        const viewport = options?.viewport || { width: 800, height: 600 };
        await page.setViewportSize(viewport);

        // 봇 탐지 방지를 위한 User-Agent 설정
        await page.setExtraHTTPHeaders({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
        });

        if (options?.timeout) {
            page.setDefaultTimeout(options.timeout);
        }

        return page;
    }
}
