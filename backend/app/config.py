import os
from dotenv import load_dotenv

# 加载 .env 文件
load_dotenv()

# ============ JWT 配置 ============
SECRET_KEY = os.getenv("SECRET_KEY", "fallback-secret-change-me")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7   # 7 天

# ============ 智谱 GLM 配置 ============
DEEPSEEK_API_KEY = os.getenv("ZHIPU_API_KEY", "")   # 变量名保持不变，方便复用 ai_service.py
DEEPSEEK_BASE_URL = "https://open.bigmodel.cn/api/paas/v4/"
MODEL_NAME = "glm-4-flash"

# 启动时做个检查
if not DEEPSEEK_API_KEY:
    print("⚠️  警告：未在 .env 中找到 ZHIPU_API_KEY，AI 生成功能将不可用")