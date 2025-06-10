import {AbstractJob} from "../../AbstractJob";
import {SimpleTemplateStep} from "../../../step/SimpleTemplateStep";
import {Locator} from "playwright-core";
import {Category} from "../../../Category";
import {DateUtils} from "../../../../utils/DateUtils";
import {Optimize, Optimizer} from "../../../Optimize";

export class 인천광역시장애인종합복지관 extends AbstractJob {

    constructor() {
        super(
            '인천광역시장애인종합복지관',
            'https://icjb.or.kr',
            [
                new 인천공지사항(),
                new 인천이벤트(),
                new 인천채용(),
            ]
        );
    }

    registerOptimizer(optimizer: Optimizer) {
        optimizer.register(Optimize.JS)
    }
}
class 인천채용 extends SimpleTemplateStep {


    constructor() {
        super(
            'https://icjb.or.kr/bbs/board.php?bo_table=bbs_0403',
            '.list-item',
            Category.RECRUIT
        );
    }

    async select(card: Locator, baseUrl: string): Promise<object> {
        const id = (await card.locator('.wr-num').textContent()).trim();
        const title = (await card.locator('.wr-subject a').textContent()).trim()
        const link = await card.locator('.wr-subject a').getAttribute('href');

        let dateStr = (await card.locator('.wr-date').textContent()).trim();

        const createdAt = DateUtils.parseDate(this.getStartDate(dateStr));

        return {
            'id' : parseInt(id),
            'title' : title,
            'createdAt' : createdAt,
            'link' : link,
        }
    }

    getStartDate(dateStr: string): string {
        const match = dateStr?.match(/시작:\s*(\d{4}-\d{2}-\d{2})/);
        return match ? match[1] : '';
    }

}
class 인천이벤트 extends SimpleTemplateStep {
    constructor() {
        super(
            'https://icjb.or.kr/bbs/board.php?bo_table=bbs_0402',
            '.media.list-media',
            Category.NOTICE
        );
    }
    async select(card: Locator, baseUrl: string): Promise<object> {

        const a = card.locator('.media-heading a')

        const title = this.removeLeadingKeywords((await a.textContent()).trim()).trim();
        const link = await a.getAttribute('href');
        const urlParams = new URLSearchParams(link);
        const id = urlParams.get('wr_id');

        const dateBeforeConvert = (await card.locator('.list-details .hidden-xs').textContent()).replace('|', '').trim();
        const createdAt = this.convertToDateFormat(dateBeforeConvert);

        return {
            'id' : parseInt(id),
            'title' : title,
            'createdAt' : createdAt,
            'link' : link,
        }
    }
    removeLeadingKeywords(text: string): string {
        if (text.startsWith('새글') || text.startsWith('인기')) {
            return text.slice(2);
        }
        return text;
    }

    convertToDateFormat(timeString: string): Date {
        // 이미 yyyy.MM.dd 형식이면 그대로 반환
        if (/^\d{4}\.\d{2}\.\d{2}$/.test(timeString)) {
            return DateUtils.parseDate(timeString, '.');
        }

        const now = new Date();
        const patterns = {
            초: (n: number) => new Date(now.getTime() - n * 1000),
            분: (n: number) => new Date(now.getTime() - n * 60 * 1000),
            시간: (n: number) => new Date(now.getTime() - n * 60 * 60 * 1000),
            일: (n: number) => new Date(now.getTime() - n * 24 * 60 * 60 * 1000)
        };

        const match = timeString.match(/^(\d+)(초|분|시간|일)전$/);
        if (match) {
            const [, num, unit] = match;
            const converter = patterns[unit as keyof typeof patterns];
            if (converter) {
                return converter(parseInt(num));
            }
        }

        return DateUtils.parseDate(timeString, '.');
    }
}
class 인천공지사항 extends SimpleTemplateStep {

    constructor() {
        super(
            'https://icjb.or.kr/bbs/board.php?bo_table=bbs_0401',
            '.list-item:not(.bg-light)',
            Category.NOTICE
        );
    }

    async select(card: Locator, baseUrl: string): Promise<object> {

        const id = (await card.locator('.wr-num').textContent()).trim();
        const title = (await card.locator('.wr-subject a').textContent()).trim()
        const link = await card.locator('.wr-subject a').getAttribute('href');

        let createdAt = null;
        // 원래 05.13 이렇게 날짜가 나오지만 오늘나온경우 시간(14:36 형식으로 나옴) 인지 확인
        if (await card.locator('.wr-date .orangered').count() > 0) {
            // 시간이 표시된 경우에는 오늘날짜를 가리킴
            createdAt = new Date();
        } else {
            let createdAtStr = (await card.locator('.wr-date').textContent()).trim() // 05.01
            createdAtStr = this.inferYearFromDate(createdAtStr) // 2025.05.01
            createdAt = DateUtils.parseDate(createdAtStr, '.')
        }

        return {
            'id' : parseInt(id),
            'title' : title,
            'createdAt' : createdAt,
            'link' : link,
        }
    }

    private inferYearFromDate(monthDay: string): string {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;
        const [month, day] = monthDay.split('.').map(Number);

        // 현재 월과 비교해서 연도 추정
        if (month > currentMonth + 3 || (month <= 3 && currentMonth >= 10)) {
            // 크게 미래 월이거나 연말-연초 전환 → 작년
            return `${currentYear - 1}.${monthDay}`;
        } else if (month < currentMonth - 6) {
            // 크게 과거 월 → 내년 (매우 드문 경우)
            return `${currentYear + 1}.${monthDay}`;
        }

        // 기본값: 현재 년도
        return `${currentYear}.${monthDay}`;
    }

}