import { 
  withErrorHandling, 
  withSyncErrorHandling, 
  isSuccess, 
  isFailure 
} from '../../src/utils/ErrorHandling';

  describe('withErrorHandling', () => {
    it('정상적인 비동기 함수의 결과값을 Result 타입으로 변환하여 반환해야 한다', async () => {
      //given
      const asyncSuccessFn = async (x: number) => x * 3;
      const sut = withErrorHandling(asyncSuccessFn, '테스트');
      //when
      const result = await sut(4);
      //then
      expect(result).toEqual({
        success: true,
        data: 12
      });
    });

    it('비동기 함수에서 발생한 에러를 Result 타입으로 변환하여 반환해야 한다', async () => {
      //given
      const asyncErrorFn = async () => {
        throw new Error('async error'); 
      };
      const sut = withErrorHandling(asyncErrorFn, 'async-test');
      //when
      const result = await sut();
      //then
      expect(result).toEqual({
        success: false,
        error: new Error('async error'),
        context: 'async-test'
      });
    });
  });