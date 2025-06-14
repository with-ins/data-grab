import {
    withErrorHandling,
    withSyncErrorHandling,
} from '../../src/utils/ErrorHandling';

describe('withErrorHandling', () => {
    it('정상적인 비동기 함수의 결과값을 Result 타입으로 변환하여 반환해야 한다', async () => {
        //given
        const asyncSuccessFn = async (x: number) => x * 3;
        const sut = withErrorHandling(asyncSuccessFn, 'async-test');
        //when
        const result = await sut(4);
        //then
        expect(result).toEqual({
            success: true,
            data: 12,
        });
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
        expect(result).toEqual({
            success: false,
            error: new Error('async error'),
            context: 'async-error-test',
        });
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
        expect(result).toEqual({
            success: true,
            data: 12,
        });
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
        expect(result).toEqual({
            success: false,
            error: new Error('sync error'),
            context: 'sync-error-test',
        });
    });
});
