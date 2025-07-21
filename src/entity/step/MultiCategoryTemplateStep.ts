import { AbstractStep } from './AbstractStep';
import { Locator, Page } from 'playwright-core';
import { Category } from '../Category';

export abstract class MultiCategoryTemplateStep extends AbstractStep {
    private readonly url: string;
    private readonly selectorAll: string;
    private readonly defaultCategory: Category;

    constructor(url: string, selectorAll: string, defaultCategory: Category) {
        super();
        this.url = url;
        this.selectorAll = selectorAll;
        this.defaultCategory = defaultCategory;
    }

    async execute(page: Page, baseUrl: string, syncDate: Date): Promise<Record<string, any[]>> {
        await page.goto(this.url);

        await page.waitForSelector(this.selectorAll, {
            state: 'attached',
        });

        const cards = await page.locator(this.selectorAll).all();
        const result: Record<string, any[]> = {};

        for (const card of cards) {
            const data = await this.select(card, baseUrl);
            if (data == null) continue;

            const category = this.categorize(data) ?? this.defaultCategory;
            
            if (!result[category]) {
                result[category] = [];
            }
            result[category].push(data);
        }

        return result;
    }

    /**
     * 각 card에서 데이터를 추출하는 메서드
     * @param card 크롤링할 카드 요소
     * @param baseUrl 기본 URL
     * @returns 추출된 데이터 객체 또는 null (스킵할 경우)
     */
    abstract select(card: Locator, baseUrl: string): Promise<object | null>;

    /**
     * 추출된 데이터에서 카테고리를 분류하는 메서드
     * @param data select 메서드에서 반환된 데이터
     * @returns 분류된 카테고리 또는 null
     */
    abstract categorize(data: object): Category | null;
}