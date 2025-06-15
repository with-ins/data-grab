import { S3Uploader } from './S3Uploader';
import { Result, withErrorHandling, isFailure } from '../../utils/ErrorHandling';
import { S3Error } from '../../errors/AppError';
import { TargetDate } from '../../entity/TargetDate';

export class S3Service {
    private s3Uploader: S3Uploader;

    constructor() {
        this.s3Uploader = new S3Uploader();
    }

    // HOF로 래핑된 S3 업로드
    private uploadResultSafely = withErrorHandling(
        async (results: any[], targetDate: TargetDate, jobName: string): Promise<string> => {
            return await this.s3Uploader.uploadCrawlingResults(results, targetDate.value, jobName);
        },
        'S3 업로드'
    );

    // HOF로 래핑된 빈 결과 업로드
    private uploadEmptyResultSafely = withErrorHandling(
        async (targetDate: TargetDate, jobName: string): Promise<string> => {
            return await this.s3Uploader.uploadCrawlingResults([], targetDate.value, jobName);
        },
        '빈 결과 S3 업로드'
    );

    async uploadResults(results: any[], targetDate: TargetDate, jobName: string): Promise<Result<string>> {
        const uploadResult = await this.uploadResultSafely(results, targetDate, jobName);
        if (isFailure(uploadResult)) {
            return {
                success: false,
                error: new S3Error(
                    `S3 업로드 실패: ${uploadResult.error.message}`,
                    uploadResult.error,
                    'S3 upload'
                ),
                context: 'S3 upload',
            };
        }

        return {
            success: true,
            data: uploadResult.data,
        };
    }

    async uploadEmptyResult(targetDate: TargetDate, jobName: string): Promise<Result<string>> {
        const emptyUploadResult = await this.uploadEmptyResultSafely(targetDate, jobName);
        if (isFailure(emptyUploadResult)) {
            return {
                success: false,
                error: new S3Error(
                    `빈 결과 S3 업로드 실패: ${emptyUploadResult.error.message}`,
                    emptyUploadResult.error,
                    'Empty result S3 upload'
                ),
                context: 'Empty result S3 upload',
            };
        }

        return {
            success: true,
            data: emptyUploadResult.data,
        };
    }
} 