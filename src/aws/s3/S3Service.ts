import { S3Uploader } from './S3Uploader';
import { HandleErrors } from '../../utils/ErrorHandling';
import { ERROR_MESSAGES } from '../../constants/ErrorMessages';
import { TargetDate } from '../../entity/TargetDate';
import { OPERATION_CONTEXT } from '../../constants/OperationContext';

export class S3Service {
    private s3Uploader: S3Uploader;

    constructor() {
        this.s3Uploader = new S3Uploader();
    }

    @HandleErrors(OPERATION_CONTEXT.S3_UPLOAD, ERROR_MESSAGES.S3_UPLOAD_FAILED)
    async uploadResults(results: any[], targetDate: TargetDate, jobName: string): Promise<string> {
        return await this.s3Uploader.uploadCrawlingResults(results, targetDate.value, jobName);
    }

    @HandleErrors(OPERATION_CONTEXT.S3_EMPTY_UPLOAD, ERROR_MESSAGES.S3_UPLOAD_FAILED)
    async uploadEmptyResult(targetDate: TargetDate, jobName: string): Promise<string> {
        return await this.s3Uploader.uploadCrawlingResults([], targetDate.value, jobName);
    }
} 