import {AbstractJob} from "../../AbstractJob";
import {Locator} from "@playwright/test";
import {SyncManager} from "../../../component/SyncManager";
import {SimpleTemplateStep} from "../../../step/SimpleTemplateStep";
import {Category} from "../../../Category";
import {type} from "node:os";

export class 서울시사회복지사협회 extends AbstractJob {


    constructor() {
        super(
            '서울시사회복시자협회',
            'https://sasw.or.kr',
            [
                new SeoulNoticeStep(),
                new SeoulRecruitStep(),
                new SeoulEventStep(),
            ]
        );
    }
}
class SeoulEventStep extends SimpleTemplateStep {

    constructor() {
        super(
            'https://sasw.or.kr/event',
            '.bd_lst.bd_tb_lst.bd_tb tbody tr:not(.notice)',
            Category.EVENT
        );
    }

    async select(card: Locator, baseUrl: string): Promise<object> {
        const type = (await card.locator('.cate span').textContent()).trim();
        if (type == '[구인/구직]' || type == '[복지뉴스]') return null;

        const id = (await card.locator('.no').textContent()).trim();
        const a = card.locator('.title a');

        const link = baseUrl + await a.getAttribute('href');
        const title = (await a.textContent()).trim();
        const createAt = SyncManager.parseDate((await card.locator('.time').textContent()).trim(), '.');

        return {
            'id' : parseInt(id),
            'title' : title,
            'createAt' : createAt,
            'link' : link,
        }
    }
}
class SeoulRecruitStep extends SimpleTemplateStep {

    constructor() {
        super(
            'https://sasw.or.kr/recruit',
            '.bd_lst.bd_tb_lst.bd_tb tbody tr:not(.notice)',
            Category.RECRUIT
        );
    }

    async select(card: Locator, baseUrl: string): Promise<object> {
        const id = (await card.locator('.no').textContent()).trim();
        const a = card.locator('.title a');

        const link = baseUrl + await a.getAttribute('href');
        const title = (await a.textContent()).trim();
        const createAt = SyncManager.parseDate((await card.locator('.time').textContent()).trim(), '.');

        return {
            'id' : parseInt(id),
            'title' : title,
            'createAt' : createAt,
            'link' : link,
        }
    }
}
class SeoulNoticeStep extends SimpleTemplateStep {

    constructor() {
        super(
            'https://sasw.or.kr/notice',
            '.bd_lst.bd_tb_lst.bd_tb tbody tr:not(.notice)',
            Category.NOTICE
        );
    }

    async select(card: Locator, baseUrl: string): Promise<object> {
        const type = (await card.locator('.cate span').textContent()).trim();
        if (type == '[회원이벤트]') return null;

        const id = (await card.locator('.no').textContent()).trim();

        const a = card.locator('.title a');

        const link = baseUrl + await a.getAttribute('href');
        const title = (await a.textContent()).trim();
        const createAt = SyncManager.parseDate((await card.locator('.time').textContent()).trim(), '.');

        return {
            'id' : parseInt(id),
            'title' : title,
            'createAt' : createAt,
            'link' : link,
        }
    }
}
