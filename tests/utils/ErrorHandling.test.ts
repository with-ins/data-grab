import {
    withErrorHandling,
    withSyncErrorHandling,
} from '../../src/utils/ErrorHandling';
import { AppError } from '../../src/errors/AppError';

describe('ErrorHandling', () => {
    describe('withErrorHandling', () => {
        it('정상적인 비동기 함수의 결과값을 Result 타입으로 변환하여 반환해야 한다', async () => {
            //given
            const asyncSuccessFn = async (x: number) => x * 3;
            const sut = withErrorHandling(asyncSuccessFn, 'async-test');
            //when
            const result = await sut(4);
            //then
            const successResult = result as { success: boolean; data: number };
            expect(successResult.success).toBe(true);
            expect(successResult.data).toBe(12);
        });

        it('비동기 함수에서 발생한 에러를 Result 타입으로 변환하여 반환해야 한다', async () => {
            //given
            const asyncErrorFn = async () => {
                throw new Error('async error');
            };
            const sut = withErrorHandling(asyncErrorFn, 'async-error-test');
            //when
            const result = await sut();
            //then
            const errorResult = result as { success: boolean; error: AppError; context: string };
            expect(errorResult.success).toBe(false);
            expect(errorResult.error).toBeInstanceOf(AppError);
            expect(errorResult.error.message).toBe('async error');
            expect(errorResult.error.context).toBe('async-error-test');
            expect(errorResult.context).toBe('async-error-test');
        });
    });

    describe('withSyncErrorHandling', () => {
        it('정상적인 동기 함수의 결과값을 Result 타입으로 변환하여 반환해야 한다', () => {
            //given
            const syncSuccessFn = (x: number) => x * 3;
            const sut = withSyncErrorHandling(syncSuccessFn, 'sync-test');
            //when
            const result = sut(4);
            //then
            const successResult = result as { success: boolean; data: number };
            expect(successResult.success).toBe(true);
            expect(successResult.data).toBe(12);
        });

        it('동기 함수에서 발생한 에러를 Result 타입으로 변환하여 반환해야 한다', () => {
            //given
            const syncErrorFn = () => {
                throw new Error('sync error');
            };
            const sut = withSyncErrorHandling(syncErrorFn, 'sync-error-test');
            //when
            const result = sut();
            //then
            const errorResult = result as { success: boolean; error: AppError; context: string };
            expect(errorResult.success).toBe(false);
            expect(errorResult.error).toBeInstanceOf(AppError);
            expect(errorResult.error.message).toBe('sync error');
            expect(errorResult.error.context).toBe('sync-error-test');
            expect(errorResult.context).toBe('sync-error-test');
        });
    });
});