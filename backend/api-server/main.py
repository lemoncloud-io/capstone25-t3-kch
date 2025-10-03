import os
from pathlib import Path
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv(dotenv_path=Path(__file__).resolve().parents[2] / ".env")

# OpenAI 클라이언트
from openai import OpenAI
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Blog API Server")

# 환경변수 로그 출력
print("=== Backend Environment Variables ===")
print(f"NODE_ENV: {os.getenv('NODE_ENV', 'not set')}")
print(f"VERSION: {os.getenv('VERSION', 'not set')}")
print(f"API_KEY: {os.getenv('API_KEY', 'not set')}")
print(f"WEB_ORIGIN: {os.getenv('WEB_ORIGIN', 'not set')}")
print(f"OPENAI_API_KEY: {'set' if os.getenv('OPENAI_API_KEY') else 'not set'}")
print("=====================================")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", os.getenv("WEB_ORIGIN")],
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

@app.get("/openai/ping")
async def openai_ping():
    rsp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": "Reply with the single word: PONG"}],
        max_tokens=5,
        temperature=0,
    )
    text = (rsp.choices[0].message.content or "").strip()
    return {"ok": text == "PONG", "text": text, "model": rsp.model}

from fastapi import HTTPException
from pydantic import BaseModel

class RewriteReq(BaseModel):
    text: str
    tone: str | None = "youthful"

@app.post("/api/rewrite")
async def rewrite_api(req: RewriteReq):
    if not os.getenv("OPENAI_API_KEY"):
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY not set")

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