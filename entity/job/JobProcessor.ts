import {Job} from "./Job";
import {오정노인복지기관} from "./implement/bucheon/부천시노인복지기관포털/오정노인복지관";
import {원미노인복지관} from "./implement/bucheon/부천시노인복지기관포털/원미노인복지관";
import {소사노인복지관} from "./implement/bucheon/부천시노인복지기관포털/소사노인복지관";
import {부천시니어클럽} from "./implement/bucheon/부천시노인복지기관포털/부천시니어클럽";
import {소사본종합사회복지관} from "./implement/bucheon/부천종합사회복지관포털/소사본종합사회복지관";
import {상동종합사회복지관} from "./implement/bucheon/부천종합사회복지관포털/상동종합사회복지관";
import {대산종합사회복지관} from "./implement/bucheon/부천종합사회복지관포털/대산종합사회복지관";
import {춘의종합사회복지관} from "./implement/bucheon/부천종합사회복지관포털/춘의종합사회복지관";
import {심곡동종합사회복지관} from "./implement/bucheon/부천종합사회복지관포털/심곡동종합사회복지관";
import {인천종합사회복지관} from "./implement/incheon/인천종합사회복지관";
import {인천광역시장애인종합복지관} from "./implement/incheon/인천광역시장애인종합복지관";
import {미추홀장애인종합복지관} from "./implement/incheon/미추홀장애인종합복지관";
import {서울시사회복지사협회} from "./implement/seoul/서울시사회복지사협회";
import {인천광역시사회복지사협회} from "./implement/incheon/인천광역시사회복지사협회";


export class JobProcessor {
    jobs: Job[] = [
        new 오정노인복지기관(), new 원미노인복지관(), new 소사노인복지관(), new 부천시니어클럽(),
        new 소사본종합사회복지관(), new 상동종합사회복지관(), new 대산종합사회복지관(), new 춘의종합사회복지관(), new 심곡동종합사회복지관(),
        new 인천종합사회복지관(),
        new 인천광역시장애인종합복지관(),
        new 인천광역시사회복지사협회(),
        new 미추홀장애인종합복지관(),
        new 서울시사회복지사협회(),
    ];

    // Symbol.iterator 구현
    *[Symbol.iterator]() {
        for (const job of this.jobs) {
            yield job;
        }
    }

}