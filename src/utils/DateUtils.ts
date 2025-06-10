import path from "node:path";
import fs from "node:fs";

export class DateUtils {

    /**
     * 한국 시간 ISO 형식 반환
     * @returns YYYY-MM-DDTHH:mm:ss+09:00 형식의 한국 시간
     * @example "2025-06-10T22:12:35+09:00"
     */
    static getKoreaTimeISO(): string {
        return new Date().toLocaleString('sv-SE', { 
            timeZone: 'Asia/Seoul' 
        }).replace(' ', 'T') + '+09:00';
    }

    static formatDate(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    static parseDate(dateString: string, split: string = '-'): Date {
        const parts = dateString.split(split).map(num => parseInt(num, 10));

        if (parts.length !== 3 || parts.some(isNaN)) {
            throw new Error(`Invalid date format: ${dateString}`);
        }

        const [year, month, day] = parts;
        return new Date(year, month - 1, day + 1);
    }

    static isDateAfter(syncDate: Date, date: Date | null): boolean {
        if (!date) return true;

        syncDate.setHours(0, 0, 0, 0);
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);

        // console.log(`syncDate : ${syncDate}, targetDate : ${targetDate}, result : ${targetDate >= syncDate}`)
        return targetDate >= syncDate;
    }

}