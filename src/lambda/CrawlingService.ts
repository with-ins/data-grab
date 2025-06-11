import { Browser } from 'playwright-core';
import { chromium } from 'playwright-core';
import { JobRegistry } from '../entity/job/JobRegistry';
import { Job } from '../entity/job/Job';
import { JobExecutor } from '../entity/job/JobExecutor';
import { S3Uploader } from '../uploader/S3Uploader';
import { getKoreaTimeISO } from '../utils/DateUtils';

const chromiumBinary = require('@sparticuz/chromium');

export interface CrawlingResult {
    processedJobs: string[];
    s3Location: string;
    itemCount: number;
}

export class CrawlingService {
    private browser: Browser | null = null;
    private s3Uploader: S3Uploader;
    private jobExecutor: JobExecutor | null = null;

    constructor() {
        this.s3Uploader = new S3Uploader();
    }

    async executeCrawling(targetDate: string, jobName: string): Promise<CrawlingResult> {
        const startTime = Date.now();
        console.log(`크롤링 시작 at ${getKoreaTimeISO()}`);

        try {
            await this.initializeBrowser();
            
            // JobExecutor 생성 (브라우저 의존성 주입)
            this.jobExecutor = new JobExecutor(this.browser!);
            
            const job = this.findJob(jobName);
            
            // Job 실행을 JobExecutor에 위임
            const jobResult = await this.jobExecutor.execute(job, {
                targetDate: this.parseDate(targetDate)
            });
            
            const s3Location = await this.s3Uploader.uploadCrawlingResults(jobResult.results, { 
                targetDate, 
                jobName 
            });
            
            const endTime = Date.now();
            console.log(`Crawling completed in ${endTime - startTime}ms`);

            return this.createCrawlingResult(jobResult.processedJobs, s3Location, jobResult.itemCount);

        } finally {
            await this.cleanup();
        }
    }

    private findJob(jobName: string): Job {
        const job = JobRegistry.getJobByName(jobName);
        if (!job) {
            throw new Error(`Job not found: ${jobName}. Available jobs: ${JobRegistry.getJobNames().join(', ')}`);
        }
        console.log(`Found job: ${job.jobName}`);
        return job;
    }

    private createCrawlingResult(processedJobs: string[], s3Location: string, itemCount: number): CrawlingResult {
        return {
            processedJobs,
            s3Location,
            itemCount
        };
    }

    private async initializeBrowser(): Promise<void> {
        console.log('Initializing browser...');
        try {
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
                    '--disable-plugins'
                ]
            });
            console.log('Browser initialized successfully');
        } catch (error) {
            console.error('Failed to initialize browser:', error);
            throw error;
        }
    }

    private parseDate(dateString: string): Date {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            throw new Error(`Invalid date format: ${dateString}`);
        }
        return date;
    }

    private async cleanup(): Promise<void> {
        this.jobExecutor = null; // JobExecutor 참조 제거
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
    }
} 
