import { Job } from "./Job";
import { 대한의료사회복지사협회 } from "./implement/대한의료사회복지사협회";
import { 한국노인인력개발원 } from "./implement/한국노인인력개발원";
import { 경기도사회복지사협회 } from "./implement/gyeonggi/경기도사회복지사협회";
import { 오정노인복지기관 } from "./implement/gyeonggi/bucheon/부천시노인복지기관포털/오정노인복지관";
import { 원미노인복지관 } from "./implement/gyeonggi/bucheon/부천시노인복지기관포털/원미노인복지관";
import { 소사노인복지관 } from "./implement/gyeonggi/bucheon/부천시노인복지기관포털/소사노인복지관";
import { 부천시니어클럽 } from "./implement/gyeonggi/bucheon/부천시노인복지기관포털/부천시니어클럽";
import { 소사본종합사회복지관 } from "./implement/gyeonggi/bucheon/부천종합사회복지관포털/소사본종합사회복지관";
import { 상동종합사회복지관 } from "./implement/gyeonggi/bucheon/부천종합사회복지관포털/상동종합사회복지관";
import { 대산종합사회복지관 } from "./implement/gyeonggi/bucheon/부천종합사회복지관포털/대산종합사회복지관";
import { 춘의종합사회복지관 } from "./implement/gyeonggi/bucheon/부천종합사회복지관포털/춘의종합사회복지관";
import { 심곡동종합사회복지관 } from "./implement/gyeonggi/bucheon/부천종합사회복지관포털/심곡동종합사회복지관";
import { 인천종합사회복지관 } from "./implement/incheon/인천종합사회복지관";
import { 인천광역시장애인종합복지관 } from "./implement/incheon/인천광역시장애인종합복지관";
import { 인천광역시사회복지사협회 } from "./implement/incheon/인천광역시사회복지사협회";
import { 미추홀장애인종합복지관 } from "./implement/incheon/미추홀장애인종합복지관";
import { 서울시사회복지사협회 } from "./implement/seoul/서울시사회복지사협회";

/**
 * 모든 크롤링 Job들을 등록하고 관리하는 Registry 클래스
 */
export class JobRegistry {
    private static readonly jobs: Job[] = [
        new 대한의료사회복지사협회(),
        new 한국노인인력개발원(),
        new 경기도사회복지사협회(),
        new 오정노인복지기관(),
        new 원미노인복지관(),
        new 소사노인복지관(),
        new 부천시니어클럽(),
        new 소사본종합사회복지관(),
        new 상동종합사회복지관(),
        new 대산종합사회복지관(),
        new 춘의종합사회복지관(),
        new 심곡동종합사회복지관(),
        new 인천종합사회복지관(),
        new 인천광역시장애인종합복지관(),
        new 인천광역시사회복지사협회(),
        new 미추홀장애인종합복지관(),
        new 서울시사회복지사협회(),
    ];

    static getAllJobs(): Job[] {
        return [...this.jobs]; // 방어적 복사
    }

    static getJobByName(jobName: string): Job | undefined {
        return this.jobs.find(job => job.jobName === jobName);
    }

    static getJobNames(): string[] {
        return this.jobs.map(job => job.jobName);
    }

    static getJobCount(): number {
        return this.jobs.length;
    }

    static hasJob(jobName: string): boolean {
        return this.jobs.some(job => job.jobName === jobName);
    }
}
