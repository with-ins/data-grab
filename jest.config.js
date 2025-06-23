module.exports = {
  preset: 'ts-jest', // TypeScript 지원 프리셋
  testEnvironment: 'node', // Node.js 환경에서 테스트 실행
  testMatch: ['**/*.test.ts'], // 테스트 파일 패턴
  collectCoverageFrom: ['src/**/*.ts'], // 커버리지 수집 대상
}; 