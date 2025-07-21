import { classifyCategory } from '../../src/utils/CategoryClassifier';
import { Category } from '../../src/entity/Category';

describe('CategoryClassifier', () => {
    describe('classifyCategory', () => {
        it('부분 문자열로 매칭된다', () => {
            expect(classifyCategory('신입채용공고')).toBe(Category.RECRUIT);
            expect(classifyCategory('경력채용')).toBe(Category.RECRUIT);
            expect(classifyCategory('채용면접')).toBe(Category.RECRUIT);
        });

        it('null과 빈 문자열은 null을 반환한다', () => {
            expect(classifyCategory('')).toBeNull();
            expect(classifyCategory(null as any)).toBeNull();
            expect(classifyCategory(undefined as any)).toBeNull();
            expect(classifyCategory('   ')).toBeNull(); // 공백만 있는 경우
        });

        it('키워드가 없으면 null을 반환한다', () => {
            expect(classifyCategory('일반 공지사항입니다')).toBeNull();
            expect(classifyCategory('시설 이용 안내')).toBeNull();
            expect(classifyCategory('연락처 변경 알림')).toBeNull();
        });
    });
}); 