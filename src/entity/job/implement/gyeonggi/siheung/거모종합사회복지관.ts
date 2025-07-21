import { Locator } from "playwright-core";
import { Category } from "../../../../Category";
import { Optimize, Optimizer } from "../../../../Optimize";
import { MultiCategoryTemplateStep } from "../../../../step/MultiCategoryTemplateStep";
import { AbstractJob } from "../../../AbstractJob";
import { parseDate } from "../../../../../utils/DateUtils";
import { classifyCategory } from "../../../../../utils/CategoryClassifier";

export class 거모종합사회복지관 extends AbstractJob {
    constructor() {
        super('거모종합사회복지관', 'http://geomo.or.kr/', [new 공지사항()])
    }

    registerOptimizer(optimizer: Optimizer) {
        optimizer.register(Optimize.JS);
    }
}

class 공지사항 extends MultiCategoryTemplateStep {
    constructor() {
        super(
            'http://geomo.or.kr/bbs/board.php?bo_table=notice',
            'table tbody tr',
            Category.NOTICE
        );
    }

    async select(card: Locator, baseUrl: string): Promise<object | null> {
        const a = card.locator('.td_subject a');
        const link = await a.getAttribute('href');
        const title = (await a.textContent()).trim();

        const dateStr = (await card.locator('.td_date').textContent()).trim();
        const createdAt = parseDate(dateStr, '-');
        return {
            title: title,
            createdAt: createdAt,
            link: link,
        }
    }

    categorize(data: object): Category | null {
        const { title } = data as { title: string };
        return classifyCategory(title);
    }
}