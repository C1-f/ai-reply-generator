import re
from openai import OpenAI

from app.config import DEEPSEEK_API_KEY, DEEPSEEK_BASE_URL, MODEL_NAME

client = OpenAI(api_key=DEEPSEEK_API_KEY, base_url=DEEPSEEK_BASE_URL)


TONE_PROMPTS = {
    "高情商": "你是一位高情商沟通专家。请用温暖、得体、让对方感到被尊重的方式回复。要真诚而不虚伪，考虑对方的感受，同时妥善表达自己的立场。",
    "阴阳怪气": "你是一位语言大师，擅长用看似礼貌、实则绵里藏针的方式回复。话里带话，让对方自己品味弦外之音。保持文明的表面功夫，但暗含锋芒。",
    "幽默": "你是一位幽默段子手。请用轻松、有趣、让人会心一笑的方式回复。可以自嘲、可以夸张、可以用网络梗，但不要冒犯对方。",
    "婉拒": "你是一位善于拒绝的人。请用委婉但立场坚定的方式拒绝对方的请求。既要让对方理解你的难处，又不能留下商量的余地。",
}


def generate_replies(scene: str, tone: str) -> list[str]:
    tone_instruction = TONE_PROMPTS.get(tone, TONE_PROMPTS["高情商"])

    system_prompt = f"""{tone_instruction}

【任务】针对用户提供的对方消息，生成 3 条可直接使用的回复。

【输出格式——必须严格遵守】
- 直接输出 3 条回复内容
- 每条用"1. " "2. " "3. "开头（数字 + 英文句点 + 空格）
- 每条回复独立成段，段与段之间用空行隔开
- 每条回复不超过 100 字

【严禁事项】
- 不要写任何开场白（如"以下是……"）
- 不要写任何标题或侧重点说明（如"侧重效率"）
- 不要写任何总结语
- 不要加粗、不要使用 ** 符号
- 不要加引号包裹整条回复

【正确示例】
1. 谢谢老板提点！既然是福报，那我更要把白天的效率提上去，这样才有精力持续为公司创造价值。

2. 明白老板的意思。我会珍惜磨练的机会，争取尽快独当一面，以后帮您分担更多压力。

3. 老板说得对。我会把这些经历当成积累软实力的过程，提升抗压能力，为将来迎接更大挑战打好基础。

现在，请针对用户给出的消息，输出 3 条回复："""

    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"对方发来的消息：\n{scene}"},
        ],
        temperature=0.9,
        max_tokens=800,
    )

    raw_text = response.choices[0].message.content.strip()

    # 去掉 Markdown 加粗符号，避免 ** 干扰
    raw_text = raw_text.replace("**", "")

    # 按 "1. " "2. " "3. " 拆分
    parts = re.split(r"\n?\s*\d+[.、]\s*", raw_text)
    suggestions = [p.strip() for p in parts if p.strip()]

    # 兜底
    if len(suggestions) < 3:
        suggestions = [raw_text]

    return suggestions[:3]