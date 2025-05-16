import {Job} from "./Job";
import {Step} from "../step/Step";
import {Page} from "@playwright/test";
import {SyncManager} from "../component/SyncManager";

export abstract class AbstractJob implements Job {

    readonly jobName: string;
    private readonly baseUrl: string;
    private readonly steps : Step[];
    private syncDate : Date | null;

    protected constructor(jobName: string, baseUrl: string, steps: Step[]) {
        this.jobName = jobName;
        this.baseUrl = baseUrl;
        this.steps = steps;
    }

    private sync() {
        this.syncDate = SyncManager.sync(this.jobName);
    }
    private lastModifiedSync() {
        this.syncDate = SyncManager.lastModifiedSync(this.jobName)
    }

    async run(page: Page): Promise<Record<string, any>> {
        try {
            this.sync();
            let list = await this.runSteps(page);
            // 값이 없으면 null 반환, 값이 있으면 Record 반환
            return (Object.entries(list).length <= 0)
                ? null
                :{ [this.jobName] : list };
        } finally {
            // 싱크를 맞추기 위함
            this.lastModifiedSync();
        }
    }

    private async runSteps(page: Page) {
        let list: Record<string, any[]> = {};
        for (const step of this.steps) {
            const result = await step.run(page, this.syncDate, this.baseUrl);
            list = {...list, ...result};
        }
        return list;
    }
}