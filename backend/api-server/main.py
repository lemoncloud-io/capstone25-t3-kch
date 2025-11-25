import os
import sys
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI

from schemas import RewriteReq
from settings import settings

from logging_config import setup_logging, get_logger

setup_logging(
    log_level=os.getenv("LOG_LEVEL", "INFO"),
    log_dir="logs",
    log_file="app.log"
)

logger = get_logger(__name__)

# OpenAI 클라이언트 헬퍼 (요청 시점 생성)
def get_openai_client() -> OpenAI:
    api_key = settings.openai_api_key
    if not api_key:
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY not set")
    return OpenAI(api_key=api_key)

sys.path.append(os.path.dirname(__file__))

# FastAPI 앱 초기화
app = FastAPI(title="Blog API Server")

# Static thumbnails (local fallback)
THUMB_STATIC_DIR = settings.thumbnail_output_dir
if "thumbnails" not in {route.name for route in app.routes if hasattr(route, "name")}:
    app.mount("/thumbnails", StaticFiles(directory=str(THUMB_STATIC_DIR)), name="thumbnails")

# 환경 로그 (API 키 값은 직접 출력하지 않음)
print("=== Backend Environment Variables ===")
print(f"NODE_ENV: {settings.environment}")
print(f"VERSION: {settings.version}")
print(f"WEB_ORIGIN: {settings.web_origin}")
print(f"OPENAI_API_KEY: {'set' if settings.openai_api_key else 'not set'}")
print(f"STORE_MODE: {settings.store_mode}")
print(f"S3_BUCKET: {settings.s3_bucket or 'not set'}")
print("=====================================")

# CORS 설정
web_origin = settings.web_origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=list({web_origin, "http://localhost:5173"}),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 기본 라우트
@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "message": "서버가 정상 작동 중입니다"}
  
# 정책 라우터 연결
from routes.policies import router as policies_router
app.include_router(policies_router, prefix="/api")

# 프롬프트 라우터 연결
from routes.prompts import router as prompts_router
app.include_router(prompts_router, prefix="/api")

# 썸네일 라우터 연결 (feat/thumbnails)
from routes import thumbnails, thumbnails_auto
app.include_router(thumbnails.router, prefix="/api")
app.include_router(thumbnails_auto.router, prefix="/api")

# 블로그 + 썸넬 라우터 연결
from routes.blogs import router as blogs_router
app.include_router(blogs_router, prefix="/api")

# 추천 라우터 연결
from routes import recommendations
app.include_router(recommendations.router)

# 애널리틱스 라우터 연결
from routes.analytics import router as analytics_router
app.include_router(analytics_router, prefix="/api")

# 블로그 CRUD 라우터 연결 (관리자용)
from routes.blogs_crud import router as blogs_crud_router
app.include_router(blogs_crud_router, prefix="/api")



# OpenAI Ping API
@app.get("/openai/ping")
async def openai_ping():
    logger.info("OpenAI Ping 요청")
    try:
        client = get_openai_client()
        rsp = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": "Reply with the single word: PONG"}],
            max_tokens=5,
            temperature=0,
        )
        text = (rsp.choices[0].message.content or "").strip()
        logger.info(f"OpenAI Ping 응답: {text}")
        return {"ok": text == "PONG", "text": text, "model": rsp.model}
    except Exception as e:
        logger.error(f"OpenAI Ping 실패: {e}", exc_info=True)
        raise

# Rewrite API
@app.post("/api/rewrite")
async def rewrite_api(req: RewriteReq):
    logger.info(f"텍스트 재작성 요청", extra={"tone": req.tone, "length": len(req.text)})
    client = get_openai_client()
    system_prompt = (
        "당신은 정부/공공 정책 문서를 한국어로 청년 친화적으로 쉽게 풀어쓰는 전문가입니다. "
        "사실은 정확히 유지하고, 문장은 짧고 명료하게. 과한 이모지는 피하고 필요한 경우에만 사용하세요."
    )
    try:
        rsp = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {
                    "role": "user",
                    "content": f"[tone={req.tone}]\n원문:\n{req.text}\n\n요청: 청년이 바로 이해할 수 있게 요약·재작성해줘."
                },
            ],
            temperature=0.7,
            max_tokens=600,
        )
        out = (rsp.choices[0].message.content or "").strip()
        logger.info(f"텍스트 재작성 완료", extra={"output_length": len(out)})
        return {"result": out}
    except Exception as e:
        logger.error(f"텍스트 재작성 실패: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))