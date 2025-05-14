import { test } from '@playwright/test';
import {오정노인복지기관} from "../entity/job/오정노인복지관";
import {원미노인복지관} from "../entity/job/원미노인복지관";
import {Job} from "../entity/job/Job";

const jobs : Job[] = [
    new 오정노인복지기관(),
    new 원미노인복지관(),
]

let map = {};

test.describe('Job 실행 테스트', () => {
    let map: Record<string, any> = {};

    // 병렬 실행 비활성화 (중요!)
    test.describe.configure({ mode: 'serial' });

    jobs.forEach((job: Job) => {
        test('Started', async ({ page }) => {
            await job.sync(new Date()); // 테스트 내부로 이동
            const result = await job.run(page);
            map = { ...map, ...result };
        });
    });

    test.afterAll(async () => {
        console.log('afterAll 실행됨', new Date().toISOString());
        console.log('최종 map:', map);
    });
});

// jobs.forEach(async (job: AbstractJob) => {
//     await job.sync(new Date());
//     test(`${job.jobName} : Started`, async ({ page }) => {
//         let object = await job.run(page);
//         map = {...map, ...object};
//     });
// })

test.afterAll(async () => {
    console.log(map);
})

