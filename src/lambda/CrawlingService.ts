import { Browser, Page } from 'playwright-core';
import { chromium } from 'playwright-core';
import { JobRegistry } from '../entity/job/JobRegistry';
import { Job } from '../entity/job/Job';
import { JobExecutor, ExecutionContext, JobExecutionResult } from '../entity/job/JobExecutor';
import { S3Service } from './S3Service';
import * as fs from 'fs';
import * as path from 'path';
import { DateUtils } from '../utils/DateUtils';

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

    async executeCrawling(targetDate: string, jobName: string): Promise<CrawlingResult> {
        const startTime = Date.now();
        console.log(`크롤링 시작 at ${DateUtils.getKoreaTimeISO()}`);

        try {
            await this.initializeBrowser();
            
            // JobExecutor 생성 (브라우저 의존성 주입)
            this.jobExecutor = new JobExecutor(this.browser!);
            
            const job = this.findJob(jobName);
            
            // Job 실행을 JobExecutor에 위임
            const jobResult = await this.jobExecutor.execute(job, {
                targetDate: this.parseDate(targetDate)
            });
            
            const s3Location = await this.uploadResults(jobResult.results, targetDate);
            
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



    private async uploadResults(results: any[], targetDate: string): Promise<string> {
        return await this.uploadResultsToS3(results, targetDate);
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



    private async uploadResultsToS3(results: any[], syncDate: string): Promise<string> {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `crawling-results/${syncDate}/${timestamp}.json`;
        
        const jsonData = JSON.stringify(results, null, 2);
        
        // 로컬 환경에서는 파일로 저장
        // if (process.env.NODE_ENV !== 'production') {
        //     const dir = path.join(process.cwd(), 'output');
        //     if (!fs.existsSync(dir)) {
        //         fs.mkdirSync(dir, { recursive: true });
        //     }
            
        //     const localPath = path.join(dir, `${timestamp}.json`);
        //     fs.writeFileSync(localPath, jsonData);
            
        //     console.log(`Results saved locally: ${localPath}`);
        //     return localPath;
        // }
        
        // 프로덕션 환경에서는 S3에 업로드
        const location = await this.s3Service.uploadFile(fileName, jsonData);
        console.log(`Results uploaded to S3: ${location}`);
        return location;
    }

    private async cleanup(): Promise<void> {
        this.jobExecutor = null; // JobExecutor 참조 제거
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
    }
} 
