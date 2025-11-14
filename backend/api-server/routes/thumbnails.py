from __future__ import annotations

import os, io, hashlib, datetime
from pathlib import Path
from typing import Optional, Dict

import boto3
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from PIL import Image, ImageDraw, ImageFont

from settings import settings

router = APIRouter(prefix="/thumbnails", tags=["thumbnails"])

# ========= 경로/환경 =========
ROOT_DIR   = Path(__file__).resolve().parents[1]  # backend/api-server
ASSETS_DIR = ROOT_DIR / "assets"
BG_DIR     = ASSETS_DIR / "backgrounds"           # assets/backgrounds/*.png
OUT_DIR    = settings.thumbnail_output_dir

# 폰트 경로
# FONT_PATH  = ASSETS_DIR / "fonts" / "BMDOHYEON_ttf.ttf"
FONT_PATH  = ASSETS_DIR / "fonts" / "BMJUA_ttf.ttf"

S3_BUCKET  = settings.s3_bucket
S3_PREFIX  = settings.s3_prefix
S3_REGION  = settings.aws_region

# ========= 요청 모델 =========
class Req(BaseModel):
    policy_id: str
    category: str   # 주거/일자리/복지/교육
    caption: str    # 썸네일 메인 문구(원하면 \n으로 강제 줄바꿈 가능)

