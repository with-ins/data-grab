import {test} from '@playwright/test';
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

test.describe('크롤링',  () => {
    processor.loadFetchSync();
    for (const job of processor) {
        test(job.jobName, async ({ page }) => {
            await processor.runner(page, job)
        });
    }
});



