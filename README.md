# 🕷️ Data Grab - 사회복지기관 크롤링 시스템

AWS Lambda 기반의 사회복지기관 공지사항, 채용정보, 복지서비스 정보를 자동으로 수집하는 크롤링 시스템입니다.

## 📋 **프로젝트 개요**

이 시스템은 Playwright를 사용하여 전국의 주요 사회복지기관 웹사이트에서 최신 정보를 수집하고, AWS S3에 JSON 형태로 저장하는 서버리스 크롤링 솔루션입니다.

### **주요 기능**
- 🏢 **17개 사회복지기관** 크롤링 지원
- 📅 **날짜 기반 필터링** (syncDate 이후 게시물만 수집)
- 📊 **카테고리별 분류** (공지사항, 채용, 복지서비스, 행사)
- ☁️ **AWS Lambda 서버리스** 실행
- 💾 **S3 자동 업로드** 및 저장
- 🧪 **로컬 테스트 환경** 지원 (Docker)

## 🏢 **지원 기관 목록**

### **전국 단위**
- 대한의료사회복지사협회
- 한국노인인력개발원

### **경기도**
- 경기도사회복지사협회

**부천시 노인복지기관**
- 부천시니어클럽
- 오정노인복지관
- 원미노인복지관
- 소사노인복지관

**부천시 종합사회복지관**
- 소사본종합사회복지관
- 상동종합사회복지관
- 대산종합사회복지관
- 춘의종합사회복지관
- 심곡동종합사회복지관

### **인천광역시**
- 인천종합사회복지관
- 인천광역시장애인종합복지관
- 인천광역시사회복지사협회
- 미추홀장애인종합복지관

### **서울특별시**
- 서울시사회복지사협회

## 🏗️ **시스템 아키텍처**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   AWS Lambda    │───▶│   Playwright    │───▶│   Target Sites  │
│   (Handler)     │    │   (Browser)     │    │   (복지기관)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │
         ▼
┌─────────────────┐    ┌─────────────────┐
│    AWS S3       │◀───│  CrawlingService │
│  (JSON 저장)     │    │  (결과 처리)     │
└─────────────────┘    └─────────────────┘
```

## 🚀 **사용 방법**

### **AWS Lambda 배포 및 실행**

#### 1. 빌드
```bash
npm run build
```

#### 2. Lambda 함수 호출
```json
{
  "targetDate": "2024-01-15",
  "jobName": "오정노인복지관"
}
```

**매개변수:**
- `targetDate`: 크롤링 기준 날짜 (YYYY-MM-DD 형식)
- `jobName`: 크롤링할 기관명 (선택사항, 미지정시 전체 기관)

#### 3. 응답 형태
```json
{
  "success": true,
  "message": "Crawling completed successfully",
  "targetDate": "2024-01-15",
  "jobName": "오정노인복지관",
  "data": {
    "processedJobs": ["오정노인복지관"],
    "s3Location": "s3://bucket/crawling-results/2024-01-15/...",
    "itemCount": 36,
    "duration": 8520
  },
  "timestamp": "2025-01-15T12:34:55.383Z"
}
```

### **로컬 테스트**

로컬에서 Lambda 함수를 테스트하려면 [로컬 테스트 가이드](README.local-test.md)를 참조하세요.

```bash
# 로컬 테스트 환경 시작
docker-compose -f docker-compose.local.yml up --build

# 테스트 실행
./test-lambda.sh
```

## 📊 **데이터 구조**

### **수집 카테고리**
- `NOTICE`: 공지사항
- `RECRUIT`: 채용정보  
- `WELFARE`: 복지서비스
- `EVENT`: 행사/이벤트

### **출력 JSON 형태**
```json
{
  "jobName": "오정노인복지관",
  "baseUrl": "https://senior.bucheon4u.kr",
  "NOTICE": [
    {
      "id": 12345,
      "title": "2024년 신규 프로그램 안내",
      "createdAt": "2024-01-15T00:00:00.000Z",
      "link": "https://senior.bucheon4u.kr/..."
    }
  ],
  "RECRUIT": [...],
  "WELFARE": [...],
  "EVENT": [...]
}
```

## ⚙️ **기술 스택**

- **런타임**: Node.js + TypeScript
- **브라우저 자동화**: Playwright with Chromium
- **클라우드**: AWS Lambda + AWS S3
- **빌드 도구**: TypeScript Compiler
- **테스트**: Jest
- **로컬 테스트**: Docker + MinIO

## 📦 **주요 의존성**

```json
{
  "@aws-sdk/client-s3": "^3.824.0",
  "@sparticuz/chromium": "^131.0.0", 
  "playwright-core": "^1.52.0"
}
```

## 🔧 **개발 가이드**

### **새로운 기관 추가**

1. `src/entity/job/implement/` 경로에 새 기관 클래스 생성
2. `AbstractJob`을 상속받아 구현
3. `JobRegistry.ts`에 새 기관 등록

```typescript
export class 새기관 extends AbstractJob {
    constructor() {
        super('새기관명', 'https://example.com', [
            new 공지사항Step(),
            new 채용Step(),
        ]);
    }
}
```

### **테스트 실행**
```bash
npm test
```

## 📁 **프로젝트 구조**

```
src/
├── aws/
│   ├── lambda/          # Lambda 핸들러 및 서비스
│   └── s3/              # S3 업로드 서비스
├── entity/
│   ├── job/             # 크롤링 Job 정의
│   │   └── implement/   # 각 기관별 구현체
│   └── step/            # 크롤링 단계 추상화
├── utils/               # 유틸리티 함수
└── constants/           # 상수 정의
```

## 🛠️ **문제 해결**

### **일반적인 문제들**

1. **메모리 부족**: Lambda 메모리 설정 증가 (권장: 1024MB 이상)
2. **타임아웃**: Lambda 타임아웃 설정 증가 (권장: 5분 이상)
3. **브라우저 초기화 실패**: Chromium 의존성 확인

### **로그 확인**
```bash
# CloudWatch Logs에서 Lambda 실행 로그 확인
aws logs tail /aws/lambda/your-function-name --follow
```

## 📝 **라이선스**

ISC License

## 🤝 **기여 가이드**

1. 이슈 생성 또는 기존 이슈 확인
2. 피처 브랜치 생성
3. 코드 변경 및 테스트
4. Pull Request 생성

---

더 자세한 정보는 [로컬 테스트 가이드](README.local-test.md)를 참조하세요.
