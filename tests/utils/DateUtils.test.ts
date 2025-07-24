import { getKoreaTimeISO, parseKoreaDate, isEqualOrAfterDateOnly } from '../../src/utils/DateUtils';

describe('DateUtils', () => {
    describe('getKoreaTimeISO', () => {
        it('ISO 형식과 한국 시간대 확인', () => {
            //given
            const result = getKoreaTimeISO();
            
            //when then
            // ISO 형식 검증 (YYYY-MM-DDTHH:mm:ss+09:00)
            expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+09:00$/);
        });
    });

    describe('parseKoreaDate', () => {
        describe('기본 파싱 동작', () => {
            it.each([
                {
                    name: '기본 구분자(-) 사용',
                    dateString: '2024-01-15',
                    separator: undefined,
                    expected: {
                        year: 2024,
                        month: 0,  // 0-based month
                        date: 15
                    }
                },
                {
                    name: '커스텀 구분자(/) 사용',
                    dateString: '2024/03/20',
                    separator: '/',
                    expected: {
                        year: 2024,
                        month: 2,
                        date: 20
                    }
                }
            ])('$name - 날짜를 올바르게 파싱한다', ({ dateString, separator, expected }) => {
                const result = parseKoreaDate(dateString, separator);
                
                // 한국 시간대로 날짜 컴포넌트 확인
                const koreanDate = new Date(result.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
                
                expect(koreanDate.getFullYear()).toBe(expected.year);
                expect(koreanDate.getMonth()).toBe(expected.month);
                expect(koreanDate.getDate()).toBe(expected.date);
            });
        });

        describe('한국 시간대 적용 검증', () => {
            it('한국 시간대(+09:00)가 적용된 Date 객체를 반환한다', () => {
                // given when
                const result = parseKoreaDate('2024-06-15');
                //then
                const isoString = result.toISOString();

                expect(result).toBeInstanceOf(Date);
                
                // 한국 시간대로 날짜 컴포넌트 확인
                const koreanDate = new Date(result.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
                expect(koreanDate.getFullYear()).toBe(2024);
                expect(koreanDate.getMonth()).toBe(5); // June (0-based)
                expect(koreanDate.getDate()).toBe(15);
            });

            it('한국 시간대로 포맷된 날짜 문자열을 확인한다', () => {
                const result = parseKoreaDate('2024-06-15');
                
                // 한국 로케일로 포맷했을 때의 결과 확인
                const koreaDateString = result.toLocaleString('ko-KR', {
                    timeZone: 'Asia/Seoul',
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                });
                
                // 최소한 올바른 날짜가 포함되어 있는지 확인
                expect(koreaDateString).toContain('2024');
                expect(koreaDateString).toContain('06');
                expect(koreaDateString).toContain('15');
            });
        });

        describe('실제 시간대 동작 검증', () => {
            it('UTC 시간과의 차이를 확인한다', () => {
                // given when
                const result = parseKoreaDate('2024-06-15');
                // then
                // 같은 날짜의 UTC Date와 비교
                const utcDate = new Date(Date.UTC(2024, 5, 15)); // June 15, 2024 UTC
                
                // 시간 차이 확인
                const timeDiff = Math.abs(result.getTime() - utcDate.getTime());
                
                const expectedDiff = 9 * 60 * 60 * 1000; // 9시간을 밀리초로 변환
                expect(timeDiff).toBe(expectedDiff);
            });
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