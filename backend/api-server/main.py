import os, sys
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI

from schemas import RewriteReq

# 1) .env 로드: backend/api-server/.env 우선, 없으면 루트 .env 폴백
BACKEND_ENV = Path(__file__).resolve().parent / ".env"           # backend/api-server/.env
ROOT_ENV    = Path(__file__).resolve().parents[2] / ".env"       # blog-platform/.env

if BACKEND_ENV.exists():
    load_dotenv(dotenv_path=BACKEND_ENV)
elif ROOT_ENV.exists():
    load_dotenv(dotenv_path=ROOT_ENV)

# 2) OpenAI 클라이언트 헬퍼 (요청 시점 생성)
def get_openai_client() -> OpenAI:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY not set")
    return OpenAI(api_key=api_key)

sys.path.append(os.path.dirname(__file__))

# 3) FastAPI 앱 초기화
app = FastAPI(title="Blog API Server")

# 4) 환경 로그 (API 키 값은 직접 출력하지 않음)
print("=== Backend Environment Variables ===")
print(f"NODE_ENV: {os.getenv('NODE_ENV', 'not set')}")
print(f"VERSION: {os.getenv('VERSION', 'not set')}")
print(f"API_KEY: {os.getenv('API_KEY', 'not set')}")
print(f"WEB_ORIGIN: {os.getenv('WEB_ORIGIN', 'not set')}")
print(f"OPENAI_API_KEY: {'set' if os.getenv('OPENAI_API_KEY') else 'not set'}")
print("=====================================")

# 5) CORS 설정
web_origin = os.getenv("WEB_ORIGIN") or "http://localhost:5173"
app.add_middleware(
    CORSMiddleware,
    allow_origins=list({web_origin, "http://localhost:5173", "http://localhost:5174"}),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 6) 기본 라우트
@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "message": "서버가 정상 작동 중입니다"}

# 6-1) 정책 라우터 연결
from routes.policies import router as policies_router
app.include_router(policies_router, prefix="/api")

# 6-2) 프롬프트 라우터 연결
from routes.prompts import router as prompts_router
app.include_router(prompts_router, prefix="/api")

# 6-3) 블로그 포스트 라우터 연결 (우리가 추가한 CRUD API)
from routes.posts import router as posts_router
app.include_router(posts_router, prefix="/api")

# 7) OpenAI Ping API
@app.get("/openai/ping")
async def openai_ping():
    client = get_openai_client()
    rsp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": "Reply with the single word: PONG"}],
        max_tokens=5,
        temperature=0,
    )
    text = (rsp.choices[0].message.content or "").strip()
    return {"ok": text == "PONG", "text": text, "model": rsp.model}

# 8) Rewrite API
@app.post("/api/rewrite")
async def rewrite_api(req: RewriteReq):
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
        return {"result": out}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
