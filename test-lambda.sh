#!/bin/bash

# ===================================
# AWS Lambda 로컬 테스트 스크립트
# ===================================
# 
# 사용법:
#   1. docker-compose -f docker-compose.local.yml up --build
#   2. ./test-lambda.sh
#
# 전제조건:
#   - Docker가 실행 중이어야 함
#   - 포트 9000이 사용 가능해야 함
# ===================================

echo "🧪 Testing Lambda function with MinIO..."
echo "📍 Lambda URL: http://localhost:9000"
echo "📍 MinIO Console: http://localhost:9002 (minioadmin/minioadmin)"
echo ""

# Lambda 함수 테스트 URL
LAMBDA_URL="http://localhost:9000/2015-03-31/functions/function/invocations"

# 연결 테스트
echo "🔍 Checking Lambda container status..."
if ! curl -s "http://localhost:9000" > /dev/null 2>&1; then
    echo "❌ Lambda container is not running!"
    echo "💡 Run: docker-compose -f docker-compose.local.yml up --build"
    exit 1
fi
echo "✅ Lambda container is running"
echo ""

echo "📋 Test 1: Health Check (Empty Event)"
curl -XPOST "${LAMBDA_URL}" \
  -H "Content-Type: application/json" \
  -d '{}' | jq '.' 2>/dev/null || echo ""

echo -e "\n============================================================\n"

echo "📋 Test 2: Single Job Crawling"
curl -XPOST "${LAMBDA_URL}" \
  -H "Content-Type: application/json" \
  -d '{
    "syncDate": "2024-01-15",
    "jobName": "오정노인복지관"
  }' | jq '.' 2>/dev/null || echo ""

echo -e "\n============================================================\n"

echo "📋 Test 3: All Jobs Crawling (May take longer)"
curl -XPOST "${LAMBDA_URL}" \
  -H "Content-Type: application/json" \
  -d '{
    "syncDate": "2024-01-15"
  }' | jq '.' 2>/dev/null || echo ""

echo -e "\n============================================================\n"

echo "📋 Test 4: Invalid Date Format (Should Fail)"
curl -XPOST "${LAMBDA_URL}" \
  -H "Content-Type: application/json" \
  -d '{
    "syncDate": "2024/01/15",
    "jobName": "오정노인복지관"
  }' | jq '.' 2>/dev/null || echo ""

echo -e "\n============================================================\n"

echo "🎉 All tests completed!"
echo ""
echo "📁 Check results:"
echo "   - MinIO Console: http://localhost:9002 (minioadmin/minioadmin)"
echo "   - Local folder: ./output/"
echo "   - Container logs: docker-compose -f docker-compose.local.yml logs lambda-crawler"
echo ""
echo "🛑 To stop containers: docker-compose -f docker-compose.local.yml down" 