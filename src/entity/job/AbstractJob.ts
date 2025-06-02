import {Job} from "./Job";
import {Step} from "../step/Step";
import {Page} from "@playwright/test";
import {SyncManager} from "../component/SyncManager";
import {Optimize, Optimizer} from "../Optimize";

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

    private sync(syncDate: Date) {
        this.syncDate = syncDate;
    }

    async run(page: Page, syncDate: Date): Promise<Record<string, any>> {
        await this.optimizer(page);
        this.sync(syncDate);
        let list = await this.runSteps(page);
        // 값이 없으면 null 반환, 값이 있으면 Record 반환
        return (Object.entries(list).length === 0)
            ? null
            :{ [this.jobName] : list };
    }

    private async runSteps(page: Page) {
        let list: Record<string, any[]> = {};
        for (const step of this.steps) {
            const result = await step.run(page, this.syncDate, this.baseUrl);
            list = {...list, ...result};
        }
        return list;
    }

    private async optimizer(page: Page) : Promise<void> {
        const optimizer: Optimizer = new Optimizer();
        optimizer.registerAll([
            Optimize.CSS, Optimize.IMAGE, Optimize.MEDIA, Optimize.FONT
        ])
        this.registerOptimizer(optimizer);

        await page.route('**/*', route => {
            const resourceType = route.request().resourceType();
            if (optimizer.isBlocked(resourceType)) {
                route.abort();
            } else {
                route.continue();
            }
        });
    }
    registerOptimizer(optimizer: Optimizer) : void {}
}