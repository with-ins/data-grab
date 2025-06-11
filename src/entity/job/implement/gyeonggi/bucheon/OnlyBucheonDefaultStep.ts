import {AbstractStep} from "../../../../step/AbstractStep";
import {Page} from "playwright-core";
import {parseDate} from "../../../../../utils/DateUtils";
import {Category} from "../../../../Category";

export class OnlyBucheonDefaultStep extends AbstractStep {

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

        await page.waitForSelector('.row:not(.head)', {
            state: 'attached'
        });

        // 모든 카드 요소 가져오기
        const cards = await page.locator('.row:not(.head)').all();

        const list = [];
        // 각 카드에서 제목과 버튼 찾기
        for (const card of cards) {
            const classList = await card.locator('.cell').first().getAttribute('class');
            if (classList && classList.includes('empty')) {
                return null;
            }

            const id = (await card.locator('.cell').first().textContent()).trim();
            const title = (await card.locator('.title .tit').textContent()).trim();
            const createdAt : Date = parseDate((await card.locator('.date').textContent()).trim());
            const link = this.parseOnclick(await card.locator('.tit_cont').getAttribute('onclick'));

            list.push({
                'id' : Number(id),
                'title' : title,
                'createdAt' : createdAt,
                'link' : link,
            })
        }

        return {[this.category] : list};
    }


    private parseOnclick(onclickStr: string): string | null {
        if (!onclickStr) return null;

        // 정규식으로 파라미터 추출
        const match = onclickStr.match(/opView\('([^']+)',\s*'([^']+)',\s*'([^']+)'\)/);

        if (match) {
            return this.parseToLink(match[1], match[2], match[3]);
        }

        return null;
    }
}