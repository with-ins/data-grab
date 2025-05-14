import {Job} from "./Job";
import {Step} from "../step/Step";
import {Page} from "@playwright/test";
import {SyncManager} from "../component/SyncManager";

export abstract class AbstractJob implements Job {

    public readonly jobName: string;
    private readonly baseUrl: string;
    private syncDate : Date | null;
    private steps : Step[];

    protected constructor(jobName: string, baseUrl: string, steps: Step[]) {
        this.jobName = jobName;
        this.baseUrl = baseUrl;
        this.steps = steps;
    }

    sync() {
        this.syncDate = SyncManager.sync(this.jobName);
    }

    lastModifiedSync() {
        this.syncDate = SyncManager.lastModifiedSync(this.jobName);
    }


    async run(page: Page): Promise<Record<string, any>> {
        let list : Record<string, any[]> = {};
        for (const step of this.steps) {
            const result = await step.run(page, this.syncDate, this.baseUrl);
            list = {...list, ...result};
        }
        if (Object.entries(list).length <= 0) return null;
        return {
            [this.jobName] : list
        };
    }


}