import { CrawlingEvent } from './handler';
import { ValidationError } from '../../errors/AppError';

/**
 * targetDate가 YYYY-MM-DD 형식인지 검증합니다.
 * @param targetDate 검증할 날짜 문자열
 * @throws ValidationError 형식이 맞지 않을 경우
 */
export function validateDateFormat(targetDate: string): void {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(targetDate)) {
        throw new ValidationError('targetDate는 YYYY-MM-DD 형식이여야 합니다', 'validateDateFormat');
    }
}

/**
 * targetDate가 유효한 날짜인지 검증합니다.
 * @param targetDate 검증할 날짜 문자열
 * @throws ValidationError 유효하지 않은 날짜일 경우
 */
export function validateDateValue(targetDate: string): void {
    const [year, month, day] = targetDate.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    
    // 입력된 연도, 월, 일이 실제 날짜와 일치하는지 검증
    if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
    ) {
        throw new ValidationError('유효하지 않은 날짜입니다', 'validateDateValue');
    }
}

/**
 * jobName이 유효한지 검증합니다.
 * @param jobName 검증할 jobName
 * @throws ValidationError jobName이 빈 문자열이거나 공백만 있는 경우
 */
export function validateJobName(jobName: string): void {
    if (jobName.trim().length === 0) {
        throw new ValidationError('jobName은 빈 문자열일 수 없습니다', 'validateJobName');
    }
}

/**
 * Lambda 이벤트의 유효성을 검증합니다.
 * @param event 검증할 CrawlingEvent
 * @throws ValidationError 유효성 검증 실패 시
 */
export function validateEvent(event: CrawlingEvent): void {
    // targetDate 검증
    validateDateFormat(event.targetDate);
    validateDateValue(event.targetDate);

    // jobName 검증
    validateJobName(event.jobName);
} 