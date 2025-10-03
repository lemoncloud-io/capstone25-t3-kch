import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import collect

# .env 파일 로드
load_dotenv()

app = FastAPI(title="Youth Policy API", version="0.1")

# CORS 설정 (React 프론트와 연동 위해 필요)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", os.getenv("WEB_ORIGIN")],  # 프론트엔드 주소
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 서버 상태 체크용 엔드포인트
@app.get("/api/health")
async def health_check():
    return {"status": "ok", "message": "서버가 정상 작동 중입니다 🚀"}

# 라우터 등록
app.include_router(collect.router, prefix="/api")