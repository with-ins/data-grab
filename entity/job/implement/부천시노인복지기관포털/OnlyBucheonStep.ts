import {AbstractStep} from "../../../step/AbstractStep";
import {Page} from "@playwright/test";
import {SyncManager} from "../../../component/SyncManager";
import {Category} from "../../../Category";

export class OnlyBucheonDefaultStep extends AbstractStep {

    private readonly category : Category;
    private readonly url : string;

    constructor(category: Category, url : string) {
        super();
        this.category = category;
        this.url = url;
    }
    async execute(page: Page, baseUrl: string): Promise<Record<string, any[]>> {
        await page.goto(this.url);

        await page.waitForSelector('.row:not(.head)');

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
            const createAt : Date = SyncManager.parseDate((await card.locator('.date').textContent()).trim());
            const link = this.parseOnclick(await card.locator('.tit_cont').getAttribute('onclick'));

            list.push({
                'id' : Number(id),
                'title' : title,
                'createAt' : createAt,
                'link' : link,
            })
        }

        return {[this.category] : list};
    }


    parseOnclick(onclickStr: string): string | null {
        if (!onclickStr) return null;

        // 정규식으로 파라미터 추출
        const match = onclickStr.match(/opView\('([^']+)',\s*'([^']+)',\s*'([^']+)'\)/);

        if (match) {
            return `https://senior.bucheon4u.kr/senior/user/bbs/BD_selectBbs.do?q_domnCode=${match[1]}&q_bbsCode=${match[2]}&q_bbscttSn=${match[3]}`;
        }

        return null;
    }
}