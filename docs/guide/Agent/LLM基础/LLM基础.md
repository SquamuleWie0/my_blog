# LLM 基础

> `LLM` 是 `agent` 的大脑。这一层是教**怎么和大脑沟通**——比如调模型姿势、写 `Prompt`、约束输出、`Embedding`、`Prompt caching`、控制成本。

#### 1、调模型姿势：API 形态

- **`completion`**：早期 `OpenAI` 的格式，给一段话模型接着写。日常开发基本不用，但偶尔读老代码会遇到。
- **`chat completion`**：今天所有主流 `LLM` 用的接口形态，按"用户说 / 助理答"的多轮消息格式。所有 `chat` 类应用 90% 走这种。

**两种 API 代码对比（以翻译为例）：**

```python
# 早期 completion（legacy）
# 偶尔读老库 / 老 SDK 会遇到
import openai

response = openai.Completion.create(
    model="gpt-3.5-turbo-instruct",
    prompt="把下面这句翻译成中文：'Hello, world. How are you?'",
    max_tokens=100,
)
print(response.choices[0].text)
# "你好，世界。你好吗？"


# 现代 chat completion（标准）
from openai import OpenAI

client = OpenAI()
response = client.chat.completions.create(
    model="gpt-4",
    messages=[
        {"role": "system", "content": "你是一个中英翻译助手，保持原意不变"},
        {"role": "user",   "content": "Hello, world. How are you?"},
    ],
)
print(response.choices[0].message.content)
```

**HTTP 报文对比：**

```http
POST /v1/completions
{
  "model": "gpt-3.5-turbo-instruct",
  "prompt": "把下面这句翻译成中文：'Hello...'"   ← 单段文本
}

POST /v1/chat/completions
{
  "model": "gpt-4",
  "messages": [                                  ← 消息数组
    {"role": "system", "content": "你是一个中英翻译助手"},
    {"role": "user",   "content": "Hello, world. How are you?"}
  ]
}
```

**核心差别**：
- `prompt` 字段 和 `messages` 数组。
- 多轮对话不用自己拼字符串，原生支持每轮一条 `message`。

**流式响应**：
- **`streaming response`（`SSE`）**：流式响应，模型一个字一个字往外推，前端实时显示返回的内容。

#### 2、写 `prompt`

- **`zero-shot`**：直接问，靠模型训练时学的能力答。简单任务首选 —— "把这段文字翻译成法语"。
- **`few-shot`**：塞 2-3 个示例让模型照着答。`zero-shot` 风格不对时首选 —— 比如让模型按特定格式输出，先给 3 个示例。
- **`CoT`（`Chain of Thought`）**：逼模型一步步推理。本质是**把直觉题变成算术题** —— 数学题、逻辑推理题效果尤其好。
- **`ReAct prompting`**：让模型在"思考"和"调工具"之间循环 —— "需要查最新数据 → 调搜索 `tool` → 拿到 → 回答"。**这是后面整个 `agent` 的基础**。

#### 3、约束输出

> **对应 3 种 `LLM` 输出消费场景的 3 种约束手段**

，不取决于"我要多严格"。

- **`JSON mode`**：
    - `JSON mode` 喂数据给程序。
    - 接口层强制合法 `JSON`。比靠 `prompt` 约束稳得多 —— 信息提取、入库、传给下游 `API` 的标准做法。
- **`function calling`**：
    - `function calling` 驱动 `agent` 调工具。
    - 让模型决定调哪个函数 + 参数，程序接住真去调 —— **`agent` 能"做事"的关键能力**。
- **`grammar-constrained decoding`**：
    - `grammar-constrained decoding` 生成代码 / `DSL`。
    - 用语法规则（`JSON Schema`、`CFG` 文法）卡死解码过程，非法 `token` 直接剔除。**零出错率**，但写起来麻烦，`critical` 场景才用。

**PS：总的来说就是，选哪种约束取决于下游消费场景**

**`function calling` 通用例子（一个查天气的助手）：**

```python
tools = [
    {                                              ← 工具 1：原来那个 get_weather
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "查指定城市的实时天气",
            "parameters": {
                "type": "object",
                "properties": {
                    "city": {"type": "string", "description": "城市名"},
                },
                "required": ["city"]
            }
        }
    },
    {                                              ← 工具 2：新增的 get_time
        "type": "function",
        "function": {
            "name": "get_time",
            "description": "查指定城市的当前时间",
            "parameters": {
                "type": "object",
                "properties": {
                    "city": {"type": "string", "description": "城市名"}, ← 入参相同
                },
                "required": ["city"]
            }
        }
    }
]

# 模型自动决定调工具：
# tool_calls: [{"function": {"name": "get_weather", "arguments": '{"city":"北京"}'}}]
# 程序接住，真去调天气 API，把结果喂回去让模型继续生成回答
```

#### 4、`Embedding`（文字转向量）

不是"调聊天模型"那种 `API`，是另一种调用方式——把文字转成**一段浮点数（向量）**：

```python
from openai import OpenAI

client = OpenAI()
response = client.embeddings.create(
    model="text-embedding-3-small",
    input="今天天气真好",
)
print(response.data[0].embedding)
# [0.012, -0.045, 0.078, ...]  ← 一段 1536 维的浮点数
```

