import {AbstractJob} from "../AbstractJob";
import {SimpleTemplateStep} from "../../step/SimpleTemplateStep";
import {Category} from "../../Category";
import {Locator} from "playwright-core";
import {SyncManager} from "../../component/SyncManager";
import {Optimize, Optimizer} from "../../Optimize";

export class 한국노인인력개발원 extends AbstractJob {

    constructor() {
        super(
            '한국노인인력개발원',
            'https://www.kordi.or.kr',
            [
                new 공지사항(),
                new 채용()
            ]
        );
    }

    registerOptimizer(optimizer: Optimizer) {
        optimizer.register(Optimize.JS)
    }
}

class 공지사항 extends SimpleTemplateStep {

    constructor() {
        super(
            'https://www.kordi.or.kr/content.do?cmsId=91',
            'tbody tr',
            Category.NOTICE
        );
    }

    async select(card: Locator, baseUrl: string): Promise<object> {
        const a = card.locator('.tal a');

        const link = baseUrl + await a.getAttribute('href');
        const id = new URLSearchParams(link).get('cid');
        const title = (await a.textContent()).trim()

        const dateStr = (await card.locator('td:nth-child(5)').textContent()).trim();
        const createdAt = SyncManager.parseDate(dateStr, '.');

        return {
            'id' : parseInt(id),
            'title' : title,
            'createdAt' : createdAt,
            'link' : link,
        }
    }
}
class 채용 extends SimpleTemplateStep {

    constructor() {
        super(
            'https://www.kordi.or.kr/content.do?cmsId=170',
            'tbody tr',
            Category.RECRUIT
        );
    }

    async select(card: Locator, baseUrl: string): Promise<object> {
        const a = card.locator('.tal a');

        const link = baseUrl + (await a.getAttribute('href')).replace(' ', '');
        const id = new URLSearchParams(link).get('cid');
        const title = (await a.textContent()).trim()

        const dateStr = (await card.locator('td:nth-child(5)').textContent()).trim();
        const createdAt = SyncManager.parseDate(dateStr, '.');

        return {
            'id' : parseInt(id),
            'title' : title,
            'createdAt' : createdAt,
            'link' : link,
        }
    }
}