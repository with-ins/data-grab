/**
 * 시간 관련 유틸리티 함수들
 */

/**
 * 한국 시간 ISO 형식 반환
 * @returns YYYY-MM-DDTHH:mm:ss+09:00 형식의 한국 시간
 * @example "2025-06-10T22:12:35+09:00"
 */
export function getKoreaTimeISO(): string {
    return new Date().toLocaleString('sv-SE', { 
        timeZone: 'Asia/Seoul' 
    }).replace(' ', 'T') + '+09:00';
}
