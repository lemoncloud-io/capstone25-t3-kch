from pydantic import BaseModel

class RewriteReq(BaseModel):
    text: str
    tone: str | None = "youthful"
