# HOF 예외처리 패턴 제거 리팩터링 계획

## 🎯 리팩터링 목표

현재 코드베이스에서 HOF(Higher-Order Function)를 통한 예외처리 패턴을 제거하고, 스프링의 `@ExceptionHandler`와 같은 예외처리 아키텍처로 변경합니다.

**Stage 3 Decorator 적용**: TypeScript 5.0+에서 기본 지원하는 Stage 3 Decorator를 사용하여 더 타입 안전하고 표준화된 예외 처리 구현

## 📋 현재 상황 분석

### ✅ 완료된 작업
- **Stage 3 Decorator 마이그레이션 완료**: Legacy Decorator에서 TypeScript 5.0+ 표준 Stage 3 Decorator로 변경
- **HandleErrors Decorator 구현 완료**: 비동기/동기 함수 모두 지원하는 통합 예외 처리 Decorator
- **TypeScript 설정 현대화**: `experimentalDecorators` 설정 제거, 기본 지원 Stage 3 Decorator 사용

### HOF 패턴이 사용되는 위치들 (제거 예정)

1. **src/utils/ErrorHandling.ts** (핵심 HOF 함수들)
   - `withErrorHandling` - 비동기 함수 래핑
   - `withSyncErrorHandling` - 동기 함수 래핑
   - `Result<T>` 타입을 반환하는 패턴

2. **src/aws/lambda/CrawlingService.ts** (3개 메서드)
   - `initializeBrowser` - 브라우저 초기화 (비동기)
   - `findJob` - Job 찾기 (동기)
   - `executeJob` - Job 실행 (비동기)

3. **src/aws/s3/S3Service.ts** (2개 메서드)
   - `uploadResultSafely` - S3 업로드 (비동기)
   - `uploadEmptyResultSafely` - 빈 결과 업로드 (비동기)

### 호출 흐름 분석

```
handler.ts (Lambda Entry Point)
    ↓
CrawlingService.executeCrawling()
    ├── initializeBrowser() [HOF 사용]
    ├── findJob() [HOF 사용]
    ├── executeJob() [HOF 사용]
    └── S3Service.uploadResults()
            ├── uploadResultSafely() [HOF 사용]
            └── uploadEmptyResultSafely() [HOF 사용]
```

## 🔧 리팩터링 전략

### 1. 변경 방향
- **From**: HOF 래핑 + Result 타입 반환
- **To**: Decorator 패턴 + 직접 예외 던지기

### 2. 예외 처리 아키텍처
- **Decorator를 통한 선언적 예외 처리**: 각 메서드에 @HandleErrors 적용
- **스프링 스타일 중앙 예외 처리**: 상위 레벨(handler.ts)에서 통합 처리
- **관심사 분리**: 비즈니스 로직과 예외 처리 로직 완전 분리
- AWS Lambda의 요청/응답 인터페이스는 변경 없음

### 3. 변경 예시

**Before (HOF 패턴):**
```typescript
private uploadResultSafely = withErrorHandling(
    async (results: any[], targetDate: TargetDate, jobName: string): Promise<string> => {
        return await this.s3Uploader.uploadCrawlingResults(results, targetDate.value, jobName);
    },
    OPERATION_CONTEXT.S3_UPLOAD
);

async uploadResults(results: any[], targetDate: TargetDate, jobName: string): Promise<Result<string>> {
    const uploadResult = await this.uploadResultSafely(results, targetDate, jobName);
    if (isFailure(uploadResult)) {
        return failure(new AppError(...), OPERATION_CONTEXT.S3_UPLOAD);
    }
    return success(uploadResult.data);
}
```

**After (Decorator 패턴):**
```typescript
@HandleErrors(OPERATION_CONTEXT.S3_UPLOAD, ERROR_MESSAGES.S3_UPLOAD_FAILED)
async uploadResults(results: any[], targetDate: TargetDate, jobName: string): Promise<string> {
    return await this.s3Uploader.uploadCrawlingResults(results, targetDate.value, jobName);
}

@HandleErrors(OPERATION_CONTEXT.S3_EMPTY_UPLOAD, ERROR_MESSAGES.S3_UPLOAD_FAILED)
async uploadEmptyResult(targetDate: TargetDate, jobName: string): Promise<string> {
    return await this.s3Uploader.uploadCrawlingResults([], targetDate.value, jobName);
}
```

