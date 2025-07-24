#!/bin/bash

# ===================================
# AWS Lambda 로컬 테스트 스크립트 (실시간 로그 포함)
# ===================================
# 
# 사용법:
#   1. ./test-lambda.sh
#
# 전제조건:
#   - Docker가 실행 중이어야 함
#   - 포트 9000이 사용 가능해야 함
# ===================================

echo "🧪 Testing Lambda function with MinIO (with real-time logs)..."
echo "📍 Lambda URL: http://localhost:9000"
echo "📍 MinIO Console: http://localhost:9002 (minioadmin/minioadmin)"
echo ""

# Docker Compose 파일 경로
COMPOSE_FILE="docker-compose.local.yml"

# 코드 변경 감지 함수
check_code_changes() {
    local image_name="data-grab-lambda"
    
    # 소스 코드에서 가장 최근 수정된 파일의 시간 찾기
    local latest_source=$(find src/ -type f \( -name "*.ts" -o -name "*.js" -o -name "*.json" \) -exec stat -f "%m" {} \; 2>/dev/null | sort -nr | head -n1)
    
    # macOS에서 stat 명령어가 다를 수 있으므로 대안 사용
    if [ -z "$latest_source" ]; then
        latest_source=$(find src/ -type f \( -name "*.ts" -o -name "*.js" -o -name "*.json" \) -exec stat -c "%Y" {} \; 2>/dev/null | sort -nr | head -n1)
    fi
    
    # 여전히 값이 없다면 현재 시간 사용 (안전장치)
    if [ -z "$latest_source" ]; then
        echo "⚠️  Could not detect source file modification times, forcing rebuild"
        return 0
    fi
    
    # Docker 이미지 존재 여부 및 생성 시간 확인
    local image_created=$(docker images --format "table {{.Repository}}:{{.Tag}}\t{{.CreatedAt}}" | grep "$image_name" | head -n1 | awk '{print $3" "$4" "$5}')
    
    if [ -z "$image_created" ]; then
        echo "🔍 Docker image not found, need to build"
        return 0
    fi
    
    # 이미지 생성 시간을 timestamp로 변환
    local image_timestamp=$(date -d "$image_created" +%s 2>/dev/null)
    
    # macOS의 경우 date 명령어가 다름
    if [ -z "$image_timestamp" ]; then
        image_timestamp=$(date -j -f "%Y-%m-%d %H:%M:%S" "$image_created" +%s 2>/dev/null)
    fi
    
    if [ -z "$image_timestamp" ]; then
        echo "⚠️  Could not parse image creation time, forcing rebuild"
        return 0
    fi
    
    # 소스 코드가 이미지보다 최신인지 확인
    if [ "$latest_source" -gt "$image_timestamp" ]; then
        echo "🔄 Source code is newer than Docker image, rebuilding..."
        return 0
    else
        echo "✅ Docker image is up to date with source code"
        return 1
    fi
}

# 컨테이너가 이미 실행 중인지 확인
echo "🔍 Checking if containers are already running..."
containers_running=$(docker-compose -f $COMPOSE_FILE ps -q | wc -l | tr -d ' ')

if [ "$containers_running" -gt 0 ]; then
    echo "📦 Containers are already running"
    
    # 코드 변경 확인
    if check_code_changes; then
        echo "🔄 Rebuilding containers with updated code..."
        docker-compose -f $COMPOSE_FILE up --build -d
    else
        echo "✅ Using existing containers (no code changes detected)"
    fi
else
    echo "🚀 Starting containers..."
    docker-compose -f $COMPOSE_FILE up --build -d
fi

echo "⏳ Waiting for containers to be ready..."
sleep 10

# 실시간 로그 출력을 백그라운드에서 시작
echo "📊 Starting real-time log monitoring..."
docker-compose -f $COMPOSE_FILE logs -f &
LOG_PID=$!

# 함수 정의: 스크립트 종료 시 로그 프로세스도 종료
cleanup() {
    echo ""
    echo "🛑 Stopping log monitoring..."
    kill $LOG_PID 2>/dev/null
    echo "🏁 Test completed!"
    echo ""
    echo "📁 Check results:"
    echo "   - MinIO Console: http://localhost:9002 (minioadmin/minioadmin)"
    echo "   - Local folder: ./output/"
    echo ""
    echo "🛑 To stop containers: docker-compose -f $COMPOSE_FILE down"
}

# 스크립트 종료 시 cleanup 함수 실행
trap cleanup EXIT

# Lambda 함수 테스트 URL
LAMBDA_URL="http://localhost:9000/2015-03-31/functions/function/invocations"

# 연결 테스트
echo ""
echo "🔍 Checking Lambda container status..."
for i in {1..30}; do
    if curl -s "http://localhost:9000" > /dev/null 2>&1; then
        echo "✅ Lambda container is ready!"
        break
    fi
    echo "⏳ Waiting for Lambda container... ($i/30)"
    sleep 2
done

if ! curl -s "http://localhost:9000" > /dev/null 2>&1; then
    echo "❌ Lambda container failed to start!"
    echo "💡 Check logs above for errors"
    exit 1
fi

echo ""
echo "🔥 Starting tests..."
echo "============================================================"
echo ""

echo "📋 Test: Single Job Crawling - 거모종합사회복지관"
echo "📤 Sending request..."
echo ""

curl -XPOST "${LAMBDA_URL}" \
  -H "Content-Type: application/json" \
  -d '{
    "targetDate": "2025-07-18",
    "jobName": "거모종합사회복지관"
  }' | jq '.' 2>/dev/null || echo ""

echo ""
echo "============================================================"
echo ""
echo "⏳ Test completed! Check the logs above for detailed execution info."
echo "🔍 Logs will continue to show for 10 more seconds..."
sleep 10

# cleanup 함수가 trap에 의해 자동으로 호출됩니다 