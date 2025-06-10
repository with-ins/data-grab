import {Job} from "./Job";
import {오정노인복지기관} from "./implement/gyeonggi/bucheon/부천시노인복지기관포털/오정노인복지관";
import {원미노인복지관} from "./implement/gyeonggi/bucheon/부천시노인복지기관포털/원미노인복지관";
import {소사노인복지관} from "./implement/gyeonggi/bucheon/부천시노인복지기관포털/소사노인복지관";
import {부천시니어클럽} from "./implement/gyeonggi/bucheon/부천시노인복지기관포털/부천시니어클럽";
import {소사본종합사회복지관} from "./implement/gyeonggi/bucheon/부천종합사회복지관포털/소사본종합사회복지관";
import {상동종합사회복지관} from "./implement/gyeonggi/bucheon/부천종합사회복지관포털/상동종합사회복지관";
import {대산종합사회복지관} from "./implement/gyeonggi/bucheon/부천종합사회복지관포털/대산종합사회복지관";
import {춘의종합사회복지관} from "./implement/gyeonggi/bucheon/부천종합사회복지관포털/춘의종합사회복지관";
import {심곡동종합사회복지관} from "./implement/gyeonggi/bucheon/부천종합사회복지관포털/심곡동종합사회복지관";
import {인천종합사회복지관} from "./implement/incheon/인천종합사회복지관";
import {인천광역시장애인종합복지관} from "./implement/incheon/인천광역시장애인종합복지관";
import {미추홀장애인종합복지관} from "./implement/incheon/미추홀장애인종합복지관";
import {서울시사회복지사협회} from "./implement/seoul/서울시사회복지사협회";
import {인천광역시사회복지사협회} from "./implement/incheon/인천광역시사회복지사협회";
import {경기도사회복지사협회} from "./implement/gyeonggi/경기도사회복지사협회";
import {한국노인인력개발원} from "./implement/한국노인인력개발원";
import {대한의료사회복지사협회} from "./implement/대한의료사회복지사협회";

export class JobProcessor {
    jobs: Job[] = [
        new 대한의료사회복지사협회(),
        new 한국노인인력개발원(),
        new 경기도사회복지사협회(),
        new 오정노인복지기관(), new 원미노인복지관(), new 소사노인복지관(), new 부천시니어클럽(),
        new 소사본종합사회복지관(), new 상동종합사회복지관(), new 대산종합사회복지관(), new 춘의종합사회복지관(), new 심곡동종합사회복지관(),
        new 인천종합사회복지관(),
        new 인천광역시장애인종합복지관(),
        new 인천광역시사회복지사협회(),
        new 미추홀장애인종합복지관(),
        new 서울시사회복지사협회(),
    ];
    results: Record<string, any> = {
        'data': {},
        'complete': [],
    };
    syncDates : Record<string, string> = {};
    private defaultSyncDate: string = '';

    setSyncDate(targetDate: string) {
        this.defaultSyncDate = targetDate;
        // 모든 job에 대해 동일한 syncDate 설정
        this.jobs.forEach(job => {
            this.syncDates[job.jobName] = targetDate;
        });
    }

    // Symbol.iterator 구현
    *[Symbol.iterator]() {
        for (const job of this.jobs) {
            yield job;
        }
    }
}