import {AbstractJob} from "../../AbstractJob";
import {AbstractStep} from "../../../step/AbstractStep";
import {Locator, Page} from "playwright-core";
import {DateUtils} from "../../../../utils/DateUtils";
import {Category} from "../../../Category";
import {Optimizer} from "../../../Optimize";


export class 인천종합사회복지관 extends AbstractJob {

    constructor() {
        super(
            '인천종합사회복지관',
            'http://www.icwelfare.or.kr',
            [
                new IncheonNotice(),
                new IncheonWelfare(),
                new IncheonEvent()
            ]);
    }

}

class IncheonWelfare extends AbstractStep {

    async execute(page: Page, baseUrl: string, syncDate: Date): Promise<Record<string, any[]>> {
        await page.goto('http://www.icwelfare.or.kr/main/sub.html?pageCode=28', { waitUntil: 'domcontentloaded' });
        await page.waitForSelector('.mdWebzineWrap', {
            state: 'attached'
        });

        const cards = await page.locator('.mdWebzineText').all();

        const list= [];

        for (const card of cards) {

            const a = card.locator('a').first();

            const title = (await a.textContent()).trim();
            const id = await this.getId(a);
            const link = baseUrl + await a.getAttribute('href');

            const pText = (await card.locator('p.mdDefaultW100.mdTextOverflow2.mdWzSsbj').textContent()).trim();
            const dateMatch = pText.match(/\d{4}\.\d{2}\.\d{2}/);
            const date = dateMatch ? dateMatch[0] : null;
            const createdAt = DateUtils.parseDate(date, '.');

            list.push({
                'id' : Number(id),
                'title' : title,
                'createdAt' : createdAt,
                'link' : link,
            })
        }

        return {[Category.WELFARE] : list}
    }

    private async getId(a: Locator) : Promise<string> {
        const link = await a.getAttribute('href');
        const urlParams = new URLSearchParams(link.split('?')[1]);
        return urlParams.get('num');
    }
}
class IncheonEvent extends AbstractStep {

    async execute(page: Page, baseUrl: string, syncDate: Date): Promise<Record<string, any[]>> {
        await page.goto('http://www.icwelfare.or.kr/main/sub.html?pageCode=37', { waitUntil: 'domcontentloaded' });
        await page.waitForSelector('.mdWebzineWrap', {
            state: 'attached'
        });

        const cards = await page.locator('.mdWebzineText').all();

        const list= [];

        for (const card of cards) {

            const a = card.locator('a').first();

            const title = (await a.textContent()).trim();
            const id = await this.getId(a);
            const link = baseUrl + await a.getAttribute('href');

            const pText = (await card.locator('p.mdDefaultW100.mdTextOverflow2.mdWzSsbj').textContent()).trim();
            const dateMatch = pText.match(/\d{4}\.\d{2}\.\d{2}/);
            const date = dateMatch ? dateMatch[0] : null;
            const createdAt = DateUtils.parseDate(date, '.');

            list.push({
                'id' : Number(id),
                'title' : title,
                'createdAt' : createdAt,
                'link' : link,
            })
        }

        return {[Category.EVENT] : list}
    }

    private async getId(a: Locator) : Promise<string> {
        const link = await a.getAttribute('href');
        const urlParams = new URLSearchParams(link.split('?')[1]);
        return urlParams.get('num');
    }
}
class IncheonNotice extends AbstractStep {

    async execute(page: Page, baseUrl: string, syncDate: Date): Promise<Record<string, any[]>> {

        await page.goto('http://www.icwelfare.or.kr/main/sub.html?pageCode=25', { waitUntil: 'domcontentloaded' });

        await page.waitForSelector('.mdResponsiveBody tbody', {
            state: 'attached'
        })

        const body = page.locator('tbody').first();
        const cards = await body.locator('tr:not(.jTh):not(.jTh2)').all();

        const list = [];
        for (const card of cards) {

            const id = (await card.locator('.jNum').textContent()).trim();

            const titleBox = card.locator('.jSubject > div > a');
            const title = await titleBox.textContent();
            const link = baseUrl + (await titleBox.getAttribute('href'))

            const createdAt : Date = DateUtils.parseDate((await card.locator('.jDate').textContent()).trim(), '.');

            list.push({
                'id' : Number(id),
                'title' : title,
                'createdAt' : createdAt,
                'link' : link,
            })
        }

        return {[Category.NOTICE] : list};
    }

}