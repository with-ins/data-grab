import {Page, test} from '@playwright/test';
import {FileManager} from "../entity/component/FileManager";
import {JobProcessor} from "../entity/job/JobProcessor";


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

const processor = new JobProcessor();

test.describe('withIns 크롤링', () => {

    // // 병렬 실행 비활성화
    // test.describe.configure({ mode: 'serial' });
    for (const job of processor) {
        test(job.jobName, async ({ page }) => {
            await optimizeBlocking(page);
            const result = await job.run(page);
            FileManager.save(result);
        });
    }

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
