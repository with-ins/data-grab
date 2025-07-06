import { AppError } from '../errors/AppError';
import { OPERATION_CONTEXT } from '../constants/OperationContext';

/**
 * Result 타입 - 성공 또는 실패를 나타내는 타입
 */
export type Result<T, E = AppError> = 
  | { success: true; data: T }
  | { success: false; error: E; context: string };

/**
 * HOF(고차함수): 비동기 함수를 래핑하여 예외를 Result 타입으로 변환
 */
export function withErrorHandling<T, A extends any[]>(
  fn: (...args: A) => Promise<T>,
  context: string
): (...args: A) => Promise<Result<T>> {
  return async (...args: A): Promise<Result<T>> => {
    try {
      console.log(`[${context}] 시작`);
      const data = await fn(...args);
      console.log(`[${context}] 성공`);
      return { success: true, data };
    } catch (error) {
      const errorInstance = error instanceof AppError 
        ? error 
        : new AppError(
            error instanceof Error ? error.message : String(error),
            context,
            error instanceof Error ? error : undefined
          );
      
      console.warn(`[${context}] 실패:`, errorInstance.toJSON());
      
      return { 
        success: false, 
        error: errorInstance,
        context 
      };
    }
  };
}

/**
 * HOF(고차함수): 동기 함수를 래핑하여 예외를 Result 타입으로 변환
 */
export function withSyncErrorHandling<T, A extends any[]>(
  fn: (...args: A) => T,
  context: string
): (...args: A) => Result<T> {
  return (...args: A): Result<T> => {
    try {
      console.log(`[${context}] 시작`);
      const data = fn(...args);
      console.log(`[${context}] 성공`);
      return { success: true, data };
    } catch (error) {
      const errorInstance = error instanceof AppError 
        ? error 
        : new AppError(
            error instanceof Error ? error.message : String(error),
            context,
            error instanceof Error ? error : undefined
          );
      
      console.error(`[${context}] 실패:`, errorInstance.toJSON());
      
      return { 
        success: false, 
        error: errorInstance,
        context 
      };
    }
  };
}

/**
 * Result 타입 가드 함수들
 */
export function isSuccess<T, E>(result: Result<T, E>): result is { success: true; data: T } {
  return result.success;
}

export function isFailure<T, E>(result: Result<T, E>): result is { success: false; error: E; context: string } {
  return !result.success;
}

/**
 * Result 헬퍼 함수들 - 중복 코드 제거를 위한 유틸리티
 */
export function success<T>(data: T): Result<T> {
  return { success: true, data };
}

export function failure<T>(error: AppError, context?: string): Result<T> {
  return { success: false, error, context };
}

/**
 * Error를 AppError로 변환하는 헬퍼 함수
 */
export function wrapError<T>(
  error: unknown, 
  message: string, 
  context: string
): Result<T> {
  const errorInstance = error instanceof AppError 
    ? error 
    : new AppError(message, context, error instanceof Error ? error : undefined);
  
  return failure(errorInstance, context);
}

// ==================== DECORATOR 구현 (Stage 3) ====================

/**
 * 메서드 예외 처리를 위한 Decorator (Stage 3)
 * 메서드 실행 중 발생한 예외를 AppError로 변환하여 다시 throw
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

// /**
//  * 여러 Result를 조합하는 유틸리티
//  */
// export function combineResults<T>(results: Result<T>[]): Result<T[]> {
//   const successResults: T[] = [];
//   const errors: Error[] = [];
  
//   for (const result of results) {
//     if (isSuccess(result)) {
//       successResults.push(result.data);
//     } else {
//       errors.push(result.error);
//     }
//   }
  
//   if (errors.length > 0) {
//     return {
//       success: false,
//       error: new Error(`${errors.length}개 작업 실패: ${errors.map(e => e.message).join(', ')}`),
//       context: 'Combined operations'
//     };
//   }
  
//   return { success: true, data: successResults };
// }

/**
 * Result에서 데이터를 안전하게 추출하는 유틸리티
 */
// export function unwrapOr<T>(result: Result<T>, defaultValue: T): T {
//   return isSuccess(result) ? result.data : defaultValue;
// }

// export function unwrapOrThrow<T>(result: Result<T>): T {
//   if (isSuccess(result)) {
//     return result.data;
//   }
//   throw result.error;
// } 