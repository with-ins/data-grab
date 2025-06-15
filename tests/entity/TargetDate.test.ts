import { TargetDate } from '../../src/entity/TargetDate';
import { ValidationError } from '../../src/errors/AppError';

describe('TargetDate', () => {
    describe('getter properties', () => {
        const targetDate = TargetDate.from('2024-03-15');

        it('dateObject 프로퍼티가 올바른 Date 객체를 반환한다', () => {
            const dateObj = targetDate.dateObject;
            expect(dateObj).toBeInstanceOf(Date);
            expect(dateObj.getFullYear()).toBe(2024);
            expect(dateObj.getMonth()).toBe(2); // 0-based
            expect(dateObj.getDate()).toBe(15);
        });

        it('year, month, day 프로퍼티가 올바른 값을 반환한다', () => {
            expect(targetDate.year).toBe(2024);
            expect(targetDate.month).toBe(3); // 1-based
            expect(targetDate.day).toBe(15);
        });
    });

    describe('format methods', () => {
        const targetDate = TargetDate.from('2024-03-15');

        it('toS3PathFormat이 올바른 형식을 반환한다', () => {
            expect(targetDate.toS3PathFormat()).toBe('2024/03/15');
        });

        it('toFileNameFormat이 올바른 형식을 반환한다', () => {
            expect(targetDate.toFileNameFormat()).toBe('2024-03-15');
        });
    });

    describe('comparison methods', () => {
        const date1 = TargetDate.from('2024-03-15');
        const date2 = TargetDate.from('2024-03-15');
        const date3 = TargetDate.from('2024-03-16');

        it('isEqualOrAfterDateOnly 메서드가 올바르게 작동한다', () => {
            expect(date1.isEqualOrAfterDateOnly(date2)).toBe(true);
            expect(date1.isEqualOrAfterDateOnly(date3)).toBe(false);
        });
    });
}); 