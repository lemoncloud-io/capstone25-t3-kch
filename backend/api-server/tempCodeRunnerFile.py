from database import Base, engine
from models import PolicyRaw, PolicyClean, PolicyGenerated  # 모델 import 필수

print("Creating tables...")
Base.metadata.create_all(bind=engine)
print("Done ✅")