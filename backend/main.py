from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import quote_router

app = FastAPI(
    title="AI 高情商嘴替生成器",
    version="2.0.0",
    description="输入对方的话，AI 生成多条高情商回复",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # 公开接口，允许所有来源
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(quote_router.router)


@app.get("/", tags=["根"])
def root():
    return {"message": "AI 高情商嘴替生成器 后端服务运行中"}