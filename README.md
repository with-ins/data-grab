## Data Grab - 사회복지기관 크롤링 시스템

AWS Lambda 기반의 사회복지기관 공지사항, 채용정보, 복지서비스 정보를 자동으로 수집하는 크롤링 시스템입니다.

## 프로젝트 개요

이 프로젝트는 Playwright를 사용하여 전국의 주요 사회복지기관 웹사이트에서 최신 정보를 수집하고, AWS S3에 JSON 형태로 저장하는 서버리스 크롤링 솔루션입니다.

### **주요 기능**
- 사회복지기관 크롤링 지원
- 날짜 기반 필터링
- 카테고리별 분류 (공지사항, 채용, 복지서비스, 행사)
- AWS Lambda 서버리스 실행
- S3 자동 업로드 및 저장

## 시스템 아키텍처

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   AWS Lambda    │───▶│   Playwright    │───▶│   Target Sites  │
│   (Handler)     │    │   (Browser)     │    │   (복지기관)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                        │
         ▼                        ▼
┌─────────────────┐    ┌─────────────────┐
│    AWS S3       │◀───│ CrawlingService │
│  (JSON 저장)     │    │  (결과 처리)     │
└─────────────────┘    └─────────────────┘
```

## 🚀 **사용 방법**

### **AWS Lambda 실행**

#### 1. Lambda 함수 호출
```json
{
  "targetDate": "2024-01-15",
  "jobName": "오정노인복지관"
}
```

**매개변수:**
- `targetDate`: 크롤링 기준 날짜 (YYYY-MM-DD 형식)
- `jobName`: 크롤링할 기관명

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

## **기술 스택**

- **런타임**: Node.js + TypeScript
- **브라우저 자동화**: Playwright with Chromium
- **클라우드**: AWS Lambda + AWS S3
- **빌드 도구**: TypeScript Compiler
- **테스트**: Jest
- **로컬 테스트**: Docker + MinIO
