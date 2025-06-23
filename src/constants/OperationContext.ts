/**
 * 작업 컨텍스트 상수 정의
 */
export const OPERATION_CONTEXT = {
    // 크롤링 관련
    BROWSER_INIT: '브라우저 초기화',
    JOB_LOOKUP: 'Job 조회',
    JOB_EXECUTION: 'Job 실행',
    
    // S3 관련
    S3_UPLOAD: 'S3 업로드',
    S3_EMPTY_UPLOAD: '빈 결과 S3 업로드',
    
    // 검증 관련
    EVENT_VALIDATION: '이벤트 검증',
    JOB_NAME_VALIDATION: 'Job 이름 검증',
    TARGET_DATE_VALIDATION: '대상 날짜 검증',
    
    // 페이지 관련
    PAGE_NAVIGATION: '페이지 이동',
    DATA_EXTRACTION: '데이터 추출',
    
    // 시스템 관련
    SYSTEM_ERROR: '시스템 에러',
    UNKNOWN_ERROR: '알 수 없는 에러',
} as const;

// 타입 정의
export type OperationContextType = typeof OPERATION_CONTEXT[keyof typeof OPERATION_CONTEXT]; 