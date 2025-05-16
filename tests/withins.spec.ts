import {test} from '@playwright/test';
import {FileManager} from "../src/entity/component/FileManager";
import {JobProcessor} from "../src/entity/job/JobProcessor";


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

    for (const job of processor) {
        test(job.jobName, async ({ page }) => {
            const result = await job.run(page);
            FileManager.save(result);
        });
    }

});


