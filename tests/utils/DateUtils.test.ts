import { getKoreaTimeISO, parseDate, isEqualOrAfterDateOnly } from '../../src/utils/DateUtils';

describe('DateUtils', () => {
    describe('getKoreaTimeISO', () => {
        it('ISO 형식과 한국 시간대 확인', () => {
            const result = getKoreaTimeISO();
            
            // ISO 형식 검증 (YYYY-MM-DDTHH:mm:ss+09:00)
            expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+09:00$/);
            
            // 한국 시간대 검증
            const date = new Date(result);
            const koreaOffset = date.getTimezoneOffset();
            expect(koreaOffset).toBe(-540); // UTC+9 (9 * 60 = 540 minutes)
        });
    });

    describe('parseDate', () => {
        it.each([
            {
                name: '기본 구분자(-) 사용',
                dateString: '2024-01-01',
                separator: undefined,
                expected: {
                    year: 2024,
                    month: 0,  // 0-based month
                    date: 1
                }
            },
            {
                name: '커스텀 구분자(/) 사용',
                dateString: '2024/01/01',
                separator: '/',
                expected: {
                    year: 2024,
                    month: 0,
                    date: 1
                }
            }
        ])('구분자를 사용해서 문자열을 파싱한다', ({ dateString, separator, expected }) => {
            const result = parseDate(dateString, separator);
            expect(result.getFullYear()).toBe(expected.year);
            expect(result.getMonth()).toBe(expected.month);
            expect(result.getDate()).toBe(expected.date);
        });
    });

    describe('isEqualOrAfterDateOnly', () => {
        describe('예외 케이스', () => {
            it.each([
                {
                    name: 'null 값 처리',
                    baseDate: new Date('2024-03-20T10:00:00'),
                    compareDate: null,
                    expected: false
                },
                {
                    name: 'undefined 값 처리',
                    baseDate: new Date('2024-03-20T10:00:00'),
                    compareDate: undefined as any,
                    expected: false
                },
                {
                    name: '잘못된 날짜 형식 처리',
                    baseDate: new Date('2024-03-20T10:00:00'),
                    compareDate: new Date('invalid-date'),
                    expected: false
                }
            ])('예외 상황 처리 - $name', ({ baseDate, compareDate, expected }) => {
                expect(isEqualOrAfterDateOnly(baseDate, compareDate)).toBe(expected);
            });
        });

        describe('일반 케이스', () => {
            it.each([
                {
                    name: '같은 날짜 다른 시간',
                    baseDate: new Date('2024-03-20T10:00:00'),
                    compareDate: new Date('2024-03-20T15:30:00'),
                    expected: true
                },
                {
                    name: '기준 날짜가 비교 날짜보다 이후',
                    baseDate: new Date(2024, 0, 2),  // 2024-01-02
                    compareDate: new Date(2024, 0, 1),  // 2024-01-01
                    expected: true
                },
                {
                    name: '기준 날짜가 비교 날짜보다 이전',
                    baseDate: new Date(2024, 0, 1),  // 2024-01-01
                    compareDate: new Date(2024, 0, 2),  // 2024-01-02
                    expected: false
                },
                {
                    name: '다른 시간대의 같은 날짜 (UTC vs KST)',
                    baseDate: new Date('2024-03-20T00:00:00Z'),
                    compareDate: new Date('2024-03-20T09:00:00+09:00'),
                    expected: true
                }
            ])('기준 날짜가 비교 날짜보다 이후인지 확인한다', ({ baseDate, compareDate, expected }) => {
                expect(isEqualOrAfterDateOnly(baseDate, compareDate)).toBe(expected);
            });
        });
    });
}); 