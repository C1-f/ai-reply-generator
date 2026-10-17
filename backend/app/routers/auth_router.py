from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.auth import get_password_hash, verify_password, create_access_token


router = APIRouter(prefix="/auth", tags=["认证"])


@router.post("/register", response_model=schemas.UserOut)
def register(
    user_data: schemas.UserCreate,
    db: Session = Depends(get_db),
):
    """用户注册：检查用户名是否重复，然后哈希密码并写入数据库"""
    # 1. 检查用户名是否已存在
    existing = db.query(models.User).filter(
        models.User.username == user_data.username
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="用户名已被占用",
        )

    # 2. 创建新用户
    new_user = models.User(
        username=user_data.username,
        hashed_password=get_password_hash(user_data.password),
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)   # 拿回自动生成的 id 和 created_at
    return new_user


@router.post("/token", response_model=schemas.Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    """用户登录：验证用户名密码，签发 JWT 令牌"""
    # 1. 查询用户
    user = db.query(models.User).filter(
        models.User.username == form_data.username
    ).first()

    # 2. 验证用户名和密码
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 3. 签发 JWT，把用户名写入 sub 字段
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}