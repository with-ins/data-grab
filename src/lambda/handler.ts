import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { CrawlingService } from './CrawlingService';

export const crawl = async (
    event: APIGatewayProxyEvent,
    context: Context
): Promise<APIGatewayProxyResult> => {
    try {
        console.log('Lambda function started', { event, context });
        
        // 매개변수에서 날짜 정보 추출
        const syncDate = event.queryStringParameters?.syncDate || new Date().toISOString().split('T')[0];
        const jobName = event.queryStringParameters?.jobName;
        
        const crawlingService = new CrawlingService();
        const result = await crawlingService.executeCrawling(syncDate, jobName);
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                success: true,
                message: 'Crawling completed successfully',
                data: {
                    processedJobs: result.processedJobs,
                    s3Location: result.s3Location,
                    itemCount: result.itemCount
                }
            }),
        };
    } catch (error) {
        console.error('Lambda function error:', error);
        
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                success: false,
                message: 'Crawling failed',
                error: error instanceof Error ? error.message : 'Unknown error'
            }),
        };
    }
}; 