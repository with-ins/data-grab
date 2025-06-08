import {Page} from "playwright-core";


export interface Step {

    /**
     * 공지사항 : notice
     * 채용 : recruit
     * ...
     *
     * {
     *      'notice' : [...],
     * }
     */
    run: (page: Page, syncDate: Date, baseUrl: string) => Promise<Record<string, any[]>>;
}