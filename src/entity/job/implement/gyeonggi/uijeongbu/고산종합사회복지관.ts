import { Locator } from "playwright-core";
import { Category } from "../../../../Category";
import { Optimize, Optimizer } from "../../../../Optimize";
import { MultiCategoryTemplateStep } from "../../../../step/MultiCategoryTemplateStep";
import { AbstractJob } from "../../../AbstractJob";
import { SimpleTemplateStep } from "../../../../step/SimpleTemplateStep";
import { classifyCategory } from "../../../../../utils/CategoryClassifier";
import { parseKoreaDate } from "../../../../../utils/DateUtils";

export class 고산종합사회복지관 extends AbstractJob {
    constructor() {
        super('고산종합사회복지관', 'https://ujbgosan.or.kr', [new 공지사항_전체(), new 공지사항_안내(), new 공지사항_공고()])
    }

    registerOptimizer(optimizer: Optimizer) {
        optimizer.register(Optimize.JS);
    }
}

class 공지사항_전체 extends MultiCategoryTemplateStep {

    constructor() {
        super(
            'https://ujbgosan.or.kr/bbs/board.php?bo_table=notice',
            '.list_01 ul li:not(.li_top)',
            Category.NOTICE
        );
    }

    async select(card: Locator, baseUrl: string): Promise<object> {
        const categoryElement = card.locator('.bo_cate_link');
        const categoryText = await categoryElement.textContent();
        
        if (categoryText && categoryText.trim() !== '공지') {
            return null;
        }

        const a = card.locator('.subject a');
        const link = await a.getAttribute('href');
        const title = (await a.textContent()).trim();

        const dateStr = (await card.locator('.bo_date').textContent()).trim();
        const createdAt = parseKoreaDate(dateStr, '-');
        
        return {
            title: title,
            createdAt: createdAt,
            link: link
        }
    }

    categorize(data: object): Category | null {
        const { title } = data as { title: string };
        return classifyCategory(title);
    }    
}

class 공지사항_안내 extends SimpleTemplateStep {
    constructor() {
        super(
            'https://ujbgosan.or.kr/bbs/board.php?bo_table=notice&sca=%EC%95%88%EB%82%B4',
            '.list_01 ul li:not(.li_top)',
            Category.WELFARE
        );
    }

    async select(card: Locator, baseUrl: string): Promise<object> {
        const a = card.locator('.subject a');
        const link = await a.getAttribute('href');
        const title = (await a.textContent()).trim();

        const dateStr = (await card.locator('.bo_date').textContent()).trim();
        const createdAt = parseKoreaDate(dateStr, '-');
        
        return {
            title: title,
            createdAt: createdAt,
            link: link
        }
    }   
}

class 공지사항_공고 extends SimpleTemplateStep {
    constructor() {
        super(
            'https://ujbgosan.or.kr/bbs/board.php?bo_table=notice&sca=%EA%B3%B5%EA%B3%A0',
            '.list_01 ul li:not(.li_top)',
            Category.RECRUIT
        );
    }

    async select(card: Locator, baseUrl: string): Promise<object> {
        const a = card.locator('.subject a');
        const link = await a.getAttribute('href');
        const title = (await a.textContent()).trim();

        const dateStr = (await card.locator('.bo_date').textContent()).trim();
        const createdAt = parseKoreaDate(dateStr, '-');
        
        return {
            title: title,
            createdAt: createdAt,
            link: link
        }
    }   
}
