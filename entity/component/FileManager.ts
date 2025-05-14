import fs from "fs";
import path from "node:path";

export class FileManager {

    private static fileName : string = 'results.json';

    static save(result : Record<string, any>) {
        const existingResults = fs.existsSync(FileManager.fileName)
            ? JSON.parse(fs.readFileSync(FileManager.fileName, 'utf-8'))
            : {};

        fs.writeFileSync(FileManager.fileName, JSON.stringify({
            ...existingResults,
            ...result
        }));
    }

    static print() {
        const resultFile = path.join(process.cwd(), FileManager.fileName);

        if (fs.existsSync(resultFile)) {
            const results = JSON.parse(fs.readFileSync(resultFile, 'utf-8'));
            console.log('최종 결과:', results);
            fs.unlinkSync(resultFile); // 파일삭제
        }
    }
}