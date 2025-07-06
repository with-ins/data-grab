import { AppError } from '../errors/AppError';

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
  return function <T, A extends any[]>(
    originalMethod: (...args: A) => T, 
    context: ClassMethodDecoratorContext<unknown, (...args: A) => T>
  ) {
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
        if (result && typeof result === 'object' && 'then' in result && typeof result.then === 'function') {
          return result.then(
            (value: any) => {
              console.log(`[${contextName}] 성공`);
              return value;
            },
            (error: any) => {
              console.warn(`[${contextName}] 실패:`, error);
              
              // 이미 AppError인 경우 그대로 throw
              if (error instanceof AppError) {
                throw error;
              }
              
              // 다른 에러인 경우 AppError로 변환
              throw new AppError(
                errorMessage,
                contextName,
                error instanceof Error ? error : undefined
              );
            }
          ) as T;
        }
        
        // 동기 함수인 경우
        console.log(`[${contextName}] 성공`);
        return result;
      } catch (error) {
        console.warn(`[${contextName}] 실패:`, error);
        
        // 이미 AppError인 경우 그대로 throw
        if (error instanceof AppError) {
          throw error;
        }
        
        // 다른 에러인 경우 AppError로 변환
        throw new AppError(
          errorMessage,
          contextName,
          error instanceof Error ? error : undefined
        );
      }
    };
  };
} 