### 4. Decorator 구현 (Stage 3)

**HandleErrors Decorator:**
```typescript
export function HandleErrors(contextName: string, errorMessage: string) {
  return function <T, A extends any[]>(
    originalMethod: (...args: A) => T, 
    context: ClassMethodDecoratorContext<unknown, (...args: A) => T>
  ) {
    if (context.kind !== 'method') {
      throw new Error(`@HandleErrors can only be applied to methods, but got ${context.kind}`);
    }
    
    return function (this: unknown, ...args: A): T {
      try {
        console.log(`[${contextName}] 시작`);
        const result = originalMethod.apply(this, args);
        
        // Promise인 경우 비동기 처리
        if (result && typeof result === 'object' && 'then' in result) {
          return result.then(
            (value: any) => {
              console.log(`[${contextName}] 성공`);
              return value;
            },
            (error: any) => {
              console.warn(`[${contextName}] 실패:`, error);
              if (error instanceof AppError) throw error;
              throw new AppError(errorMessage, contextName, error instanceof Error ? error : undefined);
            }
          ) as T;
        }
        
        // 동기 함수인 경우
        console.log(`[${contextName}] 성공`);
        return result;
      } catch (error) {
        console.warn(`[${contextName}] 실패:`, error);
        if (error instanceof AppError) throw error;
        throw new AppError(errorMessage, contextName, error instanceof Error ? error : undefined);
      }
    };
  };
}
```

## 📝 작업 순서

### Phase 1: Decorator 인프라 구축
1. **Decorator 구현** - HandleErrors 핵심 Decorator 작성 (Stage 3)
2. **TypeScript 설정** - Stage 3 Decorators 기본 지원 확인 (TypeScript 5.0+ 설정 불필요)

### Phase 2: 의존성 말단부터 Decorator 적용
3. **S3Service.ts** - HOF 제거하고 @HandleErrors Decorator 적용
4. **CrawlingService.ts** - HOF 제거하고 Decorator 패턴으로 전환
5. **JobExecutor.ts** - Job 실행 관련 검토 및 Decorator 적용 (필요시)

### Phase 3: 상위 레벨 통합
6. **handler.ts** - Result 타입 대신 직접 예외 처리로 변경
7. **ErrorHandling.ts** - 사용하지 않는 HOF 함수들 정리, Decorator 유틸리티 추가

### Phase 4: 검증 및 정리
8. **테스트 코드 업데이트** - Decorator 기반 예외 처리 방식에 맞게 수정
9. **불필요한 import 정리** - Result 타입 관련 import 제거
10. **Decorator 최적화** - 성능 및 타입 안전성 개선

## 🔍 주의사항

### 1. API 인터페이스 유지
- Lambda의 `CrawlingEvent` 요청 형식 유지
- Lambda의 `CrawlingResponse` 응답 형식 유지
- 외부 호출자는 변경 사항을 인지하지 못해야 함

### 2. 에러 정보 보존
- 기존 AppError의 context, metadata 정보 유지
- 로깅 수준 및 내용 유지
- 디버깅에 필요한 정보 손실 방지

### 3. 예외 전파 경로
- 각 레이어에서 적절한 예외 변환
- 최상위(handler.ts)에서 Lambda 응답 형식으로 변환
- 시스템 예외와 비즈니스 예외 구분 유지

## 🎯 성공 기준

1. **기능적 요구사항**
   - 모든 기존 기능이 동일하게 작동
   - Lambda 요청/응답 인터페이스 변경 없음
   - 에러 메시지 및 로깅 정보 유지

2. **코드 품질**
   - HOF 패턴 완전 제거
   - Result 타입 의존성 제거
   - 예외 처리 로직 단순화
   - Stage 3 Decorator 표준 적용

3. **유지보수성**
   - 더 직관적인 예외 처리 흐름
   - 스프링과 유사한 예외 처리 패턴
   - 코드 가독성 향상
   - 타입 안전성 강화 (Stage 3 Decorator)

## 📚 참고 자료

- 기존 에러 메시지: `src/constants/ErrorMessages.ts`
- 컨텍스트 정의: `src/constants/OperationContext.ts`
- 에러 클래스: `src/errors/AppError.ts` 