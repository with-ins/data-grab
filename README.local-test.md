# 🧪 로컬 Lambda 테스트 가이드

이 가이드는 AWS Lambda 함수를 로컬 환경에서 테스트하는 방법을 설명합니다.

## 📋 **전제 조건**

- Docker & Docker Compose 설치
- Apple Silicon Mac (M1/M2/M3) 환경에서 테스트 가능
- 포트 9000, 9001, 9002가 사용 가능해야 함

## 🐳 **파일 구조**

```
├── Dockerfile              # AWS Lambda 배포용 (수정 금지!)
├── Dockerfile.local         # 로컬 테스트용 (Apple Silicon 지원)
├── docker-compose.local.yml # 로컬 테스트 환경 구성
├── test-lambda.sh          # 테스트 스크립트
└── README.local-test.md    # 이 파일
```

## 🚀 **실행 방법**

### **1. 로컬 테스트 환경 시작**

```bash
# 로컬 테스트용 Docker Compose 실행
docker-compose -f docker-compose.local.yml up --build

# 백그라운드 실행 (선택사항)
docker-compose -f docker-compose.local.yml up --build -d
```

### **2. 테스트 실행**

새 터미널에서 테스트 스크립트 실행:

```bash
# 테스트 스크립트 실행
./test-lambda.sh
```



### **3. 결과 확인**

#### **MinIO 웹 콘솔**
- URL: http://localhost:9002
- ID: `minioadmin`
- PW: `minioadmin`

업로드된 크롤링 결과 JSON 파일들을 웹 UI에서 확인할 수 있습니다.

#### **로컬 출력 폴더**
```bash
# 로컬에 저장된 파일 확인
ls -la ./output/
```

## 📊 **서비스 구성**

| 서비스 | 포트 | 설명 |
|--------|------|------|
| lambda-crawler | 9000 | Lambda Runtime Interface Emulator |
| minio | 9001 | MinIO API (S3 호환) |
| minio-console | 9002 | MinIO 웹 콘솔 |

## 🔧 **환경변수**

로컬 테스트시 다음 환경변수들이 자동 설정됩니다:

```bash
AWS_REGION=ap-northeast-2
S3_BUCKET_NAME=crawl-json-bucket
NODE_ENV=development
LAMBDA_VERSION=1.0.0-local

# AWS SDK가 MinIO를 S3로 인식하도록 하는 환경변수들
# (프로덕션 코드 변경 없이 MinIO 사용 가능)
AWS_ENDPOINT_URL=http://minio:9000
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin
AWS_S3_FORCE_PATH_STYLE=true
AWS_S3_USE_PATH_STYLE_ENDPOINT=true
```

## 🛠️ **문제 해결**

### **포트 충돌**
```bash
# 사용 중인 포트 확인
lsof -i :9000
lsof -i :9001
lsof -i :9002

# 기존 컨테이너 정리
docker-compose -f docker-compose.local.yml down
```

### **빌드 오류**
```bash
# Docker 캐시 삭제 후 재빌드
docker-compose -f docker-compose.local.yml down
docker system prune -f
docker-compose -f docker-compose.local.yml up --build --force-recreate
```

### **Apple Silicon 호환성**
- `Dockerfile.local`에서 `--platform=linux/amd64` 명시
- Rosetta 에러 발생시 Docker Desktop 업데이트 확인

### **브라우저 초기화 오류**
브라우저 초기화에 시간이 걸릴 수 있습니다. 로그에서 다음 메시지 확인:
```
Browser initialized successfully
```

## 📝 **로그 확인**

```bash
# 전체 로그 확인
docker-compose -f docker-compose.local.yml logs

# Lambda 컨테이너 로그만 확인
docker-compose -f docker-compose.local.yml logs lambda-crawler

# 실시간 로그 확인
docker-compose -f docker-compose.local.yml logs -f lambda-crawler
```

## 🛑 **환경 종료**

```bash
# 컨테이너 중지
docker-compose -f docker-compose.local.yml down

# 볼륨까지 삭제 (MinIO 데이터 삭제)
docker-compose -f docker-compose.local.yml down -v
```

## ⚠️ **주의사항**

1. **프로덕션 코드 보호**: `Dockerfile`, `src/` 폴더의 코드는 AWS Lambda 배포용이므로 수정하지 마세요.
2. **로컬 전용**: `Dockerfile.local`과 `docker-compose.local.yml`은 로컬 테스트 전용입니다.
3. **환경변수 활용**: AWS SDK는 환경변수만으로 MinIO를 S3로 인식하므로 코드 변경이 불필요합니다.
4. **성능**: 로컬 환경에서는 실제 AWS Lambda보다 느릴 수 있습니다.
5. **네트워크**: 크롤링 대상 사이트의 접근 제한이 있을 수 있습니다.

## 🎯 **성공 기준**

테스트가 성공하면 다음과 같은 응답을 받습니다:

```json
{
  "success": true,
  "message": "Crawling completed successfully",
  "targetDate": "2024-01-15",
  "jobName": "오정노인복지관",
  "data": {
    "processedJobs": ["오정노인복지관"],
    "s3Location": "http://minio:9000/crawl-json-bucket/crawling-results/2024-01-15/...",
    "itemCount": 36,
    "duration": 8520
  },
  "timestamp": "2025-01-15T12:34:55.383Z"
}
``` 