import path from 'node:path';
import fs from 'node:fs';
import { AppError } from '../errors/AppError';

/**
 * 한국 시간 ISO 형식 반환
 * @returns YYYY-MM-DDTHH:mm:ss+09:00 형식의 한국 시간
 * @example "2025-06-10T22:12:35+09:00"
 */
export function getKoreaTimeISO(): string {
    return (
        new Date()
            .toLocaleString('sv-SE', {
                timeZone: 'Asia/Seoul',
            })
            .replace(' ', 'T') + '+09:00'
    );
}

export function parseKoreaDate(dateString: string, split: string = '-'): Date {
    const parts = dateString.split(split);
    
    // 입력 검증
    if (parts.length !== 3) {
        throw new AppError(
            `잚못된 날짜 형식`,
            'parseKoreaDate',
            undefined,
            { dateString, split, partsCount: parts.length }
        );
    }
    
    const [yearStr, monthStr, dayStr] = parts;
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const day = parseInt(dayStr, 10);
    
    // NaN 체크
    if (isNaN(year) || isNaN(month) || isNaN(day)) {
        throw new AppError(
            `잘못된 날짜 형식`,
            'parseKoreaDate',
            undefined,
            { dateString, split, year: yearStr, month: monthStr, day: dayStr }
        );
    }
    
    // 한국 시간대(UTC+9)에서 해당 날짜의 00:00:00을 나타내는 Date 객체 생성
    // 한국 시간 2024-06-15 00:00:00 = UTC 2024-06-14 15:00:00
    return new Date(`${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T00:00:00+09:00`);
}

export const isEqualOrAfterDateOnly = (baseDate: Date, compareDate: Date | null): boolean => {
    if (!compareDate) return false;

    const base = new Date(baseDate);
    const compare = new Date(compareDate);
    base.setHours(0, 0, 0, 0);
    compare.setHours(0, 0, 0, 0);
    
    return base >= compare;
};
