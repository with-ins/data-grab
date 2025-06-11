import {AbstractJob} from "../AbstractJob";
import {SimpleTemplateStep} from "../../step/SimpleTemplateStep";
import {Locator} from "playwright-core";
import {Category} from "../../Category";
import {parseDate} from "../../../utils/DateUtils";
import {Optimize, Optimizer} from "../../Optimize";

export class 대한의료사회복지사협회 extends AbstractJob {


    constructor() {
        super(
            '대한의료사회복지사협회',
            'https://kamsw.or.kr',
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
            'https://kamsw.or.kr/notice',
            'table.bd_lst.bd_tb_lst.bd_tb tbody tr',
            Category.NOTICE
        );
    }

    async select(card: Locator, baseUrl: string): Promise<object> {

        const a = card.locator('.title a');

        const link = baseUrl + await a.getAttribute('href');
        const id = this.extractIdUsingStringMethods(link);
        const title = (await a.textContent()).trim();
        const dateStr = (await card.locator('.time').textContent()).trim();
        const createdAt = parseDate(dateStr, '.');

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
            'https://kamsw.or.kr/recruit1',
            'table.bd_lst.bd_tb_lst.bd_tb tbody tr',
            Category.RECRUIT
        );
    }

    async select(card: Locator, baseUrl: string): Promise<object> {

        const a = card.locator('.title a');

        const link = baseUrl + await a.getAttribute('href');
        const id = this.extractIdUsingStringMethods(link);
        const title = (await a.textContent()).trim();
        const dateStr = (await card.locator('.time').textContent()).trim();
        const createdAt = parseDate(dateStr, '.');

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