from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

# SQLite 数据库文件位于 backend 目录下，名为 database.db
# 使用三个斜杠表示相对路径
SQLALCHEMY_DATABASE_URL = "sqlite:///./database.db"

# 创建数据库引擎
# check_same_thread=False 是 SQLite 在 FastAPI 多线程环境下的必须参数
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}
)

# 会话工厂：每次调用 SessionLocal() 就会创建一个新的数据库会话
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 所有 ORM 模型的基类（SQLAlchemy 2.0 新写法）
class Base(DeclarativeBase):
    pass

def get_db():
    """
    FastAPI 依赖注入函数：每个请求获取一个数据库会话，
    请求结束后自动关闭。
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()