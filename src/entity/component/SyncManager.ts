import path from "node:path";
import fs from "node:fs";

export class SyncManager {

    private static url = 'http://localhost:8080/api/v1/sync';
    private static fetchSyncJson = 'fetchSync.json';
    private static fileName : string = 'results.json';

    static save(jobName: string, result : Record<string, any>) {
        const existingResults = fs.existsSync(this.fileName)
            ? JSON.parse(fs.readFileSync(this.fileName, 'utf-8'))
            : {
                'complete' : [],
                'news' : {}
            };

        existingResults.complete = [...existingResults['complete'], jobName];
        existingResults.news = {...existingResults['news'], ...result};

        fs.writeFileSync(this.fileName, JSON.stringify(existingResults));
    }

    private static initDelete() {
        if (fs.existsSync(this.fileName)) {
            fs.unlinkSync(this.fileName);
        }
        if (fs.existsSync(this.fetchSyncJson)) {
            fs.unlinkSync(this.fetchSyncJson);
        }
    }
    static async fetchSync() {
        this.initDelete();
        const json = await fetch(this.url).then(res => res.json());

        const syncFolderPath = path.join(process.cwd(), 'sync')
        const filePath = path.join(syncFolderPath, this.fetchSyncJson);

        // sync 폴더가 없으면 생성
        if (!fs.existsSync(syncFolderPath)) {
            fs.mkdirSync(syncFolderPath, { recursive: true });
        }

        fs.writeFileSync(filePath, JSON.stringify(json), 'utf-8');
        console.log(`파일 생성됨: ${filePath}`);
    }

    static async sync() {
        await fetch(this.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: fs.readFileSync(this.fileName, 'utf-8')
        }).then(res => res.json())
        .then(json => {
            console.log(json);
        })
    }
    static loadFetchSync() {
        const syncFolderPath = path.join(process.cwd(), 'sync')
        const filePath = path.join(syncFolderPath, this.fetchSyncJson);

        if (!fs.existsSync(filePath)) {
            throw new Error(`파일이 존재하지 않습니다: ${filePath}`);
        }
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
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