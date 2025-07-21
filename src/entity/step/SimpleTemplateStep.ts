import { AbstractStep } from './AbstractStep';
import { Locator, Page } from 'playwright-core';
import { Category } from '../Category';

export abstract class SimpleTemplateStep extends AbstractStep {
    private readonly url: string;
    private readonly selectorAll: string;
    private readonly category: Category;

    constructor(url: string, selectorAll: string, type: Category) {
        super();
        this.url = url;
        this.selectorAll = selectorAll;
        this.category = type;
    }

    async execute(page: Page, baseUrl: string, syncDate: Date): Promise<Record<string, any[]>> {
        await page.goto(this.url);

        await page.waitForSelector(this.selectorAll, {
            state: 'attached',
        });

        const cards = await page.locator(this.selectorAll).all();

        const list = [];

        for (const card of cards) {
            const result = await this.select(card, baseUrl);
            if (result == null) continue;
            list.push(result);
        }

        return {
            [this.category]: list,
        };
    }

    /**
     * 각 card에서 데이터를 추출하는 메서드
     * @param card 크롤링할 카드 요소
     * @param baseUrl 기본 URL
     * @returns 추출된 데이터 객체 또는 null (스킵할 경우)
     */
    abstract select(card: Locator, baseUrl: string): Promise<object>;
}
