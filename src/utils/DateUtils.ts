import path from 'node:path';
import fs from 'node:fs';

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

export function parseDate(dateString: string, split: string = '-'): Date {
    const [year, month, day] = dateString.split(split).map((num) => parseInt(num, 10));
    // JavaScript Date는 월이 0-11이므로 month - 1
    return new Date(year, month - 1, day);
}

export const isEqualOrAfterDateOnly = (baseDate: Date, compareDate: Date | null): boolean => {
    if (!compareDate) return false;

    const base = new Date(baseDate);
    const compare = new Date(compareDate);
    base.setHours(0, 0, 0, 0);
    compare.setHours(0, 0, 0, 0);
    
    return base >= compare;
};
