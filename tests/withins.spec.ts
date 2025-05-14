import { test } from '@playwright/test';
import {오정노인복지기관} from "../entity/job/부천시노인복지기관포털/오정노인복지관";
import {원미노인복지관} from "../entity/job/부천시노인복지기관포털/원미노인복지관";
import {소사노인복지관} from "../entity/job/부천시노인복지기관포털/소사노인복지관";
import {Job} from "../entity/job/Job";
import {부천시니어클럽} from "../entity/job/부천시노인복지기관포털/부천시니어클럽";
import {FileManager} from "../entity/component/FileManager";


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
    new 오정노인복지기관(),
    new 원미노인복지관(),
    new 소사노인복지관(),
    new 부천시니어클럽()
]
test.describe('Job 실행 테스트', () => {

    // // 병렬 실행 비활성화 (중요!)
    // test.describe.configure({ mode: 'serial' });
    jobs.forEach((job: Job, index: number) => {
        test(`Started ${index}`, async ({ page }) => {
            job.sync();
            const result = await job.run(page);
            job.lastModifiedSync()
            FileManager.save(result);
        });
    });

});
