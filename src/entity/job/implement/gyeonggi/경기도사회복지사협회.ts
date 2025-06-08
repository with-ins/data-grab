import {AbstractJob} from "../../AbstractJob";
import {SimpleTemplateStep} from "../../../step/SimpleTemplateStep";
import {Locator} from "playwright-core";
import {Category} from "../../../Category";
import {SyncManager} from "../../../component/SyncManager";
import {Optimize, Optimizer} from "../../../Optimize";

export class 경기도사회복지사협회 extends AbstractJob {


    constructor() {
        super(
            '경기도사회복지사협회',
            'https://www.ggsw.kr',
            [
                new 공지사항(),
                new 채용(),
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
            'https://www.ggsw.kr/public/board/bbs61?s_type=title&s_category=%EA%B3%B5%EC%A7%80&s_word=',
            '.news-list a',
            Category.NOTICE
        );
    }

    async select(card: Locator, baseUrl: string): Promise<object> {

        const link = await card.getAttribute('href');
        const id = this.extractIdUsingStringMethods(link);
        const title = (await card.locator('.txt_box').textContent()).trim()

        const dateDiv  = card.locator('.date_box');
        const yearMonth = (await dateDiv.locator('span').textContent()).trim();
        const day = (await dateDiv.locator('p').textContent()).trim();
        const createdAt = SyncManager.parseDate(yearMonth + '.' + day, '.');

        return {
            'id' : parseInt(id),
            'title' : title,
            'createdAt' : createdAt,
            'link' : link,
        }
    }

    private extractIdUsingStringMethods(url: string): string | null {
        // URL에서 쿼리 매개변수 제거
        const urlWithoutQuery = url.split('?')[0];
        // 경로 부분에서 마지막 슬래시 이후의 내용 가져오기
        const segments = urlWithoutQuery.split('/');
        return segments[segments.length - 1] || null;
    }

}
class 채용 extends SimpleTemplateStep {

    constructor() {
        super(
            'https://www.ggsw.kr/public/board/bbs61?s_type=title&s_category=%EC%B1%84%EC%9A%A9&s_word=',
            '.news-list a',
            Category.RECRUIT
        );
    }

    async select(card: Locator, baseUrl: string): Promise<object> {

        const link = await card.getAttribute('href');
        const id = this.extractIdUsingStringMethods(link);
        const title = (await card.locator('.txt_box').textContent()).trim()

        const dateDiv  = card.locator('.date_box');
        const yearMonth = (await dateDiv.locator('span').textContent()).trim();
        const day = (await dateDiv.locator('p').textContent()).trim();
        const createdAt = SyncManager.parseDate(yearMonth + '.' + day, '.');

        return {
            'id' : parseInt(id),
            'title' : title,
            'createdAt' : createdAt,
            'link' : link,
        }
    }

    private extractIdUsingStringMethods(url: string): string | null {
        // URL에서 쿼리 매개변수 제거
        const urlWithoutQuery = url.split('?')[0];
        // 경로 부분에서 마지막 슬래시 이후의 내용 가져오기
        const segments = urlWithoutQuery.split('/');
        return segments[segments.length - 1] || null;
    }

}