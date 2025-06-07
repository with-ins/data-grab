import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export class S3Service {
    private s3Client: S3Client;
    private bucketName: string;

    constructor() {
        this.s3Client = new S3Client({
            region: process.env.AWS_REGION || 'ap-northeast-2'
        });
        this.bucketName = process.env.S3_BUCKET_NAME || 'crawling-results-bucket';
    }

    async uploadFile(key: string, data: string): Promise<string> {
        try {
            const command = new PutObjectCommand({
                Bucket: this.bucketName,
                Key: key,
                Body: data,
                ContentType: 'application/json',
                ServerSideEncryption: 'AES256'
            });

            await this.s3Client.send(command);
            
            const location = `s3://${this.bucketName}/${key}`;
            console.log(`File uploaded successfully: ${location}`);
            
            return location;
        } catch (error) {
            console.error('Error uploading file to S3:', error);
            throw new Error(`Failed to upload file to S3: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
} 