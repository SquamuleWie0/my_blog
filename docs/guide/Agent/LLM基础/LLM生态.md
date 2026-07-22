# LLM 生态

> 调用 LLM 背后其实是 `SDK` / `API` / 厂商生态。这篇是 LLM 基础的补充，了解一下调用一次模型背后的这套基础设施

## 一、`SDK` / `API` / `HTTP` 三件套

### 这三件套实际服务的是"调远程服务"

如果不用 `SDK`，手写一个 `HTTP` 请求：

```python
import os
import requests

url = "https://api.openai.com/v1/chat/completions"

headers = {
    "Authorization": f"Bearer {os.environ['OPENAI_API_KEY']}",
    "Content-Type": "application/json",
}

payload = {
    "model": "gpt-4o-mini",
    "messages": [
        {"role": "user", "content": "用一句话解释什么是 LLM 生态"}
    ],
}

response = requests.post(url, headers=headers, json=payload)
data = response.json()

print(data["choices"][0]["message"]["content"])
```

这段代码里，其实已经同时出现了 `HTTP` / `API` / `SDK` 里的前两层：

##### `HTTP`：请求是怎么发出去的

```python
requests.post(url, headers=headers, json=payload)
```

这里的 `POST` 就是 `HTTP method`，表示“我要向服务器提交一段数据”。

`headers` 和 `json` 也都是 `HTTP request` 的组成部分：

- `headers`HTTP请求头：放认证信息，比如 `Authorization`
- `json`HTTP请求体：放请求正文，也就是你真正要传给模型的内容

`HTTP` 解决的是“这段数据怎么通过网络发到远程服务”。

##### `API`：你发到哪里，以及必须按什么格式发

```python
url = "https://api.openai.com/v1/chat/completions"
```

这个 URL 不是随便写的，它是厂商定义好的 `API endpoint`。

`/v1/chat/completions` 表示：我要调用的是“聊天补全”这个服务。

再看请求体：

```python
payload = {
    "model": "gpt-4o-mini",
    "messages": [
        {"role": "user", "content": "用一句话解释什么是 LLM 生态"}
    ],
}
```

这里的 `model` 和 `messages` 也不是随便起名的，而是这个 `API` 规定好的字段。

你把字段名写错，服务端就不知道你要什么；你少传必填字段，服务端就会报错。

一句话：`API` 解决的是“这个远程服务暴露了哪些能力，以及调用时必须遵守什么输入 / 输出格式”。

##### `SDK`：把上面这些固定动作封装掉

同样的事情，用 `SDK` 写会变成这样：

```python
from openai import OpenAI

client = OpenAI()

response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {"role": "user", "content": "用一句话解释什么是 LLM 生态"}
    ],
)

print(response.choices[0].message.content)
```

这段代码没有显式写：

- `https://api.openai.com/v1/chat/completions`
- `Authorization: Bearer ...`
- `Content-Type: application/json`
- `requests.post(...)`
- `response.json()`

不是因为它们不存在，而是 `SDK` 已经帮你写好了。

一句话：`SDK` 解决的是“不要每次都手写 URL、请求头、JSON 解析，把固定调用流程封装成一个函数”。

### 三者关系

`HTTP` 管“怎么发请求”，`API` 管“请求该发到哪里、字段该怎么写”，`SDK` 把这些固定流程封装成你熟悉的代码调用。

所以：

```python
client.chat.completions.create(...)
```

本质上就是更好写的：

```python
requests.post(
    "https://api.openai.com/v1/chat/completions",
    headers={...},
    json={...},
)
```

一句话：你写的是 `SDK`，实际跑的是 `API` 合约，底层传输靠的是 `HTTP`。

### `HTTP` 不只一种交互方式

实际请求 / 响应只是其中一种，`LLM` 还常用流式：

- **请求 / 响应**（最常见）：客户端 1 次请求 → 服务器立刻回 1 次完整响应 → 客户端拿到后才能继续。**原子化**，默认模式。

- **流式响应**（`SSE` / chunked）：1 次请求 → **服务器保持连接 → 陆续推 N 个 chunk** → 拼成 1 次完整回答。本质还是 **1 个 HTTP 响应被切块传输**。`LLM stream=True` / 长文本推送。
  
- **`WebSocket`**：HTTP upgrade 后双向长连接，**任何时候任何一方都能主动发**，不是一问一答。实时聊天 / 协作 / 游戏。`LLM` 用不上。

- **批处理**（`Batch API` / async）：一次性提交很多任务 → 服务端立刻返回 `job_id` / `batch_id` → 后台异步处理 → 之后再查询状态或下载结果。适合大量离线任务，不追求实时返回。

