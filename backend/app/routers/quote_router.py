from fastapi import APIRouter, HTTPException, status

from app import schemas
from app.ai_service import generate_replies

router = APIRouter(prefix="/api", tags=["语录"])


@router.post("/generate", response_model=schemas.GenerateResponse)
def generate(req: schemas.GenerateRequest):
    """调用 AI 生成 3 条回复建议（公开接口，无需登录）"""
    try:
        suggestions = generate_replies(req.scene, req.tone)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI 生成失败：{str(e)}",
        )
    return {"suggestions": suggestions}