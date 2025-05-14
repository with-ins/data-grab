import {Page} from "@playwright/test";


export interface Job {


    sync(date: Date) : void;
    run(page: Page): Promise<object>;

}