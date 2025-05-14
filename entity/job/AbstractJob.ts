import {Job} from "./Job";
import {Step} from "../step/Step";
import {Page} from "@playwright/test";
import {SyncManager} from "./SyncManager";

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

    async sync(date: Date): Promise<void> {
        this.syncDate = await SyncManager.sync(this.jobName, date);
    }

    async run(page: Page): Promise<object> {
        let list : object = {};
        for (const step of this.steps) {
            const result = await step.run(page, this.syncDate, this.baseUrl);
            list = {...list, ...result};
        }
        return list;
    }


}