import { Locator } from "playwright-core";
import { Category } from "../../../../Category";
import { Optimize, Optimizer } from "../../../../Optimize";
import { SimpleTemplateStep } from "../../../../step/SimpleTemplateStep";
import { AbstractJob } from "../../../AbstractJob";
import { parseKoreaDate } from "../../../../../utils/DateUtils";

export class 고양시원당종합사회복지관 extends AbstractJob {
    constructor() {
        super('고양시원당종합사회복지관', 'https://wdss.or.kr', [new 공지사항()])
    }

    registerOptimizer(optimizer: Optimizer) {
        optimizer.register(Optimize.JS);
    }
}

class 공지사항 extends SimpleTemplateStep {
    constructor() {
        super(
            'https://wdss.or.kr/wondang/sub4_1.do',
            '.board-01.board-list tbody tr:not(:first-child)',
            Category.NOTICE
        );
    }

    async select(card: Locator, baseUrl: string): Promise<object> {
        const titleElement = card.locator('.board-title a');
        const link = await titleElement.getAttribute('href');
        const title = (await titleElement.textContent()).trim();

        const dateStr = (await card.locator('td:nth-child(4)').textContent()).trim();
        const createdAt = parseKoreaDate(dateStr, '-');
        
        return {
            title: title,
            createdAt: createdAt,
            link: link
        }
    }   
}
