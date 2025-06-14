import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { AppError, S3Error, ErrorCode } from '../../errors/AppError';

/**
 * 로컬 테스트 전용 S3Uploader
 * MinIO 연결을 위한 추가 설정 포함
 * 프로덕션에서는 사용되지 않음
 */
export class S3Uploader {
    private static readonly DEFAULT_BUCKET_NAME = 'crawl-json-bucket';
    private static readonly DEFAULT_REGION = 'ap-northeast-2';
    private static readonly CONTENT_TYPE_JSON = 'application/json';
    private static readonly FILE_PATH_PREFIX = 'crawling-results';
    private static readonly S3_URI_SCHEME = 's3://';
    private static readonly DEFAULT_MINIO_ACCESS_KEY = 'minioadmin';
    private static readonly DEFAULT_MINIO_SECRET_KEY = 'minioadmin';

    private s3Client: S3Client;
    private bucketName: string;
    private isMinIO: boolean;
    private endpointUrl?: string;

    constructor() {
        this.bucketName = process.env.S3_BUCKET_NAME || S3Uploader.DEFAULT_BUCKET_NAME;
        this.endpointUrl = process.env.AWS_ENDPOINT_URL;
        this.isMinIO = !!this.endpointUrl;

        // MinIO 또는 실제 S3 설정
        const s3Config: any = {
            region: process.env.AWS_REGION || S3Uploader.DEFAULT_REGION,
        };

        // MinIO 설정 (로컬 테스트용)
        if (this.isMinIO) {
            s3Config.endpoint = this.endpointUrl;
            s3Config.credentials = {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID || S3Uploader.DEFAULT_MINIO_ACCESS_KEY,
                secretAccessKey:
                    process.env.AWS_SECRET_ACCESS_KEY || S3Uploader.DEFAULT_MINIO_SECRET_KEY,
            };
            s3Config.forcePathStyle = true; // MinIO는 path-style을 사용
            console.log(`🔧 MinIO mode detected - Endpoint: ${this.endpointUrl}`);
        }

        this.s3Client = new S3Client(s3Config);
    }

    async uploadCrawlingResults(results: any[], targetDate: string, jobName: string): Promise<string> {
        const fileName = this.generateFileName(targetDate, jobName);
        const jsonData = this.formatAsJson(results);

        return await this.uploadToS3(fileName, jsonData);
    }

    private async uploadToS3(key: string, data: string): Promise<string> {
        try {
            const command = new PutObjectCommand({
                Bucket: this.bucketName,
                Key: key,
                Body: data,
                ContentType: S3Uploader.CONTENT_TYPE_JSON,
            });

            await this.s3Client.send(command);

            // MinIO와 S3에 따라 다른 URL 형식 반환
            const location = this.isMinIO
                ? `${this.endpointUrl}/${this.bucketName}/${key}`
                : `${S3Uploader.S3_URI_SCHEME}${this.bucketName}/${key}`;

            console.log(`✅ File uploaded successfully: ${location}`);

            return location;
        } catch (error) {
            console.error('❌ Error uploading file to S3:', error);
            throw new S3Error(
                `Failed to upload file to S3: ${error instanceof Error ? error.message : 'Unknown error'}`,
                error,
                'S3Uploader.uploadToS3'
            );
        }
    }

    private generateFileName(targetDate: string, jobName: string): string {
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');
        return `${S3Uploader.FILE_PATH_PREFIX}/${targetDate}/${jobName}/${timestamp}.json`;
    }

    private formatAsJson(results: any[]): string {
        return JSON.stringify(results, null, 2);
    }
}
