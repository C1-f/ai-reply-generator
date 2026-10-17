from pydantic import BaseModel, Field
from datetime import datetime


# ============ 用户相关 ============

class UserCreate(BaseModel):
    """注册请求体"""
    username: str = Field(..., min_length=3, max_length=50, description="用户名")
    password: str = Field(..., min_length=6, max_length=128, description="密码")


class UserOut(BaseModel):
    """返回给前端的用户信息（不含密码）"""
    id: int
    username: str

    class Config:
        from_attributes = True   # 允许从 ORM 对象读取属性


class Token(BaseModel):
    """登录成功后返回的令牌"""
    access_token: str
    token_type: str = "bearer"


# ============ AI 生成相关 ============

class GenerateRequest(BaseModel):
    """生成回复的请求体"""
    scene: str = Field(..., min_length=1, max_length=2000, description="对方发来的话")
    tone: str = Field(..., description="语气：高情商/阴阳怪气/幽默/婉拒")


class GenerateResponse(BaseModel):
    """生成回复的响应体"""
    suggestions: list[str] = Field(..., description="3条回复建议")


# ============ 语录 CRUD 相关 ============

class QuoteCreate(BaseModel):
    """保存语录的请求体"""
    scene: str = Field(..., min_length=1, max_length=2000)
    tone: str = Field(..., max_length=20)
    content: str = Field(..., min_length=1, max_length=1000)


class QuoteOut(BaseModel):
    """语录的响应体"""
    id: int
    scene: str
    tone: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True