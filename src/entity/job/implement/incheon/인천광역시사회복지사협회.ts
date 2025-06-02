import {AbstractJob} from "../../AbstractJob";
import {SimpleTemplateStep} from "../../../step/SimpleTemplateStep";
import {Category} from "../../../Category";
import {Locator} from "@playwright/test";
import {SyncManager} from "../../../component/SyncManager";
import {Optimize, Optimizer} from "../../../Optimize";

export class 인천광역시사회복지사협회 extends AbstractJob {

    constructor() {
        super(
            '인천광역시사회복지사협회',
            'https://www.iasw.or.kr',
            [
                new 공지사항(),
                new 소식(),
                new 구인구직(),
                new 행사및교육(),
            ]
        );
    }

    registerOptimizer(optimizer: Optimizer) {
        optimizer.register(Optimize.JS)
    }
}
class 행사및교육 extends SimpleTemplateStep {

    constructor() {
        super(
            'https://www.iasw.or.kr/board/onsite.php',
            '.bbs_con tbody tr',
            Category.EVENT
        );
    }

    async select(card: Locator, baseUrl: string): Promise<object> {

        const a = card.locator('.left').locator('a').first();

        const title = (await a.textContent()).trim();
        const link = baseUrl + await a.getAttribute('href');

        const params = new  URLSearchParams(link);
        const id = params.get('idx');

        let dateStr = '20' + (await card.locator('td:nth-child(3)').textContent()).trim();
        const createdAt = SyncManager.parseDate(dateStr, '.');

        return {
            'id' : parseInt(id),
            'title' : title,
            'createdAt' : createdAt,
            'link' : link,
        }
    }
}
class 구인구직 extends SimpleTemplateStep {

    constructor() {
        super(
            'https://www.iasw.or.kr/employment/jobinfo.php',
            '.bbs_con tbody tr',
            Category.RECRUIT
        );
    }

    async select(card: Locator, baseUrl: string): Promise<object> {

        const a = card.locator('.left').locator('a').first();

        const title = (await a.textContent()).trim();
        const link = baseUrl + await a.getAttribute('href');

        const params = new  URLSearchParams(link);
        const id = params.get('idx');

        let dateStr = '20' + (await card.locator('td:nth-child(4)').textContent()).trim();
        const createdAt = SyncManager.parseDate(dateStr, '.');

        return {
            'id' : parseInt(id),
            'title' : title,
            'createdAt' : createdAt,
            'link' : link,
        }
    }
}
class 소식 extends SimpleTemplateStep {

    constructor() {
        super(
            'https://www.iasw.or.kr/board/news.php',
            '.bbs_con tbody tr',
            Category.WELFARE
        );
    }

    async select(card: Locator, baseUrl: string): Promise<object> {

        const a = card.locator('.left').locator('a').first();

        const title = (await a.textContent()).trim();
        const link = baseUrl + await a.getAttribute('href');

        const params = new  URLSearchParams(link);
        const id = params.get('idx');

        let dateStr = '20' + (await card.locator('td:nth-child(3)').textContent()).trim();
        const createdAt = SyncManager.parseDate(dateStr, '.');

        return {
            'id' : parseInt(id),
            'title' : title,
            'createdAt' : createdAt,
            'link' : link,
        }
    }
}
class 공지사항 extends SimpleTemplateStep {

    constructor() {
        super(
            'https://www.iasw.or.kr/board/notice.php',
            '.bbs_con tbody tr',
            Category.NOTICE
        );
    }

    async select(card: Locator, baseUrl: string): Promise<object> {

        const a = card.locator('.left').locator('a').first();

        const title = (await a.textContent()).trim();
        const link = baseUrl + await a.getAttribute('href');

        const params = new  URLSearchParams(link);
        const id = params.get('idx');

        let dateStr = '20' + (await card.locator('td:nth-child(3)').textContent()).trim();
        const createdAt = SyncManager.parseDate(dateStr, '.');

        return {
            'id' : parseInt(id),
            'title' : title,
            'createdAt' : createdAt,
            'link' : link,
        }
    }
}