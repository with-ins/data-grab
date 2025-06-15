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
} as const;

// 타입 정의
export type ErrorMessageType = typeof ERROR_MESSAGES[keyof typeof ERROR_MESSAGES]; 