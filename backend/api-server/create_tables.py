from database import Base, engine
from models import PolicyRaw, PolicyClean, PolicyGenerated

print("Creating tables...")
Base.metadata.create_all(bind=engine)
print("Done ✅")