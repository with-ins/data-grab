/**
 * 에러 메시지 상수 정의
 * Lambda 응답 메시지를 일관성 있게 관리
 */
export const ERROR_MESSAGES = {
    // 크롤링 관련
    CRAWLING_FAILED: '크롤링 실패',
    CRAWLING_SUCCESS_UPLOAD_FAILED: '크롤링 성공했으나 S3 업로드 실패',
    
    // 시스템 관련
    SYSTEM_ERROR: '시스템 에러',
    
    // 성공 메시지
    SUCCESS: '크롤링 및 S3 업로드 성공',

    // === AppError용 메시지들 ===
    
    // 검증 관련
    INVALID_DATE_FORMAT: 'targetDate는 YYYY-MM-DD 형식이어야 합니다',
    INVALID_DATE_VALUE: '유효하지 않은 날짜입니다',
    EMPTY_JOB_NAME: 'jobName은 빈 문자열일 수 없습니다',
    
    // S3 관련  
    S3_UPLOAD_FAILED: 'S3 파일 업로드에 실패했습니다',
    S3_CONNECTION_FAILED: 'S3 연결에 실패했습니다',
    
    // 크롤링 관련
    BROWSER_INIT_FAILED: '브라우저 초기화에 실패했습니다',
    JOB_NOT_FOUND: '요청한 Job을 찾을 수 없습니다',
    JOB_EXECUTION_FAILED: 'Job 실행에 실패했습니다',
    
    // 일반
    UNKNOWN_ERROR: '알 수 없는 오류가 발생했습니다'
} as const;

// 타입 정의
export type ErrorMessageType = typeof ERROR_MESSAGES[keyof typeof ERROR_MESSAGES]; 