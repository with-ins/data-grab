import { AppError } from '../errors/AppError';



/**
 * Promise 타입 체크 유틸리티
 * @param value - 체크할 값
 * @returns Promise 여부
 */
function isPromiseLike<T>(value: unknown): value is Promise<T> {
  return value != null && 
         typeof value === 'object' && 
         'then' in value && 
         typeof (value as any).then === 'function';
}

/**
 * 에러를 AppError로 변환하는 유틸리티
 * @param error - 원본 에러
 * @param errorMessage - 에러 메시지
 * @param contextName - 컨텍스트 이름
 * @returns AppError 인스턴스
 */
function convertToAppError(error: unknown, errorMessage: string, contextName: string): AppError {
  // 이미 AppError인 경우 그대로 반환
  if (error instanceof AppError) {
    return error;
  }
  
  // 다른 에러인 경우 AppError로 변환
  const cause = error instanceof Error ? error : undefined;
  const metadata = {
    originalError: error instanceof Error ? error.message : String(error),
    errorType: error?.constructor?.name || typeof error
  };
  
  return new AppError(errorMessage, contextName, cause, metadata);
}

/**
 * 메서드 예외 처리를 위한 Decorator (Stage 3)
 * 메서드 실행 중 발생한 예외를 AppError로 변환하여 다시 throw
 * 
 * @param contextName - 로깅과 에러 컨텍스트에 사용될 이름
 * @param errorMessage - 예외 발생 시 사용할 에러 메시지
 * @returns 예외 처리가 적용된 메서드 Decorator
 * 
 * @example
 * ```typescript
 * class MyService {
 *   @HandleErrors('DATA_FETCH', 'Failed to fetch data')
 *   async fetchData(): Promise<Data> {
 *     // 비즈니스 로직
 *   }
 * }
 * ```
 */
export function HandleErrors(contextName: string, errorMessage: string) {
  return function <T, A extends readonly unknown[]>(
    originalMethod: (...args: A) => T, 
    context: ClassMethodDecoratorContext<unknown, (...args: A) => T>
  ) {
    // 컴파일 타임 검증
    if (context.kind !== 'method') {
      throw new Error(`@HandleErrors can only be applied to methods, but got ${context.kind}`);
    }
    
    if (typeof originalMethod !== 'function') {
      throw new Error(`@HandleErrors can only be applied to methods, but ${String(context.name)} is not a function`);
    }
    
    return function (this: unknown, ...args: A): T {
      try {
        console.log(`[${contextName}] 시작`);
        
        const result = originalMethod.apply(this, args);
        
        // Promise인 경우 비동기 처리
        if (isPromiseLike(result)) {
          return result.then(
            (value: unknown) => {
              console.log(`[${contextName}] 성공`);
              return value;
            },
            (error: unknown) => {
              console.warn(`[${contextName}] 실패:`, error);
              throw convertToAppError(error, errorMessage, contextName);
            }
          ) as T;
        }
        
        // 동기 함수인 경우
        console.log(`[${contextName}] 성공`);
        return result;
      } catch (error) {
        console.warn(`[${contextName}] 실패:`, error);
        throw convertToAppError(error, errorMessage, contextName);
      }
    };
  };
} 