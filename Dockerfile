# AWS Lambda Node.js 20 베이스 이미지 사용
FROM public.ecr.aws/lambda/nodejs:20

# Playwright Chromium 실행을 위한 필수 시스템 패키지 설치
RUN dnf install -y \
    nss atk cups-libs gtk3 libXcomposite libXcursor \
    libXdamage libXext libXi libXrandr libXScrnSaver \
    libXtst pango alsa-lib && \
    dnf clean all

# 작업 디렉토리 설정
WORKDIR ${LAMBDA_TASK_ROOT}

# package.json과 package-lock.json 복사
COPY package*.json ./
COPY tsconfig.json ./

# Node.js 의존성 설치
RUN npm ci --only=production

# TypeScript 개발 의존성도 설치 (빌드를 위해)
RUN npm install typescript @types/node --save-dev

# 소스 코드 복사
COPY src/ ./src/

# TypeScript 빌드
RUN npm run build

# Playwright 브라우저 설치 (의존성은 위에서 수동 설치함)
RUN npx playwright install chromium

# 빌드된 JavaScript 파일들을 루트로 이동
RUN cp -r dist/* ./

# 개발 의존성 제거하여 이미지 크기 최적화
RUN npm prune --production

# Lambda 핸들러 설정
CMD ["lambda/handler.crawl"] 