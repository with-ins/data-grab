import {Step} from "./Step";
import {Page} from "playwright-core";
import {isDateAfter} from "../../utils/DateUtils";

export abstract class AbstractStep implements Step {

    async run(page: Page, syncDate: Date, baseUrl: string): Promise<Record<string, any[]>> {
        const result: Record<string, any[]> = await this.execute(page, baseUrl, syncDate);
        this.removeSyncBeforeExclude(result, syncDate);
        return result;
    }

    private removeSyncBeforeExclude(result: Record<string, any[]>, syncDate: Date) {
        if (!result) return;
        const keysToDelete: string[] = [];

        for (const [key, value] of Object.entries(result)) {
            // 배열 내부 객체들을 필터링
            const filtered = value.filter(item => isDateAfter(syncDate, item.createdAt));

            if (filtered.length > 0) {
                result[key] = filtered;
            } else {
                keysToDelete.push(key);
            }
        }

        // 삭제할 키들을 한 번에 삭제
        keysToDelete.forEach(key => delete result[key]);
    }

    abstract execute(page: Page, baseUrl: string, syncDate: Date) : Promise<Record<string, any[]>>;

}