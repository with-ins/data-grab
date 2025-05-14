import {Page} from "@playwright/test";


export interface Step {

    run(page: Page, syncDate: Date, baseUrl: string) : Promise<object>;
}