- **长轮询**（`long polling`）：客户端发起请求后，服务端不马上返回，而是先挂住连接；如果数据准备好了就返回，如果超时还没有结果，客户端再发下一次请求。它本质上还是一轮一轮的 `HTTP` 请求，是 `WebSocket` 普及前常见的实时更新方案。

`LLM` 实际用到的主要是**前两种**——普通调用用请求 / 响应，长文本用流式。

## 二、三大商业厂商

| 厂商 | 主力模型 | 特点 |
|---|---|---|
| `OpenAI` | `GPT-4o` / `GPT-4 Turbo` / `GPT-3.5 Turbo` | 龙头，综合能力最强 |
| `Anthropic` | `Claude 3.5 Sonnet` / `Claude 3.5 Haiku` | 前 `OpenAI` 团队出来做，安全 / 长文本 / 代码强 |
| `Google Gemini` | `Gemini 1.5 Pro` / `Gemini 1.5 Flash` | `Google` 出品，上下文窗口大（1-2M），便宜 |

每家都有自己的 `Python SDK`：

- `openai`（`pip install openai`）→ `client.chat.completions.create(...)`
- `anthropic`（`pip install anthropic`）→ `client.messages.create(...)`
- `google-generativeai`（`pip install google-generativeai`）→ `model.generate_content(...)`

**其实套路是一样的**：选 `SDK` → 选模型 → 传 `prompt` / `messages`。
## 三、开源阵营

不想被商业 `API` 锁住，可以自部署开源模型：

| 团队 | 模型 |
|---|---|
| `Meta` | `Llama 3` |
| `Mistral` | `Mistral 7B` / `Mixtral` |
| 阿里 | `Qwen 2` |
| `DeepSeek` | `DeepSeek-V2` |

**问题是**：需要自己部署（`GPU` 服务器）。
**但是**：数据完全自主 + 长期成本可控 + 可深度定制。

普通公司级 agent 系统很少自部署，但对数据安全要求高的金融 / 医疗场景，或者学术研究，自部署是合理选择。

## 四、关于选择

通用对话、综合能力强的任务用 `GPT-4`；
长文本理解、代码生成用 `Claude 3.5 Sonnet`；
便宜 + 海量上下文的场景用 `Gemini 1.5 Flash`。

实际项目里更常见的是**混用**——复杂推理用贵的（`GPT-4` / `Sonnet`），简单任务用便宜的（`Flash` / `Haiku`），靠模型分级路由调度。`LunetaleAgent` 现在用的就是这条路。

## 五、同一个 `SDK` 的多种典型用法

前面讲的是：一次 `SDK` 调用背后其实是 `HTTP` 请求 + `API` 合约。

这里换一个角度：**同一个 `SDK` 里，不同服务对应不同的 API 路径和参数格式**。

**调 LLM 的统一模式**——所有 LLM 调用都是这两步：

```python
# 第一步：建一个客户端
client = <SDK>(api_key="...")

# 第二步：选服务 + 选模型 + 传内容
result = client.<服务>.create(
    model="<模型>",
    <内容参数>=<值>
)
```

调用 `LLM` 不管做什么都是这套——**建客户端 + 选服务调 `create`**。下面的 4 个例子都遵循这个模式：

```python
from openai import OpenAI

client = OpenAI()

# 1. 问答场景
response = client.chat.completions.create(
    model="gpt-4",
    messages=[
        {"role": "system", "content": "你是一个 helpful 助理"},
        {"role": "user",   "content": "什么是 Embedding？"},
    ]
)
print(response.choices[0].message.content)


# 2. 检索场景（RAG / 语义搜索）
response = client.embeddings.create(
    model="text-embedding-3-small",
    input="今天天气真好"
)
vector = response.data[0].embedding


# 3. 文生图场景
response = client.images.generate(
    model="dall-e-3",
    prompt="一只在月球上钓鱼的猫，水彩画风格"
)
image_url = response.data[0].url


# 4. 文字转语音场景
response = client.audio.speech.create(
    model="tts-1",
    voice="alloy",        # 有 alloy / echo / fable / onyx / nova / shimmer 6 种
    input="你好，这是用 AI 生成的语音。"
)
response.stream_to_file("output.mp3")
```

**也就是说**：同一个 `client`，不同问题调不同服务（`chat.completions` / `embeddings` / `images` / `audio`），调用语法完全一致。学会了一种，**换一种服务只是改 2 个字段**（`model` 和内容字段名）。

---

**小结一下**：`LLM` 生态是**多家厂商 + 多套 `SDK` + 商业 + 开源**的混合世界。调用模式高度一致（选 `SDK` → 选模型 → 传 `prompt`），区别只在**谁家的模型强在哪、价格多少、上下文多大**。
