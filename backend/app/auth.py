from datetime import datetime, timedelta, timezone

import jwt
from jwt.exceptions import InvalidTokenError
from pwdlib import PasswordHash

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
from app.database import get_db
from app import models


# 密码哈希器（使用 Argon2，当前最安全的密码哈希算法）
password_hash = PasswordHash.recommended()

# 从请求头 Authorization: Bearer xxx 中提取 Token
# tokenUrl 指向登录接口，Swagger 文档里的"Authorize"按钮会用到
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")


# ============ 密码相关 ============

def get_password_hash(password: str) -> str:
    """把明文密码哈希成安全字符串"""
    return password_hash.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """校验明文密码和数据库中的哈希值是否匹配"""
    return password_hash.verify(plain_password, hashed_password)


# ============ JWT 相关 ============

def create_access_token(data: dict) -> str:
    """根据 payload 生成 JWT 令牌"""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> models.User:
    """
    FastAPI 依赖：从请求头中解析 JWT，返回当前登录用户。
    任何接口加上 `current_user: models.User = Depends(get_current_user)` 
    就会自动实现"必须登录才能访问"。
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="无效的凭证，请重新登录",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except InvalidTokenError:
        raise credentials_exception

    user = db.query(models.User).filter(models.User.username == username).first()
    if user is None:
        raise credentials_exception
    return user