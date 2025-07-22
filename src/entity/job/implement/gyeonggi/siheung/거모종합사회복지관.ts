import { Locator } from "playwright-core";
import { Category } from "../../../../Category";
import { Optimize, Optimizer } from "../../../../Optimize";
import { MultiCategoryTemplateStep } from "../../../../step/MultiCategoryTemplateStep";
import { AbstractJob } from "../../../AbstractJob";
import { parseDate } from "../../../../../utils/DateUtils";
import { classifyCategory } from "../../../../../utils/CategoryClassifier";
import { SimpleTemplateStep } from "../../../../step/SimpleTemplateStep";

export class 거모종합사회복지관 extends AbstractJob {
    constructor() {
        super('거모종합사회복지관', 'http://geomo.or.kr/', [new 공지사항(), new 보도자료(), new 소식홍보지()])
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

    async select(card: Locator, baseUrl: string): Promise<object> {
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

class 보도자료 extends SimpleTemplateStep {
    constructor() {
        super(
            'http://geomo.or.kr/bbs/board.php?bo_table=news',
            'table tbody tr',
            Category.WELFARE
        );
    }

    async select(card: Locator, baseUrl: string): Promise<object> {
        const a = card.locator('.td_subject a');
        const link = await a.getAttribute('href');
        const title = (await a.textContent()).trim();

        const dateStr = (await card.locator('.td_date').textContent()).trim();
        const createdAt = parseDate(dateStr, '-');
        
        return {
            title: title,
            createdAt: createdAt,
            link: link,
        };
    }
}

class 소식홍보지 extends SimpleTemplateStep {
    constructor() {
        super(
            'http://geomo.or.kr/bbs/board.php?bo_table=promotion',
            'table tbody tr',
            Category.WELFARE
        );
    }

    async select(card: Locator, baseUrl: string): Promise<object> {
        const a = card.locator('.td_subject a');
        const link = await a.getAttribute('href');
        const title = (await a.textContent()).trim();

        const dateStr = (await card.locator('.td_date').textContent()).trim();
        const createdAt = parseDate(dateStr, '-');
        
        return {
            title: title,
            createdAt: createdAt,
            link: link,
        };
    }
}