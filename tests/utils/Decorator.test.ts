import { HandleErrors } from '../../src/utils/ErrorHandling';
import { AppError } from '../../src/errors/AppError';
import { ERROR_MESSAGES } from '../../src/constants/ErrorMessages';
import { OPERATION_CONTEXT } from '../../src/constants/OperationContext';

describe('HandleErrors Decorator Tests', () => {
  // 콘솔 로그 모킹
  let consoleLogSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('HandleErrors Decorator', () => {
    class TestService {
      @HandleErrors(OPERATION_CONTEXT.SYSTEM_ERROR, ERROR_MESSAGES.SYSTEM_ERROR)
      async successMethod(): Promise<string> {
        return 'success';
      }

      @HandleErrors(OPERATION_CONTEXT.SYSTEM_ERROR, ERROR_MESSAGES.SYSTEM_ERROR)
      async failMethod(): Promise<string> {
        throw new Error('Test error');
      }

      @HandleErrors(OPERATION_CONTEXT.SYSTEM_ERROR, ERROR_MESSAGES.SYSTEM_ERROR)
      async appErrorMethod(): Promise<string> {
        throw new AppError('Test app error', OPERATION_CONTEXT.SYSTEM_ERROR);
      }

      @HandleErrors(OPERATION_CONTEXT.BROWSER_INIT, ERROR_MESSAGES.BROWSER_INIT_FAILED)
      async browserInitMethod(): Promise<string> {
        throw new Error('Browser init failed');
      }
    }

    it('should handle successful method execution', async () => {
      const service = new TestService();
      const result = await service.successMethod();
      
      expect(result).toBe('success');
      expect(consoleLogSpy).toHaveBeenCalledWith('[시스템 에러] 시작');
      expect(consoleLogSpy).toHaveBeenCalledWith('[시스템 에러] 성공');
    });

    it('should convert regular error to AppError', async () => {
      const service = new TestService();
      
      await expect(service.failMethod()).rejects.toThrow(AppError);
      expect(consoleWarnSpy).toHaveBeenCalledWith('[시스템 에러] 실패:', expect.any(Error));
    });

    it('should pass through AppError without modification', async () => {
      const service = new TestService();
      
      await expect(service.appErrorMethod()).rejects.toThrow(AppError);
      expect(consoleWarnSpy).toHaveBeenCalledWith('[시스템 에러] 실패:', expect.any(AppError));
    });

    it('should use correct context and error message', async () => {
      const service = new TestService();
      
      await expect(service.browserInitMethod()).rejects.toThrow(AppError);
      await expect(service.browserInitMethod()).rejects.toThrow(ERROR_MESSAGES.BROWSER_INIT_FAILED);
      await expect(service.browserInitMethod()).rejects.toMatchObject({
        message: ERROR_MESSAGES.BROWSER_INIT_FAILED,
        context: OPERATION_CONTEXT.BROWSER_INIT
      });
      
      expect(consoleLogSpy).toHaveBeenCalledWith('[브라우저 초기화] 시작');
      expect(consoleWarnSpy).toHaveBeenCalledWith('[브라우저 초기화] 실패:', expect.any(Error));
    });

    it('should preserve original error as cause', async () => {
      const service = new TestService();
      
      await expect(service.failMethod()).rejects.toThrow(AppError);
      await expect(service.failMethod()).rejects.toMatchObject({
        message: ERROR_MESSAGES.SYSTEM_ERROR,
        context: OPERATION_CONTEXT.SYSTEM_ERROR,
        cause: expect.objectContaining({
          message: 'Test error'
        })
      });
    });
  });
}); 