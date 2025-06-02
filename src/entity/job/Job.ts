import {Page} from "@playwright/test";


export interface Job {

    jobName: string;

    /**
     * 예상 데이터 구조
     * {
     *    '오정노인복지기관' : {
     *         'notice' : [...],
     *         'recruit : [...],
     *         ...
     *     }
     * }
     * 단일 구조임
     */
    run(page: Page, syncDate: Date): Promise<Record<string, any[]>>;

}