import {AbstractStep} from "./AbstractStep";
import {Locator, Page} from "@playwright/test";
import {Category} from "../Category";

export abstract class SimpleTemplateStep extends AbstractStep {

    private readonly url : string;
    private readonly selectorAll : string;
    private readonly category : Category;

    protected constructor(url: string, selectorAll: string, type: Category) {
        super();
        this.url = url;
        this.selectorAll = selectorAll;
        this.category = type;
    }

    async execute(page: Page, baseUrl: string, syncDate: Date): Promise<Record<string, any[]>> {

        await page.goto(this.url)

        await page.waitForSelector(this.selectorAll)

        const cards = await page.locator(this.selectorAll).all();

        const list = [];

        for (const card of cards) {

            const result = await this.select(card, baseUrl);
            if (result == null) continue;
            list.push(result)
        }

        return {
            [this.category] : list
        };
    }

    abstract select(card: Locator, baseUrl: string) : Promise<object>;
}