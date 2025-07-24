import { Locator } from "playwright-core";
import { Category } from "../../../../Category";
import { Optimize, Optimizer } from "../../../../Optimize";
import { MultiCategoryTemplateStep } from "../../../../step/MultiCategoryTemplateStep";
import { AbstractJob } from "../../../AbstractJob";
import { parseKoreaDate } from "../../../../../utils/DateUtils";
import { classifyCategory } from "../../../../../utils/CategoryClassifier";

export class 고강종합사회복지관 extends AbstractJob {
    constructor() {
        super('고강종합사회복지관', 'https://gogangwc.or.kr', [new 알림마당()])
    }

    registerOptimizer(optimizer: Optimizer) {
        optimizer.register(Optimize.JS);
    }
}

class 알림마당 extends MultiCategoryTemplateStep {
    constructor() {
        super(
            'https://gogangwc.tistory.com/category/%EC%95%8C%EB%A6%BC%EB%A7%88%EB%8B%B9',
            '.index-item.article-item',
            Category.NOTICE
        );
    }

    async select(card: Locator, baseUrl: string): Promise<object> {
        const a = card.locator('.index-item-link');
        const link = await a.getAttribute('href');
        const title = (await card.locator('h3').textContent()).trim();

        const dateStr = (await card.locator('.digit').textContent()).trim();
        const createdAt = parseKoreaDate(dateStr, '. ');
        
        return {
            title: title,
            createdAt: createdAt,
            link: baseUrl + link,
        }
    }

    categorize(data: object): Category | null {
        const { title } = data as { title: string };
        return classifyCategory(title);
    }
}

