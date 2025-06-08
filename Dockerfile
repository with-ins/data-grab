# === 빌드 스테이지 ===
FROM node:22-alpine AS builder

WORKDIR /build

# 의존성 파일들 복사
COPY package*.json ./
COPY tsconfig.json ./

# 모든 의존성 설치 (dev dependencies 포함)
RUN npm ci

# 소스 코드 복사 및 빌드
COPY src/ ./src/
RUN npm run build

# === 런타임 스테이지 ===
FROM public.ecr.aws/lambda/nodejs:22

# 작업 디렉토리 설정
WORKDIR ${LAMBDA_TASK_ROOT}

# 프로덕션 의존성만 설치
COPY package*.json ./
RUN npm ci --only=production

# 빌드된 파일들을 빌더 스테이지에서 복사
COPY --from=builder /build/dist/ ./

# Lambda 핸들러 설정
CMD ["lambda/handler.crawl"] 