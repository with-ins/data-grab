/**
 * Result 타입 - 성공 또는 실패를 나타내는 타입
 */
export type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E; context?: string };

/**
 * HOF: 비동기 함수를 래핑하여 예외를 Result 타입으로 변환
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
      const errorInstance = error instanceof Error ? error : new Error(String(error));
      
      console.error(`[${context}] 실패:`, {
        error: errorInstance.message,
        stack: errorInstance.stack,
        timestamp: new Date().toISOString()
      });
      
      return { 
        success: false, 
        error: errorInstance, 
        context 
      };
    }
  };
}

/**
 * HOF: 동기 함수를 래핑하여 예외를 Result 타입으로 변환
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
      const errorInstance = error instanceof Error ? error : new Error(String(error));
      
      console.error(`[${context}] 실패:`, {
        error: errorInstance.message,
        timestamp: new Date().toISOString()
      });
      
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

export function isFailure<T, E>(result: Result<T, E>): result is { success: false; error: E; context?: string } {
  return !result.success;
}

/**
 * 여러 Result를 조합하는 유틸리티
 */
export function combineResults<T>(results: Result<T>[]): Result<T[]> {
  const successResults: T[] = [];
  const errors: Error[] = [];
  
  for (const result of results) {
    if (isSuccess(result)) {
      successResults.push(result.data);
    } else {
      errors.push(result.error);
    }
  }
  
  if (errors.length > 0) {
    return {
      success: false,
      error: new Error(`${errors.length}개 작업 실패: ${errors.map(e => e.message).join(', ')}`),
      context: 'Combined operations'
    };
  }
  
  return { success: true, data: successResults };
}

/**
 * Result에서 데이터를 안전하게 추출하는 유틸리티
 */
export function unwrapOr<T>(result: Result<T>, defaultValue: T): T {
  return isSuccess(result) ? result.data : defaultValue;
}

export function unwrapOrThrow<T>(result: Result<T>): T {
  if (isSuccess(result)) {
    return result.data;
  }
  throw result.error;
} 