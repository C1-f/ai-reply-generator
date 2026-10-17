from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base


class User(Base):
    """用户表"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # 一对多关系：一个用户拥有多条语录
    # cascade="all, delete-orphan" 表示删除用户时，其所有语录也被删除
    quotes = relationship(
        "Quote",
        back_populates="owner",
        cascade="all, delete-orphan",
    )


class Quote(Base):
    """语录表：保存用户收藏的 AI 生成回复"""
    __tablename__ = "quotes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    scene = Column(Text, nullable=False)      # 对方发来的话（场景）
    tone = Column(String(20), nullable=False) # 语气：高情商/阴阳怪气/幽默/婉拒
    content = Column(Text, nullable=False)     # 保存的回复内容
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # 反向关系：每条语录属于一个用户
    owner = relationship("User", back_populates="quotes")