**核心要点**：
- **不是给人看的**，是给程序算相似度用的（余弦相似度、点积）
- 不同模型维度不同：`text-embedding-3-small` 是 1536 维，`text-embedding-3-large` 是 3072 维，开源 `BGE` 是 768 维
- **`RAG`、长期记忆、搜索都靠它**
- 成本比 `chat completion` 低一个数量级（~$0.02 / 百万 `token`）

```python
# 用 embedding 做语义搜索
import numpy as np

def cosine(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

query_emb = client.embeddings.create(
    model="text-embedding-3-small",
    input="怎么退款"
).data[0].embedding

candidates = [
    "退订政策说明：购买 7 天内可全额退款",
    "账号登录 FAQ：忘记密码怎么办",
    "发货时间：下单后 24 小时内",
]

scores = [
    cosine(query_emb, client.embeddings.create(
        model="text-embedding-3-small", input=c
    ).data[0].embedding)
    for c in candidates
]

# scores[0] 最高 → "退款"问题匹配"退订政策"
```

`embedding` 模型选哪个主要看：**维度大小、是否支持中文、是否开源**。生产环境一般混用——长文档用 `OpenAI` 大模型，短查询用本地小模型省成本。

#### 5、`Prompt caching`（API 层省钱关键）

`OpenAI` 和 `Anthropic` 都已支持。当输入 `prompt` 中存在重复的前缀内容（系统提示词、检索回填）时，`API` 会**自动缓存**，缓存命中部分**便宜 50%-90%**：

```python
# OpenAI 自动缓存 ≥ 1024 tokens 的 prompt
# 缓存命中部分：输入价 × 0.5
# 没缓存部分：原价

# 实际价格对比（GPT-4 Turbo input）：
# - 不缓存：$10 / 百万 token
# - 缓存命中：$5 / 百万 token（半价）
```

**但是要注意触发的条件**：
- `prompt` 必须 ≥ 1024 `tokens`（`OpenAI` 阈值）
- 缓存命中要求 `prompt` 前缀**完全一致**
- 缓存默认 5-10 分钟有效（`Anthropic` 可手动控制 `TTL`）

```python
# 命中缓存的典型 prompt 结构
messages = [
    {"role": "system", "content": "你是天气助手..."},  # ← 固定前缀（命中缓存）
    {"role": "system", "content": "工具列表：..."},      # ← 固定前缀（命中缓存）
    {"role": "user",   "content": "北京今天冷不冷？"},   # ← 变化部分（不命中）
]

# Anthropic 还支持显式控制 cache breakpoint
# 通过在 content 里加 {"type": "ephemeral"} 标记手动断点
```

**典型受益场景**：
- **`RAG` 应用**：检索回填是固定的，每轮对话重复 → 缓存命中大头
- **`Agent` 系统**：工具列表 + 系统提示词 + 角色设定全是固定前缀
- **多轮对话**：前几轮对话历史是固定的，每轮都塞进去

**没开缓存就很亏**。这是现代 `LLM` 应用的标准配置。

#### 6、花钱逻辑

- **`token`**：`LLM` 不认字，认 `token`。一个 `token` ≈ 半个英文词或 1-2 个中文字。每个模型有自己的 `tokenizer`，相同文本 `token` 数可能不同。
- **`context window`**：模型一次能看多少 `token`（`GPT-4` 128k / `Claude 3.5` 200k / `Gemini 1.5 Pro` 2M）。**硬限制**——超出报错或截断，多轮对话越长越长要注意。
- **`cost per token`**：每个模型每千 `token` 收费差距几十倍（`GPT-3.5` 是 `GPT-4` 的 1/30）。**能便宜模型解决的绝不上贵的**——这是商业能不能赚钱的关键。
- **`prompt caching`**：上面第 5 节讲的，重复前缀命中缓存能省 50%。

**一个典型多轮 `RAG` 应用的成本估算：**

```
假设一次多轮对话：
- 系统提示词：500 tokens（缓存命中）
- RAG 检索回填：1000 tokens（缓存命中）
- 最近 10 轮对话：2000 tokens（部分命中）
- 模型回复：800 tokens
- 总共：约 4300 tokens

单次成本（GPT-4 Turbo）：
- 不开缓存：约 $0.04（≈ ¥0.28）
- 开缓存：约 $0.025（≈ ¥0.18）  ← 省 35%

日活 1 万、每人 10 轮：
- GPT-4 Turbo 不开缓存：约 ¥28000/天
- GPT-4 Turbo 开缓存：约 ¥18000/天
- Gemini 1.5 Flash 开缓存：约 ¥500/天
```

差距 在于商业可行性 —— **简单任务用 `Flash`，复杂推理才上 `Sonnet` / `GPT-4`**，再开 `prompt caching` 进一步降本。

---

**总的来说就是**：调模型的 `API` 形态、约束输出的能力、`Embedding`、`Prompt caching`、控制成本的能力。`LunetaleAgent` 这类 `agent` 系统走的是 `chat completion` + `function calling` + `Embedding` + `Prompt caching` + 模型分级路由（简单用 `Flash`、复杂用 `Sonnet`）的组合路线。
