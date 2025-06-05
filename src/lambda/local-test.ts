import { CrawlingService } from './CrawlingService';

async function testCrawling() {
    console.log('🚀 Starting local crawling test...');
    
    try {
        const crawlingService = new CrawlingService();
        
        // 테스트 매개변수
        const syncDate = '2024-01-01';
        const jobName = '오정노인복지관'; // 특정 job만 테스트
        
        console.log(`📅 Sync Date: ${syncDate}`);
        console.log(`🎯 Target Job: ${jobName || 'All jobs'}`);
        
        const result = await crawlingService.executeCrawling(syncDate, jobName);
        
        console.log('✅ Crawling completed successfully!');
        console.log('📊 Results:', {
            processedJobs: result.processedJobs,
            itemCount: result.itemCount,
            s3Location: result.s3Location
        });
        
    } catch (error) {
        console.error('❌ Crawling failed:', error);
        process.exit(1);
    }
}

// 스크립트 실행시 자동 실행
if (require.main === module) {
    testCrawling();
} 