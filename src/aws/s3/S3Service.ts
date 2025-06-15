import { S3Uploader } from './S3Uploader';
import { Result, withErrorHandling, isFailure, success, failure } from '../../utils/ErrorHandling';
import { AppError } from '../../errors/AppError';
import { ERROR_MESSAGES } from '../../constants/ErrorMessages';
import { TargetDate } from '../../entity/TargetDate';
import { OPERATION_CONTEXT } from '../../constants/OperationContext';

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
        OPERATION_CONTEXT.S3_UPLOAD
    );

    // HOF로 래핑된 빈 결과 업로드
    private uploadEmptyResultSafely = withErrorHandling(
        async (targetDate: TargetDate, jobName: string): Promise<string> => {
            return await this.s3Uploader.uploadCrawlingResults([], targetDate.value, jobName);
        },
        OPERATION_CONTEXT.S3_EMPTY_UPLOAD
    );

    async uploadResults(results: any[], targetDate: TargetDate, jobName: string): Promise<Result<string>> {
        const uploadResult = await this.uploadResultSafely(results, targetDate, jobName);
        if (isFailure(uploadResult)) {
            return failure(
                new AppError(
                    ERROR_MESSAGES.S3_UPLOAD_FAILED,
                    OPERATION_CONTEXT.S3_UPLOAD,
                    uploadResult.error instanceof Error ? uploadResult.error : undefined,
                    { targetDate: targetDate.value, jobName, resultCount: results.length }
                ),
                OPERATION_CONTEXT.S3_UPLOAD
            );
        }

        return success(uploadResult.data);
    }

    async uploadEmptyResult(targetDate: TargetDate, jobName: string): Promise<Result<string>> {
        const emptyUploadResult = await this.uploadEmptyResultSafely(targetDate, jobName);
        if (isFailure(emptyUploadResult)) {
            return failure(
                new AppError(
                    ERROR_MESSAGES.S3_UPLOAD_FAILED,
                    OPERATION_CONTEXT.S3_EMPTY_UPLOAD,
                    emptyUploadResult.error instanceof Error ? emptyUploadResult.error : undefined,
                    { targetDate: targetDate.value, jobName, resultCount: 0 }
                ),
                OPERATION_CONTEXT.S3_EMPTY_UPLOAD
            );
        }

        return success(emptyUploadResult.data);
    }
} 