# Blog Platform API Server

간단한 FastAPI 서버 (UV 사용)

## 설치 및 실행

### UV 설치 (처음 한 번만)
```bash
# macOS/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# 또는 pip로 설치
pip install uv
```

### 프로젝트 실행
```bash
# 의존성 설치
uv sync

# 서버 실행
uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000

# 또는 루트에서
yarn api:install  # 의존성 설치
yarn api:dev      # 서버 실행
```

## API 엔드포인트

- `GET /` - Hello World
- `GET /api/health` - 헬스 체크

## API 문서

서버 실행 후:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc