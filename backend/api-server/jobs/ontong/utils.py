from datetime import datetime
import os

def today_key() -> str:
    return datetime.utcnow().strftime("%Y%m%d")

def ensure_dir(path: str) -> None:
    os.makedirs(path, exist_ok=True)

def log(msg: str) -> None:
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}")