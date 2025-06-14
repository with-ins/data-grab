import {
    validateEvent,
    validateDateFormat,
    validateDateValue,
    validateJobName,
} from '../../../src/aws/lambda/LambdaEventValidator';
import { CrawlingEvent } from '../../../src/aws/lambda/handler';
import { ValidationError } from '../../../src/errors/AppError';

describe('LambdaEventValidator', () => {
    describe('validateDateFormat', () => {
        it('올바른 YYYY-MM-DD 형식의 날짜를 검증한다', () => {
            expect(() => validateDateFormat('2024-03-14')).not.toThrow();
        });

        it('잘못된 형식의 날짜는 예외가 발생한다', () => {
            //given
            const invalidFormats = [
                '2024/03/14',
                '2024-3-14',
                '2024-03-1',
                '20240314',
                '2024-03-14T00:00:00',
                'invalid-date',
            ];

            //when then
            invalidFormats.forEach((date) => {
                expect(() => validateDateFormat(date)).toThrow(ValidationError);
                expect(() => validateDateFormat(date)).toThrow('targetDate는 YYYY-MM-DD 형식이여야 합니다');
            });
        });
    });

    describe('validateDateValue', () => {
        it('유효한 날짜를 검증한다', () => {
            expect(() => validateDateValue('2024-03-14')).not.toThrow();
        });

        it('존재하지 않는 날짜는 예외가 발생한다', () => {
            //given
            const invalidDates = [
                '2024-02-30', // 2월 30일은 존재하지 않음
                '2024-13-01', // 13월은 존재하지 않음
                '2024-00-01', // 0월은 존재하지 않음
                '2024-01-00', // 0일은 존재하지 않음
            ];

            //when then
            invalidDates.forEach((date) => {
                expect(() => validateDateValue(date)).toThrow(ValidationError);
                expect(() => validateDateValue(date)).toThrow('유효하지 않은 날짜입니다');
            });
        });
    });

    describe('validateJobName', () => {
        it('유효한 jobName을 검증한다', () => {
            expect(() => validateJobName('valid-job')).not.toThrow();
            expect(() => validateJobName(' job-with-spaces ')).not.toThrow();
        });

        it('빈 문자열이나 공백만 있는 jobName은 예외가 발생한다', () => {
            //given
            const invalidJobNames = ['', ' ', '  ', '\t', '\n'];

            //when then
            invalidJobNames.forEach((jobName) => {
                expect(() => validateJobName(jobName)).toThrow(ValidationError);
                expect(() => validateJobName(jobName)).toThrow('jobName은 빈 문자열일 수 없습니다');
            });
        });
    });
}); 
