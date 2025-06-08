import { Browser, Page } from 'playwright-core';
import { chromium } from 'playwright-core';
import { JobProcessor } from '../entity/job/JobProcessor';
import { S3Service } from './S3Service';
import * as fs from 'fs';
import * as path from 'path';

const chromiumBinary = require('@sparticuz/chromium');

export interface CrawlingResult {
    processedJobs: string[];
    s3Location: string;
    itemCount: number;
}

export class CrawlingService {
    private browser: Browser | null = null;
    private s3Service: S3Service;

    constructor() {
        this.s3Service = new S3Service();
    }

    async executeCrawling(syncDate: string, jobName?: string): Promise<CrawlingResult> {
        const startTime = Date.now();
        console.log(`Crawling started at ${new Date().toISOString()}`);

        try {
            // Playwright 브라우저 초기화
            await this.initializeBrowser();
            
            const processor = new JobProcessor();
            // 외부 API 대신 매개변수로 받은 syncDate 사용
            processor.setSyncDate(syncDate);
            
            const processedJobs: string[] = [];
            const allResults: any[] = [];

            // 특정 job만 실행하거나 전체 실행
            const jobsToProcess = jobName 
                ? processor.jobs.filter(job => job.jobName === jobName)
                : processor.jobs;

            for (const job of jobsToProcess) {
                console.log(`Processing job: ${job.jobName}`);
                
                try {
                    const page = await this.createNewPage();
                    const parsedSyncDate = this.parseDate(syncDate);
                    const result = await job.run(page, parsedSyncDate);
                    
                    // Spring Batch JsonItemReader 형태로 변환
                    const flatResults = this.transformToFlatArray(result, job.jobName);
                    allResults.push(...flatResults);
                    
                    processedJobs.push(job.jobName);
                    console.log(`Completed job: ${job.jobName}, items: ${flatResults.length}`);
                    
                    await page.close();
                } catch (error) {
                    console.error(`Error processing job ${job.jobName}:`, error);
                    // 개별 job 실패시에도 다른 job은 계속 진행
                }
            }

            // S3에 결과 업로드
            const s3Location = await this.uploadResultsToS3(allResults, syncDate);
            
            const endTime = Date.now();
            console.log(`Crawling completed in ${endTime - startTime}ms`);

            return {
                processedJobs,
                s3Location,
                itemCount: allResults.length
            };

        } finally {
            await this.cleanup();
        }
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

    private async createNewPage(): Promise<Page> {
        if (!this.browser) {
            throw new Error('Browser not initialized');
        }
        
        const page = await this.browser.newPage();
        await page.setViewportSize({ width: 1280, height: 720 });
        return page;
    }

    private parseDate(dateString: string): Date {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            throw new Error(`Invalid date format: ${dateString}`);
        }
        return date;
    }

    /**
     * 기존 중첩 구조를 Spring Batch JsonItemReader가 읽을 수 있는 평면 배열로 변환
     * 기존: { '기관명': { 'notice': [...], 'recruit': [...] } }
     * 변환: [{ jobName: '기관명', category: 'notice', ...item }, ...]
     */
    private transformToFlatArray(result: Record<string, any[]>, jobName: string): any[] {
        const flatResults: any[] = [];
        
        for (const [institutionName, categories] of Object.entries(result)) {
            if (typeof categories === 'object' && categories !== null) {
                for (const [category, items] of Object.entries(categories)) {
                    if (Array.isArray(items)) {
                        items.forEach(item => {
                            flatResults.push({
                                jobName,
                                institutionName,
                                category,
                                crawledAt: new Date().toISOString(),
                                ...item
                            });
                        });
                    }
                }
            }
        }
        
        return flatResults;
    }

    private async uploadResultsToS3(results: any[], syncDate: string): Promise<string> {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `crawling-results/${syncDate}/${timestamp}.json`;
        
        const jsonData = JSON.stringify(results, null, 2);
        
        // 로컬 환경에서는 파일로 저장
        if (process.env.NODE_ENV !== 'production') {
            const dir = path.join(process.cwd(), 'output');
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            
            const localPath = path.join(dir, `${timestamp}.json`);
            fs.writeFileSync(localPath, jsonData);
            
            console.log(`Results saved locally: ${localPath}`);
            return localPath;
        }
        
        // 프로덕션 환경에서는 S3에 업로드
        const location = await this.s3Service.uploadFile(fileName, jsonData);
        console.log(`Results uploaded to S3: ${location}`);
        return location;
    }

    private async cleanup(): Promise<void> {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
    }
} 