import {AbstractJob} from "./AbstractJob";
import {Page} from "@playwright/test";
import {Step} from "../step/Step";
import {SyncManager} from "./SyncManager";

export class 원미노인복지관 extends AbstractJob {

    constructor() {
        super(
            '원미노인복지관',
            'https://senior.bucheon4u.kr/',
            [
                new NoticeStep()
            ]);
    }
}

class NoticeStep implements Step {

    async run(page: Page, syncDate : Date, baseUrl: string): Promise<object> {
        await page.goto('https://senior.bucheon4u.kr/senior/user/bbs/BD_selectBbsList.do?q_bbsCode=1005&q_domnCode=2&q_estnColumn1=0110304&q_searchTy=&q_searchVal=&q_currPage=1&q_sortName=&q_sortOrder=');

        await page.waitForSelector('.row:not(.head)');

        // 모든 카드 요소 가져오기
        const cards = await page.locator('.row:not(.head)').all();

        const list = [];
        // 각 카드에서 제목과 버튼 찾기
        for (const card of cards) {
            const id = (await card.locator('.cell').first().textContent()).trim();
            const title = (await card.locator('.title .tit').textContent()).trim();
            const createAt = SyncManager.parseDate((await card.locator('.date').textContent()).trim());
            const link = this.parseOnclick(await card.locator('.tit_cont').getAttribute('onclick'));


            if (!NoticeStep.isDateAfterOrEqualToday(syncDate, createAt)) {
                console.log(`id : ${id}, 제목 : ${title}, 생성일 : ${createAt} 은 이미 등록되어있습니다.`);
                continue;
            }

            console.log(`id : ${id}, 제목 : ${title}, 생성일 : ${createAt}, 링크: ${link}`);

            list.push({
                'id' : Number(id),
                'title' : title,
                'createAt' : createAt,
                'link' : link,
            })
        }
        return {'원미노인복지관' : list};
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

    static isDateAfterOrEqualToday(syncDate: Date, date: Date): boolean {
        if (!date) return false;

        // 오늘 날짜 (시간 제외)
        syncDate.setHours(0, 0, 0, 0);

        // 비교할 날짜 (시간 제외)
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);

        return targetDate >= syncDate;
    }

}