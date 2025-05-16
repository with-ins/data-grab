import {AbstractStep} from "../../../step/AbstractStep";
import {Category} from "../../../Category";
import {Page} from "@playwright/test";
import {SyncManager} from "../../../component/SyncManager";


export class OnlyBucheonImageStep extends AbstractStep {

    private readonly category : Category;
    private readonly url : string;
    private readonly parseToLink: (param1: string, param2: string, param3: string) => string;

    constructor(category: Category, url : string, parseToLink: (param1: string, param2: string, param3: string) => string) {
        super();
        this.category = category;
        this.url = url;
        this.parseToLink = parseToLink;
    }

    async execute(page: Page, baseUrl: string, syncDate: Date): Promise<Record<string, any[]>> {

        await page.goto(this.url, { waitUntil: 'domcontentloaded' });

        await page.waitForSelector('.gallery_list');

        const cards = await page.locator('.tit_cont').all();

        const list = [];
        for (const card of cards) {
            const onclick = await card.getAttribute('onclick');
            const link = this.parseOnclick(onclick);
            await page.goto(link, { waitUntil: 'domcontentloaded' });

            await page.waitForSelector('.board_v_title');

            let dateStr = (await page.locator('.board_v_title > ul > li:nth-child(1) > span:nth-child(2)').textContent()).trim().slice(0, 10)
            const createAt = SyncManager.parseDate(dateStr)

            if (!SyncManager.isDateAfter(syncDate, createAt)) {
                break;
            }

            const title = (await page.locator('.board_v_title h3 span').textContent()).trim();

            list.push({
                'id' : null,
                'title' : title,
                'createAt' : createAt,
                'link' : link,
            })

            await page.goBack();
        }
        return {
            [this.category] : list
        };
    }

    private parseOnclick(onclickStr: string): string | null {
        if (!onclickStr) return null;

        // opView('1', '1008', '20250514165840906', '');
        // 정규식으로 파라미터 추출
        const match = onclickStr.match(/opView\('([^']+)', \s*'([^']+)', \s*'([^']+)', ''\)/);

        if (match) {
            return this.parseToLink(match[1], match[2], match[3]);
        }

        return null;
    }
}