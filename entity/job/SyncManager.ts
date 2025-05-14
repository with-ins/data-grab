import path from "node:path";
import fs from "node:fs";

export class SyncManager {

    static async sync(jobName: string, date: Date): Promise<Date> {
        try {
            const syncFolderPath = path.join(process.cwd(), 'sync')
            const filePath = path.join(syncFolderPath, `${jobName}.txt`);

            // 2. 작업이름.txt 파일 존재 확인
            if (!fs.existsSync(filePath)) {
                // 파일이 없으면 생성하고 현재 날짜 저장
                const dateString = this.formatDate(date);
                fs.writeFileSync(filePath, dateString, 'utf-8');
                console.log(`파일 생성됨: ${filePath} with date: ${dateString}`);
            }

            return date;
        } catch (error) {
            console.error(`Job.syncSync 에러 발생:`, error);
            throw error;
        }
    }

    static formatDate(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    static parseDate(dateString: string): Date {
        const [year, month, day] = dateString.split('-').map(num => parseInt(num, 10));
        return new Date(year, month - 1, day);
    }
    static parse(year: number, month: number, day: number) {
        return new Date(year, month - 1, day);
    }
}