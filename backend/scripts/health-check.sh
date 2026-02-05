#!/bin/bash
BACKEND_URL="${1:-http://localhost:5000}"
response=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/health")

if [ "$response" = "200" ]; then
  echo "✅ Backend is healthy"
  exit 0
else
  echo "❌ Backend health check failed (HTTP $response)"
  exit 1
fi
