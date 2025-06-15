import { ValidationError } from '../errors/AppError';

/**
 * 크롤링 대상 날짜를 나타내는 Value Object
 * YYYY-MM-DD 형식의 문자열을 안전하게 처리합니다.
 */
export class TargetDate {
    private readonly _value: string;
    private readonly _dateObject: Date;

    private constructor(value: string) {
        this._value = value;
        this._dateObject = this.parseToDate(value);
    }

    static from(dateString: string): TargetDate {
        return new TargetDate(dateString);
    }

    static fromDate(date: Date): TargetDate {
        const dateString = date.toISOString().split('T')[0];
        return new TargetDate(dateString);
    }

    /**
     * YYYY-MM-DD 형식 문자열 반환
     */
    get value(): string {
        return this._value;
    }

    /**
     * Date 객체 반환
     */
    get dateObject(): Date {
        return new Date(this._dateObject);
    }

    /**
     * 연도 반환
     */
    get year(): number {
        return this._dateObject.getFullYear();
    }

    /**
     * 월 반환 (1-12)
     */
    get month(): number {
        return this._dateObject.getMonth() + 1;
    }

    /**
     * 일 반환
     */
    get day(): number {
        return this._dateObject.getDate();
    }

    /**
     * S3 파일 경로용 형식 반환 (YYYY/MM/DD)
     */
    toS3PathFormat(): string {
        return this._value.replace(/-/g, '/');
    }

    /**
     * 파일명에 안전한 형식으로 변환 (YYYY-MM-DD)
     */
    toFileNameFormat(): string {
        return this._value;
    }

    /**
     * 다른 TargetDate와 같거나 이후인지 비교 (시간 부분 무시)
     * @param other 비교할 TargetDate 객체
     * @returns this가 other와 같거나 이후 날짜인 경우 true
     */
    isEqualOrAfterDateOnly(other: TargetDate | null): boolean {
        if (!other) return false;

        const base = new Date(this._dateObject);
        const compare = new Date(other._dateObject);
        base.setHours(0, 0, 0, 0);
        compare.setHours(0, 0, 0, 0);
        
        return base >= compare;
    }

    private parseToDate(dateString: string): Date {
        const [year, month, day] = dateString.split('-').map(Number);
        return new Date(year, month - 1, day);
    }
}