# ========= 유틸 =========
def _load_font(pt: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    """폰트 로드. 없으면 기본 폰트로 폴백."""
    try:
        return ImageFont.truetype(str(FONT_PATH), pt)
    except Exception as e:
        print(f"[WARN] truetype font not found: {FONT_PATH} -> {e} -> fallback to default")
        return ImageFont.load_default()

def _pct_rect_to_px(pct: Dict[str, float], W: int, H: int) -> tuple[int, int, int, int]:
    x = int(pct["x"] * W)
    y = int(pct["y"] * H)
    w = int(pct["w"] * W)
    h = int(pct["h"] * H)
    return (x, y, w, h)

def _draw_centered_outline_text(
    img: Image.Image,
    rect: tuple[int, int, int, int],
    text: str,
    min_px=28,
    max_px=130,               # ← 최대 폰트 크기 상향
    color=(40, 40, 40),
    stroke=1,                # ← 굵기 보강용
    stroke_same_color=True,  # ← 외곽선 느낌 없이 굵게
    line_spacing_ratio=0.35, # ← 행간
    supersample=2,           # ← 슈퍼샘플링(2~3 권장)
):
    """
    안전영역(rect) 안에 중앙정렬 + 오토핏 텍스트.
    - caption 내 '\n'은 강제 개행으로 처리
    - supersample 배율로 크게 그린 뒤 축소(LANCZOS)해서 경계 부드럽게
    """
    x, y, w, h = rect

    # 고해상도 임시 캔버스
    HiW, HiH = w * supersample, h * supersample
    layer = Image.new("RGBA", (HiW, HiH), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)

    def _textsize(draw: ImageDraw.ImageDraw, txt: str, font: ImageFont.ImageFont):
        l, t, r, b = draw.textbbox((0, 0), txt, font=font, stroke_width=0)
        return (r - l, b - t)

    # 1) 하드 브레이크(\n) 우선 분할
    paragraphs = [seg for seg in (text or "").split("\n")]

    # 2) 폭에 맞춰 줄바꿈 (한국어 무공백 문장 대응)
    def wrap_paragraph(p: str, font: ImageFont.ImageFont, maxw: int):
        words = p.split()
        if len(words) == 1:
            words = list(words[0])  # 한글자 단위 fallback
        lines, cur = [], ""
        for w_ in words:
            trial = (cur + " " + w_).strip()
            if _textsize(d, trial, font)[0] <= maxw:
                cur = trial
            else:
                if cur:
                    lines.append(cur)
                cur = w_
        if cur:
            lines.append(cur)
        return lines or [""]

    # 3) 폰트 크기 탐색
    lo, hi, best = min_px * supersample, max_px * supersample, min_px * supersample
    best_lines: list[str] = [text]

    while lo <= hi:
        mid = (lo + hi) // 2
        font = _load_font(mid)

        tmp_lines: list[str] = []
        for p in paragraphs:
            tmp_lines.extend(wrap_paragraph(p, font, HiW))

        line_h = d.textbbox((0, 0), "가", font=font)[3]
        line_gap = int(line_h * line_spacing_ratio)
        total_h = len(tmp_lines) * line_h + (len(tmp_lines) - 1) * line_gap
        max_line_w = max((_textsize(d, ln, font)[0] for ln in tmp_lines), default=0)

        if total_h <= HiH and max_line_w <= HiW:
            best, best_lines = mid, tmp_lines
            lo = mid + 2
        else:
            hi = mid - 2

    # 4) 실제 렌더
    font = _load_font(best)
    line_h = d.textbbox((0, 0), "가", font=font)[3]
    line_gap = int(line_h * line_spacing_ratio)
    block_h = len(best_lines) * line_h + (len(best_lines) - 1) * line_gap
    cy = (HiH - block_h) // 2

    for i, ln in enumerate(best_lines):
        tw, _ = _textsize(d, ln, font)
        tx = (HiW - tw) // 2
        ty = cy + i * (line_h + line_gap)

        if stroke > 0:
            d.text(
                (tx, ty), ln, font=font, fill=color,
                stroke_width=stroke,
                stroke_fill=(color if stroke_same_color else (0, 0, 0)),
            )
        else:
            d.text((tx, ty), ln, font=font, fill=color)

    # 5) 축소 후 합성
    layer_small = layer.resize((w, h), Image.LANCZOS)
    img.alpha_composite(layer_small, (x, y))

def _maybe_upload_s3(png_bytes: bytes, key: str) -> Optional[str]:
    """S3 설정이 있으면 업로드하고 URL을 반환."""
    if not settings.use_s3:
        return None
    try:
        client = boto3.client("s3", region_name=S3_REGION or None)
        client.put_object(
            Bucket=S3_BUCKET,
            Key=key,
            Body=png_bytes,
            ContentType="image/png",
            CacheControl="public, max-age=31536000, immutable",
        )
        if S3_REGION:
            return f"https://{S3_BUCKET}.s3.{S3_REGION}.amazonaws.com/{key}"
        return f"https://{S3_BUCKET}.s3.amazonaws.com/{key}"
    except Exception as e:
        print("[WARN] S3 upload failed:", repr(e))
        return None

# ========= 카테고리 매핑 로직 개선 =========

# preprocess.py의 상세 카테고리를 4대 카테고리로 매핑
# 4대 카테고리: 일자리(취업 지원, 창업), 주거(주거), 교육(해외 기회, 교육·자격증), 복지(대출·금융, 생활비 지원, 문화·여가, 건강·상담, 청년 참여)
def category_by_keyword(raw_category: str) -> str:
    if not raw_category: return "welfare" # 기본값 복지
    text = raw_category.strip().replace(" ", "").lower()
    
    if any(k in text for k in ["일자리", "취업 지원", "취업", "창업", "구직", "고용", "인턴"]):
        return "jobs"
        
    if any(k in text for k in ["주거", "주택", "전세", "월세", "기숙사"]):
        return "housing"
   
    if any(k in text for k in ["교육", "교육·자격증", "해외 기회", "자격증", "학습", "공부", "유학", "어학"]):
        return "education"
    return "welfare" # 기본값 '복지'

BG_MAP = {
    "jobs":      BG_DIR / "bg_jobs.png",
    "housing":   BG_DIR / "bg_housing.png",
    "education": BG_DIR / "bg_education.png",
    "welfare":   BG_DIR / "bg_welfare.png",
}

SAFE_RECT_PCT = {
    "jobs":      {"x": 0.10, "y": 0.18, "w": 0.80, "h": 0.52},
    "housing":   {"x": 0.10, "y": 0.22, "w": 0.80, "h": 0.54},
    "education": {"x": 0.12, "y": 0.20, "w": 0.76, "h": 0.54},
    "welfare":   {"x": 0.10, "y": 0.25, "w": 0.80, "h": 0.50},
}

# ========= 엔드포인트 =========
@router.post("/generate")
def generate(req: Req):

    # 위 함수 바탕으로 카테고리 선택 후 배경 선택
    key = category_by_keyword(req.category)
    
    bg_path = BG_MAP[key]
    if not bg_path.exists():
        raise HTTPException(status_code=500, detail=f"background not found: {bg_path}")

    img = Image.open(bg_path).convert("RGBA")
    W, H = img.size
    rect = _pct_rect_to_px(SAFE_RECT_PCT[key], W, H)

    # 텍스트 렌더(굵기 보강 + 행간 + 슈퍼샘플링 적용)
    _draw_centered_outline_text(
        img, rect, req.caption,
        min_px=28, max_px=130,          
        color=(40, 40, 40),
        stroke=1,                      # 굵게
        stroke_same_color=True,        # 외곽선
        line_spacing_ratio=0.35,
        supersample=2
    )

    buf = io.BytesIO()
    img.save(buf, format="PNG", optimize=True)
    data = buf.getvalue()

    checksum = "sha256:" + hashlib.sha256(data).hexdigest()
    ymd = datetime.datetime.now().strftime("%Y/%m")

    hash_suffix = hashlib.md5(data).hexdigest()[:10]
    filename = f"{req.policy_id}_{hash_suffix}.png"

    s3_key = f"{S3_PREFIX}/{ymd}/{filename}"
    s3_url = _maybe_upload_s3(data, s3_key)

    if not s3_url:
        out_path = OUT_DIR / filename
        try:
            with open(out_path, "wb") as f:
                f.write(data)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Save failed: {e}")

        public_url = f"/thumbnails/{filename}"

        return {
            "ok": True,
            "storage": "static",
            "url": public_url,
            "path": str(out_path),
            "policy_id": req.policy_id,
            "category": req.category,
            "checksum": checksum,
        }

    return {
        "ok": True,
        "storage": "s3",
        "url": s3_url,
        "bucket": S3_BUCKET,
        "key": s3_key,
        "policy_id": req.policy_id,
        "category": req.category,
        "checksum": checksum,
    }
