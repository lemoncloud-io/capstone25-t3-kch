from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

app = FastAPI(title="Blog API Server")

# .env 파일 로드
load_dotenv()
# 환경변수 로그 출력
print("=== Backend Environment Variables ===")
print(f"NODE_ENV: {os.getenv('NODE_ENV', 'not set')}")
print(f"VERSION: {os.getenv('VERSION', 'not set')}")
print(f"API_KEY: {os.getenv('API_KEY', 'not set')}")
print(f"WEB_ORIGIN: {os.getenv('WEB_ORIGIN', 'not set')}")
print("=====================================")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", os.getenv('WEB_ORIGIN')],  # React 개발 서버
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "message": "서버가 정상 작동 중입니다"}
