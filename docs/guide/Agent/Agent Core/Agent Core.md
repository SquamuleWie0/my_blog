# Agent Core

`Agent Core` 这一层的主线：模型不再只是生成一次回答，而是被放进一个可以持续推进任务的运行结构里。

这个运行结构里会有状态、工具、工具返回结果、循环和停止条件。一次模型调用只是其中一步，Agent Core 关注的是这些步骤怎么串起来。

```text
一次 LLM 调用
→ 多轮状态推进
→ 工具调用
→ 工具结果回填
→ 再调用 LLM
→ 停止
```

普通 `LLM call` 很简单：

```python
response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {"role": "user", "content": "帮我生成一段剧情"}
    ],
)

print(response.choices[0].message.content)
```

这就是一次输入、一次输出。

Agent 要多做的事情，是把这次输出放进一个循环里，让LLM可以继续决定下一步。

```text
call_llm
→ parse action
→ run tool
→ append observation
→ call_llm again
```

## 1、`LLM call`

Agent 每一步还是从模型调用开始。

只是这里的 `messages` 不再只有用户问题，还会塞进中间过程：

```python
messages = [
    {"role": "system", "content": system_prompt},
    {"role": "user", "content": user_goal},
]

response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=messages,
)

assistant_text = response.choices[0].message.content
```

`assistant_text` 可能是最终回答，也可能是下一步动作。

比如：

```text
Action: search_memory[用户喜欢什么角色]
```

这里开始，模型输出就不只是给用户看的文本了，它还可能被程序解析和执行。

## 2、`state`

Agent 跑起来之后，需要有一个状态对象。

最小状态大概就这些：

```python
state = {
    "messages": [],
    "steps": 0,
    "tool_calls": [],
    "done": False,
}
```

`messages` 是最重要的。

它记录用户目标、模型输出、工具结果。

每跑一步，就往里面追加内容：

```python
state["messages"].append({
    "role": "assistant",
    "content": assistant_text,
})
```

工具返回后也要追加：

```python
state["messages"].append({
    "role": "user",
    "content": f"Observation: {observation}",
})
```

没有这层状态，下一次模型调用就不知道前面发生过什么。

## 3、`tool`

工具就是 Agent 能调用的外部能力。

在 `LunetaleAgent` 里，比较自然的工具会是这些：

```text
search_memory
write_memory
update_game_state
query_session
```

代码里可以先用一个普通注册表表示：

```python
tools = {
    "search_memory": search_memory,
    "update_game_state": update_game_state,
}
```

模型只负责说它想调什么：

```text
Action: search_memory[用户喜欢什么角色]
```

程序负责真正执行：

```python
tool_name = "search_memory"
tool_arg = "用户喜欢什么角色"

observation = tools[tool_name](tool_arg)
```

这层是 Agent 和普通聊天最大的差异之一。

模型不直接改变系统，程序接住模型的工具意图，再去执行真实函数。

## 4、`observation`

工具返回的结果，一般叫 `Observation`。

比如：

```text
Action: search_memory[用户喜欢什么角色]
Observation: 用户喜欢冷静、强大的女性角色。
```

它要回填进 `messages`：

```python
messages.append({
    "role": "user",
    "content": "Observation: 用户喜欢冷静、强大的女性角色。",
})
```

下一轮模型看到这个结果，才能继续生成：

```text
Final: 这次剧情可以强化冷静型女性角色的表现。
```

`Observation` 本质上是工具结果和模型推理之间的连接点。

## 5、`loop`

把前面几块串起来，就是 Agent loop。

```python
def run_agent(user_goal: str, max_steps: int = 5):
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_goal},
    ]

    for step in range(max_steps):
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
        )

        text = response.choices[0].message.content
        messages.append({"role": "assistant", "content": text})

        if text.startswith("Final:"):
            return text

        if text.startswith("Action:"):
            tool_name, tool_arg = parse_action(text)
            observation = tools[tool_name](tool_arg)

            messages.append({
                "role": "user",
                "content": f"Observation: {observation}",
            })

    return "max steps reached"
```

这个循环里有几件事：

```text
调模型
保存模型输出
判断是否结束
解析工具调用
执行工具
保存工具结果
进入下一轮
```

`ReAct` 就是在这个循环上规定了一套文本格式：

```text
Thought
Action
Observation
Final
```

后面写 `ReAct toy`，基本就是把这个 loop 写完整。

## 6、`stop condition`

Agent 不能无限跑。

先用两个停止条件就够：

```python
if text.startswith("Final:"):
    return text

if step >= max_steps:
    return "max steps reached"
```

实际项目里还会补：

```text
工具连续失败
模型输出格式错误
用户中断
服务超时
```

这块看起来很普通，但工程里很关键。

Agent 一旦进入循环，就必须能停下来。

## 7、放到 `LunetaleAgent`

对应到 `LunetaleAgent`，这几块大概是：

```text
LLM call：生成对话 / 剧情
state：session、messages、game state、user context
tool：memory、DB、game state update
observation：记忆召回结果、状态查询结果、工具执行结果
loop：多步生成流程
stop condition：生成完成、最大轮数、工具失败、超时
```

这篇先只把骨架放在这里。

后面 `ReAct.md` 重点写这个 loop 的最小实现；`AutoGen拆解.md` 再看框架把这些东西封装到了哪里。
