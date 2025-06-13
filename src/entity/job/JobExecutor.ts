import { Browser, Page } from 'playwright-core';
import { Job } from './Job';
import { JobExecutionError } from '../../errors/AppError';

export interface ExecutionContext {
    targetDate: Date;
    pageOptions?: PageOptions;
}

export interface PageOptions {
    viewport?: { width: number; height: number };
    timeout?: number;
}

export interface JobExecutionResult {
    processedJobs: string[];
    results: any[];
    itemCount: number;
}

/**
 * Job 실행을 담당하는 클래스
 * 단일 책임: Job의 실행과 결과 변환에만 집중
 */
export class JobExecutor {
    constructor(private browser: Browser) {}

    async execute(job: Job, context: ExecutionContext): Promise<JobExecutionResult> {
        console.log(`${job.jobName} Job 실행 시작`);

        let page: Page | null = null;

        try {
            page = await this.createPage(context.pageOptions);
            const result = await job.run(page, context.targetDate);
            const flatResults = this.transformResults(result, job.jobName);

            console.log(`${job.jobName} Job 실행 성공, items: ${flatResults.length}`);

            return {
                processedJobs: [job.jobName],
                results: flatResults,
                itemCount: flatResults.length,
            };
        } catch (error) {
            console.error(`Job execution failed: ${job.jobName}`, error);
            throw new JobExecutionError(`Failed to execute job: ${job.jobName}`, error);
        } finally {
            if (page) {
                await page.close();
            }
        }
    }

    private async createPage(options?: PageOptions): Promise<Page> {
        const page = await this.browser.newPage();

        const viewport = options?.viewport || { width: 1280, height: 720 };
        await page.setViewportSize(viewport);

        if (options?.timeout) {
            page.setDefaultTimeout(options.timeout);
        }

        return page;
    }

    /**
     * 기존 중첩 구조를 Spring Batch JsonItemReader가 읽을 수 있는 평면 배열로 변환
     * 기존: { '기관명': { 'notice': [...], 'recruit': [...] } }
     * 변환: [{ jobName: '기관명', category: 'notice', ...item }, ...]
     */
    private transformResults(result: Record<string, any[]>, jobName: string): any[] {
        const flatResults: any[] = [];

        for (const [institutionName, categories] of Object.entries(result)) {
            if (typeof categories === 'object' && categories !== null) {
                for (const [category, items] of Object.entries(categories)) {
                    if (Array.isArray(items)) {
                        items.forEach((item) => {
                            flatResults.push({
                                jobName,
                                institutionName,
                                category,
                                crawledAt: new Date().toISOString(),
                                ...item,
                            });
                        });
                    }
                }
            }
        }

        return flatResults;
    }
}
