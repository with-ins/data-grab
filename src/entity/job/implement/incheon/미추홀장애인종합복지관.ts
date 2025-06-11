import {AbstractJob} from "../../AbstractJob";
import {SimpleTemplateStep} from "../../../step/SimpleTemplateStep";
import {Locator, Page} from "playwright-core";
import {Category} from "../../../Category";
import {parseDate, isDateAfter} from "../../../../utils/DateUtils";
import {AbstractStep} from "../../../step/AbstractStep";
import {Optimize, Optimizer} from "../../../Optimize";

export class 미추홀장애인종합복지관 extends AbstractJob {

    constructor() {
        super(
            '미추홀장애인종합복지관',
            'https://icjb.or.kr',
            [
                new 미추홀공지사항(),
                new 미추홀채용(),
                new 미추홀소식()
            ]
        );
    }

    registerOptimizer(optimizer: Optimizer) {
        optimizer.register(Optimize.JS)
    }
}

class 미추홀소식 extends AbstractStep {

    async execute(page: Page, baseUrl: string, syncDate: Date): Promise<Record<string, any[]>> {

        await page.goto('https://michurc.or.kr/bbs/board.php?bo_table=0204', {waitUntil : "domcontentloaded"});

        await page.waitForSelector('#gall_ul', {
            state: 'attached'
        });

        const cards = await page.locator('.col-xs-12.col-sm-6.col-md-4.col-lg-3').all()

        const list = [];

        for (const card of cards) {

            const id = (await card.locator('.sr-only').textContent()).trim();
            const link = await card.locator('a').first().getAttribute('href');

            await page.goto(link,  {waitUntil: "domcontentloaded"});
            await page.waitForSelector('.panel-heading:not(.board_head)', {
                state: 'attached'
            });

            const title = await page.locator('.pull-left h6').evaluate((el) => {
                let textContent = '';
                for (const node of el.childNodes) {
                    if (node.nodeType === Node.TEXT_NODE) {
                        textContent += node.textContent;
                    }
                }
                return textContent.trim();
            });

            // 25-05-15 14:41
            let dateStr =  (await page.locator('.panel-heading .pull-right span:first-child').textContent()).trim();
            // 2025-05-15
            dateStr = ('20' + dateStr).slice(0, 10)
            const createdAt = parseDate(dateStr, '-');

            if (!isDateAfter(syncDate, createdAt)) break;

            list.push({
                'id' : parseInt(id),
                'title' : title,
                'createdAt' : createdAt,
                'link' : link,
            })
            await page.goBack();
        }

        return {
            [Category.WELFARE] : list
        };
    }

}
class 미추홀채용 extends SimpleTemplateStep {
    constructor() {
        super(
            'https://michurc.or.kr/bbs/board.php?bo_table=0207',
            'tr.text-center:not(.bo_notice)',
            Category.RECRUIT
        );
    }

    async select(card: Locator, baseUrl: string): Promise<object> {

        const id = (await card.locator('.td_num').first().textContent()).trim();

        const a = card.locator('.td_subject > a');
        const link = await a.getAttribute('href');
        const title = (await a.textContent()).trim();
        const createdAt = parseDate((await card.locator('.td_date').textContent()).trim(), '-');

        return {
            'id' : parseInt(id),
            'title' : title,
            'createdAt' : createdAt,
            'link' : link,
        };
    }

}
class 미추홀공지사항 extends SimpleTemplateStep {

    constructor() {
        super(
            'https://michurc.or.kr/bbs/board.php?bo_table=0202',
            'tr.text-center:not(.bo_notice)',
            Category.NOTICE
        );
    }

    async select(card: Locator, baseUrl: string): Promise<object> {

        const id = (await card.locator('.td_num').first().textContent()).trim();

        const a = card.locator('.td_subject > a');
        const link = await a.getAttribute('href');
        const title = (await a.textContent()).trim();
        const createdAt = parseDate((await card.locator('.td_date').textContent()).trim(), '-');

        return {
            'id' : parseInt(id),
            'title' : title,
            'createdAt' : createdAt,
            'link' : link,
        };
    }

}