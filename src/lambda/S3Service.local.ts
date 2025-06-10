import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

/**
 * 로컬 테스트 전용 S3Service
 * MinIO 연결을 위한 추가 설정 포함
 * 프로덕션에서는 사용되지 않음
 */
export class S3Service {
    private s3Client: S3Client;
    private bucketName: string;
    private isMinIO: boolean;
    private endpointUrl?: string;

    constructor() {
        this.bucketName = process.env.S3_BUCKET_NAME || 'crawl-json-bucket';
        this.endpointUrl = process.env.AWS_ENDPOINT_URL;
        this.isMinIO = !!this.endpointUrl;

        // MinIO 또는 실제 S3 설정
        const s3Config: any = {
            region: process.env.AWS_REGION || 'ap-northeast-2'
        };

        // MinIO 설정 (로컬 테스트용)
        if (this.isMinIO) {
            s3Config.endpoint = this.endpointUrl;
            s3Config.credentials = {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'minioadmin',
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'minioadmin'
            };
            s3Config.forcePathStyle = true; // MinIO는 path-style을 사용
            console.log(`🔧 MinIO mode detected - Endpoint: ${this.endpointUrl}`);
        }

        this.s3Client = new S3Client(s3Config);
    }

    async uploadFile(key: string, data: string): Promise<string> {
        try {
            const command = new PutObjectCommand({
                Bucket: this.bucketName,
                Key: key,
                Body: data,
                ContentType: 'application/json'
            });

            await this.s3Client.send(command);
            
            // MinIO와 S3에 따라 다른 URL 형식 반환
            const location = this.isMinIO 
                ? `${this.endpointUrl}/${this.bucketName}/${key}`
                : `s3://${this.bucketName}/${key}`;
            
            console.log(`✅ File uploaded successfully: ${location}`);
            
            return location;
        } catch (error) {
            console.error('❌ Error uploading file to S3:', error);
            throw new Error(`Failed to upload file to S3: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
} 