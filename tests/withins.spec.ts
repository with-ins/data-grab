import {Page, test} from '@playwright/test';
import {오정노인복지기관} from "../entity/job/implement/bucheon/부천시노인복지기관포털/오정노인복지관";
import {원미노인복지관} from "../entity/job/implement/bucheon/부천시노인복지기관포털/원미노인복지관";
import {소사노인복지관} from "../entity/job/implement/bucheon/부천시노인복지기관포털/소사노인복지관";
import {Job} from "../entity/job/Job";
import {부천시니어클럽} from "../entity/job/implement/bucheon/부천시노인복지기관포털/부천시니어클럽";
import {FileManager} from "../entity/component/FileManager";
import {인천종합사회복지관} from "../entity/job/implement/incheon/인천종합사회복지관";
import {서울시사회복지사협회} from "../entity/job/implement/seoul/서울시사회복지사협회";
import {인천광역시장애인종합복지관} from "../entity/job/implement/incheon/인천광역시장애인종합복지관";
import {소사본종합사회복지관} from "../entity/job/implement/bucheon/부천종합사회복지관포털/소사본종합사회복지관";
import {상동종합사회복지관} from "../entity/job/implement/bucheon/부천종합사회복지관포털/상동종합사회복지관";
import {대산종합사회복지관} from "../entity/job/implement/bucheon/부천종합사회복지관포털/대산종합사회복지관";
import {춘의종합사회복지관} from "../entity/job/implement/bucheon/부천종합사회복지관포털/춘의종합사회복지관";
import {심곡동종합사회복지관} from "../entity/job/implement/bucheon/부천종합사회복지관포털/심곡동종합사회복지관";
import {미추홀장애인종합복지관} from "../entity/job/implement/incheon/미추홀장애인종합복지관";


/**
 * 예상 데이터 구조
 * {
 *     '오정노인복지기관' : {
 *         'notice' : [...],
 *         'recruit : [...],
 *         ...
 *     },
 *     '원미노인복지기관' : {
 *         'notice' : [...],
 *         'recruit : [...],
 *     }
 * }
 */

const jobs : Job[] = [
    new 오정노인복지기관(), new 원미노인복지관(), new 소사노인복지관(), new 부천시니어클럽(),
    new 소사본종합사회복지관(), new 상동종합사회복지관(), new 대산종합사회복지관(), new 춘의종합사회복지관(), new 심곡동종합사회복지관(),
    new 인천종합사회복지관(),
    new 인천광역시장애인종합복지관(),
    new 미추홀장애인종합복지관(),
    new 서울시사회복지사협회(),
]
test.describe('withIns 크롤링', () => {

    // // 병렬 실행 비활성화
    // test.describe.configure({ mode: 'serial' });
    jobs.forEach((job: Job, index: number) => {
        test(job.jobName, async ({ page }) => {
            await optimizeBlocking(page);
            job.sync();
            const result = await job.run(page);
            job.lastModifiedSync()
            FileManager.save(result);
        });
    });

});

async function optimizeBlocking(page: Page) {
    await page.route('**/*.css', route => route.abort());
    await page.route('**/*.png', route => route.abort());
    await page.route('**/*.jpg', route => route.abort());
    await page.route('**/*.jpeg', route => route.abort());
    await page.route('**/*.gif', route => route.abort());
    await page.route('**/*.svg', route => route.abort());
    await page.route('**/*.woff', route => route.abort());
    await page.route('**/*.woff2', route => route.abort());
}
