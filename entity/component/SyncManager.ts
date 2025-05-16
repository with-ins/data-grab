import path from "node:path";
import fs from "node:fs";

export class SyncManager {

    static sync(jobName: string): Date {
        try {
            const syncFolderPath = path.join(process.cwd(), 'sync')
            const filePath = path.join(syncFolderPath, `${jobName}.txt`);

            // 2. 작업이름.txt 파일 존재 확인
            if (!fs.existsSync(filePath)) {
                const today = new Date();
                const dateString = this.formatDate(today);
                fs.writeFileSync(filePath, dateString, 'utf-8');
                console.log(`파일 생성됨: ${filePath} with date: ${dateString}`);
                return today;
            }
            const dateString = fs.readFileSync(filePath, 'utf-8').trim();

            return this.parseDate(dateString);
        } catch (error) {
            console.error(`Job.syncSync 에러 발생:`, error);
            throw error;
        }
    }

    static lastModifiedSync(jobName: string) : Date {
        const syncFolderPath = path.join(process.cwd(), 'sync')
        const filePath = path.join(syncFolderPath, `${jobName}.txt`);

        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        const dateString = this.formatDate(tomorrow);
        fs.writeFileSync(filePath, dateString, 'utf-8');
        return tomorrow;
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
        return new Date(year, month - 1, day);
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