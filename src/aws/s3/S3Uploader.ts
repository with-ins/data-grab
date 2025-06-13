import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export interface UploadOptions {
    targetDate: string;
    jobName: string;
}

export class S3Uploader {
    private static readonly DEFAULT_BUCKET_NAME = 'crawl-json-bucket';
    private static readonly DEFAULT_REGION = 'ap-northeast-2';
    private static readonly CONTENT_TYPE_JSON = 'application/json';
    private static readonly FILE_PATH_PREFIX = 'crawling-results';
    private static readonly S3_URI_SCHEME = 's3://';

    private s3Client: S3Client;
    private bucketName: string;

    constructor() {
        this.bucketName = process.env.S3_BUCKET_NAME || S3Uploader.DEFAULT_BUCKET_NAME;

        this.s3Client = new S3Client({
            region: process.env.AWS_REGION || S3Uploader.DEFAULT_REGION,
        });
    }

    async uploadCrawlingResults(results: any[], options: UploadOptions): Promise<string> {
        const fileName = this.generateFileName(options);
        const jsonData = this.formatAsJson(results);

        return await this.uploadToS3(fileName, jsonData);
    }

    private async uploadToS3(filePath: string, jsonData: string): Promise<string> {
        try {
            const command = new PutObjectCommand({
                Bucket: this.bucketName,
                Key: filePath,
                Body: jsonData,
                ContentType: S3Uploader.CONTENT_TYPE_JSON,
            });

            await this.s3Client.send(command);

            const location = `${S3Uploader.S3_URI_SCHEME}${this.bucketName}/${filePath}`;
            console.log(`데이터가 S3에 업로드 됨`, { location });

            return location;
        } catch (error) {
            console.error('Error uploading file to S3:', error);
            throw new Error(
                `Failed to upload file to S3: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        }
    }

    private generateFileName(options: UploadOptions): string {
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');
        return `${S3Uploader.FILE_PATH_PREFIX}/${options.targetDate}/${options.jobName}/${timestamp}.json`;
    }

    private formatAsJson(results: any[]): string {
        return JSON.stringify(results, null, 2);
    }
}
