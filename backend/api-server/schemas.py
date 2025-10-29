from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class RewriteReq(BaseModel):
    text: str
    tone: str | None = "youthful"

# Blog Post Schemas with camelCase output for frontend
def to_camel(string: str) -> str:
    """Convert snake_case to camelCase"""
    components = string.split('_')
    return components[0] + ''.join(x.title() for x in components[1:])

class PostCreate(BaseModel):
    title: str
    summary: str
    content: str
    category: str
    thumbnail: Optional[str] = None
    plcy_no: Optional[str] = None

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True
    )

class PostUpdate(BaseModel):
    title: Optional[str] = None
    summary: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None
    thumbnail: Optional[str] = None
    plcy_no: Optional[str] = None

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True
    )

class PostOut(BaseModel):
    id: int
    slug: str
    title: str
    summary: str
    content: str
    category: str
    thumbnail: Optional[str]
    author: str
    view_count: int
    is_published: bool
    created_at: datetime
    updated_at: datetime
    published_at: Optional[datetime]
    plcy_no: Optional[str]

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True
    )

class CategoryOut(BaseModel):
    category: str
    count: int

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True
    )
