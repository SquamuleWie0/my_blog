# gRPC 鉴权：调用方认证与用户身份解析

## 一笔 RPC 进来之前发生了什么

**gRPC 鉴权的本质就是一件事：RPC 进来，看 metadata，决定接不接。**

gRPC 是一个 RPC 框架。RPC 框架有个绕不开的问题：

服务端怎么决定要不要接这一笔调用？

HTTP 那边靠 header：`Authorization: Bearer ...`。
gRPC 那边也靠一个东西，但叫 metadata：一种类似 HTTP header 的 key-value 列表。

所以 gRPC 鉴权的本质就是：

```text
RPC 进来
   → 看 metadata 里有没有 token / user_id / app_id
   → 判断要不要接
   → 接了就交给业务
   → 不接就立刻拒
```

只是这件事在 gRPC 里拆成了**两段**来做：一段在协议层，一段在业务层。两段**不能合并**，原因分别放到后面梳理。

## 协议层：拦截器在 RPC 入口把关

**对不上 Bearer token 就立刻 UNAUTHENTICATED，根本进不到业务。**

gRPC 提供一种叫 **ServerInterceptor** 的机制。它会在每条 RPC 真正到 servicer 方法之前拦一刀，拦下来可以：

- 放行 → 调到真正的业务方法
- 拒掉 → 直接返回错误状态，根本进不到业务

这里用一个通用的 `GrpcAuthInterceptor` 示例说明。整段代码大概这样：

```python
# from __future__ 让类型注解不真 evaluate，写 str | None 这种不用 import Optional
from __future__ import annotations

import hmac
from dataclasses import dataclass
from typing import Any

import grpc


@dataclass(frozen=True, slots=True)
class GrpcIdentity:
    user_id: str
    app_id: str | None = None


# 协议层拦截器：每条 RPC 进来都要先走这里进行验证
class GrpcAuthInterceptor(grpc.aio.ServerInterceptor):
    def __init__(self, *, token: str, disabled: bool = False) -> None:
        # 拼成"比对用"字符串：客户端发的也带 "Bearer " 前缀；encode 成二进制数据给 hmac （底层密码学 API）用
        self._expected_authorization = f"Bearer {token}".encode("ascii")
        # dev 逃生门：True 时整个拦截器放行，生产必须 False
        self._disabled = disabled

    # gRPC 必实现的方法，每条 RPC 进来都调一次
    # continuation 是"接力下一棒"：调它拿到原 handler；返回原 handler 放行，返回改造过的拒
    async def intercept_service(
        self,
        continuation: Any,
        handler_call_details: grpc.HandlerCallDetails,
    ) -> grpc.RpcMethodHandler | None:
        handler = await continuation(handler_call_details)
        if self._disabled:
            return handler

        # 从 metadata 抽 "authorization" 这一项的所有 value
        authorization_values = _metadata_values(
            handler_call_details.invocation_metadata,
            "authorization",
        )
        if len(authorization_values) == 1:
            try:
                authorization = authorization_values[0].encode("ascii")
            except (AttributeError, UnicodeEncodeError):
                pass
            else:
                # hmac.compare_digest 是常数时间比对，防时序攻击，不能用 ==
                if hmac.compare_digest(authorization, self._expected_authorization):
                    return handler

        # 走到这里都是不合格：缺 / 多 / 编码失败 / 比对失败——拒
        # 用嵌套 abort + _replace_handler_behavior 把所有 RPC 都换成 UNAUTHENTICATED
        async def abort(
            _request: Any,
            context: grpc.aio.ServicerContext,
        ) -> None:
            await context.abort(
                grpc.StatusCode.UNAUTHENTICATED,
                "missing or invalid bearer token",
            )

        return _replace_handler_behavior(handler, abort)
```

这段代码干了几件事。

### 把 token 在构造时就拼成"比对用字符串"

```python
self._expected_authorization = f"Bearer {token}".encode("ascii")
```

注意这一行做了几步：

```text
"some-secret-token"      →  "Bearer some-secret-token"  →  b"Bearer some-secret-token"
   ↑ 原始字符串             ↑ 拼上 "Bearer " 前缀            ↑ 编码成 ascii bytes
```

为什么要拼 `"Bearer "` 前缀？因为客户端发过来时也会带这个前缀。比对的时候两端都得带上才算匹配。

为什么要 encode 成 bytes？因为后面 `hmac.compare_digest` 是 byte-to-byte 比对，不是字符串比对。

### dev 逃生门

```python
def __init__(self, *, token: str, disabled: bool = False) -> None:
    self._disabled = disabled
```

`disabled=True` 时整个拦都不拦，直接 return 原 handler。开发期绕过鉴权很方便，**生产必须 False**。

### 每条 RPC 都过 `intercept_service`

```python
async def intercept_service(
    self,
        continuation: Any,
    handler_call_details: grpc.HandlerCallDetails,
) -> grpc.RpcMethodHandler | None:
```

这个方法是 gRPC 框架规定的——继承 `ServerInterceptor` 后必须实现它。每条 RPC 进来时，gRPC 都会调一次。

参数：

- `continuation`："把请求传给链上下一棒"的回调。调它 `await continuation(handler_call_details)` 就能拿到原本要用的 handler。
- `handler_call_details`：这次调用附带的信息，主要是 `method`（哪个 RPC 方法）和 `invocation_metadata`（调用方发过来的 metadata）。

返回值：要返回的 handler。返回原 handler 就放行；返回被改造过的 handler 就拒掉。

### 比对 token

```python
authorization_values = _metadata_values(
    handler_call_details.invocation_metadata,
    "authorization",
)
if len(authorization_values) == 1:
    try:
        authorization = authorization_values[0].encode("ascii")
    except (AttributeError, UnicodeEncodeError):
        pass
    else:
        if hmac.compare_digest(authorization, self._expected_authorization):
            return handler
```

这一段比较绕，分三层。

**第一层**：从 metadata 列表里把 `authorization` 这个 key 对应的所有 value 拿出来。`authorization_values` 可能空（没传）、有多个（重复传了）、或恰好一个（正常）。

为什么"恰好一个"才算合法？因为正常请求只应该有一份 authorization header。

**第二层**：如果拿到的是合法字符串，编码成 ascii bytes。`try/except` 用来容错——万一不是 ascii（比如传了 unicode 字符），当作没传，进下面的 reject 分支。

**第三层**：`hmac.compare_digest(authorization, self._expected_authorization)` 比对两个字节串。

**为什么是 `hmac.compare_digest` 不是 `==`？**

`==` 的字符串比对遇到第一个不同字符就停。这有个安全问题：耗时和"前缀匹配多少"相关，攻击者可以通过响应时间**逐步推断** token 字符。`hmac.compare_digest` 是**常数时间比对**——不论匹配度如何，耗时一致。这是验证 secret 的标准做法。

比对通过 → return handler（放行）。
比对失败 / 拿不到 → 不走 return，往下走，走 reject 分支。

### 嵌套 abort：拒请求的"统一出口"

```python
async def abort(
    _request: Any,
    context: grpc.aio.ServicerContext,
) -> None:
    await context.abort(
        grpc.StatusCode.UNAUTHENTICATED,
        "missing or invalid bearer token",
    )

return _replace_handler_behavior(handler, abort)
```

走到这里的请求都是鉴权失败的——要么没传 token，要么 token 对不上。这个 `abort` 函数是把"业务实现"换成"统一失败"用的：

```text
原本：handler.Chat(request, context) → 走真正的业务
现在：handler.Chat(request, context) → 直接 abort UNAUTHENTICATED
```

注意 `abort` 函数：

- 是 `intercept_service` 内部**临时声明的局部函数**，不是 class method（没有 `self`）
- 签名故意模拟一个 servicer 方法（`_request, context`）
- 是给 `_replace_handler_behavior(handler, abort)` 当"统一拒请求出口"用——任何 RPC 到它这里都变 UNAUTHENTICATED

为什么用局部函数而不是 class method？因为它不需要 `self` 上的任何状态，全部逻辑就两行。定义在 `intercept_service` 里更内聚——读这个方法的人能在同一处看到完整鉴权流程。

### 拦截器链：放行 / 拒 / 包装三种动作

拦截器有**多个**时（Logger、RateLimit、Auth 一起用），整条链路是这样的：

```text
RPC 进来
   ↓
gRPC 调 interceptor1.intercept_service(continuation_A, details)
                            ↑
                      "传向 interceptor2 的棒"

interceptor1 调 await continuation_A(details)
   ↓ 真触发 interceptor2.intercept_service(continuation_B, details)
      ↓ interceptor2 调 await continuation_B(details)
         ↓ 拿到真正的 servicer handler
   interceptor2 决定 → 返回 altered
interceptor1 决定 → 返回 final
   ↓
gRPC 用 final handler 调度业务
```

`auth` 模块这边只有一个拦截器，简化：

```text
RPC 进来 → GrpcAuthInterceptor.intercept_service(continuation, details)
         → await continuation(details) 问下一棒（真业务）怎么打算
         → 拿到真业务的 handler 对象
         → 决定怎么 return
```

拦截器拿到 handler 后能做三种动作：

```text
放行       return handler                                    ← 原样，下一棒说了算
拒         return _replace_handler_behavior(handler, abort)   ← 把真业务换成 abort
包装       return wrap(handler, 加日志/统计)                  ← 在真业务外加一层再 return
```

第三种"包装"是 interception 最强大的能力，常见用法是统计耗时、加 trace。`auth` 模块这边只用前两种——放行 / 拒。

### 每次请求都是独立的世界

**拦截器是单例，gRPC 帮你 new 了 per-request 对象**：

```text
请求 1  →  gRPC new 一个 handler_call_details（装它独有的 metadata）
请求 2  →  再 new 一个（metadata 也跟着不同）
```

`handler_call_details.invocation_metadata` 读到的是**这次请求自己带的**——不会和别的请求串。所以尽管 `GrpcAuthInterceptor` 整个进程只有一个实例，每个 RPC 跑起来是互相隔离的。

## 业务层：在 servicer 入口抽身份

**从 metadata 抽 x-user-id / x-app-id，包成 GrpcIdentity 喂给业务。**

拦截器放行后，框架把请求路由到对应的 servicer 方法。比如 `SingleAgentServicer.Chat`：

```python
class SingleAgentServicer(single_agent_pb2_grpc.SingleAgentServiceServicer):
    async def Chat(self, request, context):
        identity = await resolve_identity(context)
        result = await chat_service.chat(
            user_id=identity.user_id,
            app_id=identity.app_id,
            session_id=request.session_id,
            message=request.message,
        )
        return single_agent_pb2.SingleChatResponse(reply=result.reply)
```

业务方法第一件事往往就是取身份。这个 `resolve_identity` 也在 `auth` 模块里：

```python
async def resolve_identity(
    context: grpc.aio.ServicerContext,
    require_app_id: bool = False,
) -> GrpcIdentity:
    metadata = context.invocation_metadata()

    user_id_values = _metadata_values(metadata, "x-user-id")
    if len(user_id_values) != 1:
        await context.abort(grpc.StatusCode.INVALID_ARGUMENT, "x-user-id is required")
    user_id = user_id_values[0].strip()
    if not user_id:
        await context.abort(grpc.StatusCode.INVALID_ARGUMENT, "x-user-id is required")

    app_id_values = _metadata_values(metadata, "x-app-id")
    if len(app_id_values) > 1:
        await context.abort(grpc.StatusCode.INVALID_ARGUMENT, "x-app-id must not be repeated")
    app_id = app_id_values[0].strip() or None if app_id_values else None
    if require_app_id and app_id is None:
        await context.abort(grpc.StatusCode.INVALID_ARGUMENT, "x-app-id is required")

    return GrpcIdentity(user_id=user_id, app_id=app_id)
```

业务层的逻辑比协议层简单：只是把 metadata 里的 `x-user-id` 和 `x-app-id` 抽出来，包成一个 `GrpcIdentity` 返回。

四个分支都是"出错就立刻 abort"：

```text
x-user-id 没传或传多了              → INVALID_ARGUMENT, "x-user-id is required"
x-user-id 是空字符串               → INVALID_ARGUMENT, "x-user-id is required"
x-app-id 传多了                   → INVALID_ARGUMENT, "x-app-id must not be repeated"
require_app_id=True 但 app_id 缺失 → INVALID_ARGUMENT, "x-app-id is required"
```

注意这些都是 `INVALID_ARGUMENT`，不是 `UNAUTHENTICATED`。两边抛的错不一样。

## 两层抛的错为什么要不一样

**问题不同就抛不同码：身份不可信 vs 参数有问题。**

拦截器和 servicer 都会用 `await context.abort(...)` 报错码。但报的是不同的事：

```text
拦截器层  → UNAUTHENTICATED
   含义：调用方身份不被信任
   场景：token 没传 / token 错 / 调用方根本不合法

业务层    → INVALID_ARGUMENT
   含义：调用方被信任了，但请求参数有问题
   场景：x-user-id 没传 / x-app_id 重复了
```

这两类错的性质不同——一个是"你（调用方）不合法"，一个是"你合法但你的请求有问题"。客户端读这个 status code 决定后续策略。

## 为什么鉴权要分两层

**同一连接跑多 RPC + BFF 一个实例替多用户转——两边身份必须分开。**

之前提了一个问题：为什么不能把"调用方身份"和"用户身份"放在同一层做完？

两个原因。

### gRPC 用 HTTP/2 长连接

gRPC 不是一调用一连接，是 HTTP/2 长连接——客户端和服务器先建立一条 TCP+HTTP/2 长连接，然后**多条 RPC 跑在同一条连接上**。

这意味着同一条连接里可能跑：

- 不同用户的 RPC（user A 的请求和 user B 的请求）
- 不同权限的 RPC（公开 vs 鉴权后）
- 不同 app 的 RPC（mobile 端 vs web 端）

**连接建立时不需要鉴权**，但**每条 RPC 进来时都要过拦截器**——拦截器里能拿到这条 RPC 自己的 metadata。

这就是为什么 `intercept_service` 不是"建立连接时调一次"，而是"每条 RPC 过来都调一次"。

### BFF 转发模式

**BFF = Backend-For-Frontend**——"专门为前端配的后端层"。在 Agent 服务化架构里，主后端 / BFF 就承担这个角色。

```text
没 BFF 时：                  有 BFF 时：

前端 → LLM 服务              前端 → BFF → Agent微服务
    → 用户服务                       ↓
    → 支付服务                  集中处理：
    → ...                       ☐ 统一鉴权 ☐ 限流
                                ☐ 多服务聚合
                                ☐ 错误格式
                                ☐ 协议转换
```

如果没 BFF，前端要懂每个微服务的协议、要做聚合、要在每个服务里各自处理鉴权——一团乱。BFF 把这些集中到一层做。

放到主后端 / BFF 转发模式里：

```text
前端用户 A ─┐
前端用户 B ─┼─→ 主后端 / BFF ──────→ Agent微服务 (gRPC)
前端用户 C ─┘
   ↑ 多个用户                    ↑ 一个主后端 / BFF 实例
```

一个主后端 / BFF 实例要替**多个前端用户**转发 RPC 给 Agent微服务。光验证"调用方是合法的主后端 / BFF"不够——因为同一个 BFF 可能同时替 A 和 B 转。如果不另外抽 user_id，Agent微服务 这边就没法区分这笔请求是替谁办事的。

所以必须分两层：

```text
协议层（拦截器）：主后端 / BFF 这个调用方合不合法？
   → 合法的主后端 / BFF 才能让我（Agent微服务）继续干活

业务层（resolve_identity）：这笔请求具体在替哪个用户？
   → 拿到 user_id 后业务才能做多租户 / 限流 / 审计
```

## private helper：藏在文件底下的两个工具

**`_metadata_values` 解析 metadata 列表；`_replace_handler_behavior` 帮拦截器拒绝四种 RPC 形态。**

`auth` 模块里有两个 `_` 开头的私有 helper。

### `_metadata_values(metadata, key)`

```python
def _metadata_values(metadata: Any, key: str) -> list[Any]:
    values: list[Any] = []
    try:
        iterator = iter(metadata)
    except TypeError:
        return values

    for item in iterator:
        try:
            item_key, value = item
        except (TypeError, ValueError):
            continue
        if isinstance(item_key, str) and item_key.lower() == key:
            values.append(value)
    return values
```

gRPC 的 metadata 不是 dict，是 `[(key, value), ...]` 列表，要按 key 取值得自己写循环。

这个 helper 同时被两处调用：

- `GrpcAuthInterceptor` 用它读 `"authorization"`
- `resolve_identity` 用它读 `"x-user-id"`、`"x-app-id"`

防御性写法（try-except 多种类型）是因为 metadata 在不同 gRPC 版本里给的形状可能差一点点。

### `_replace_handler_behavior(handler, behavior)`

```python
def _replace_handler_behavior(handler, behavior):
    if handler is None:
        return grpc.unary_unary_rpc_method_handler(behavior)
    if handler.unary_unary:
        return grpc.unary_unary_rpc_method_handler(behavior, ...)
    if handler.unary_stream:
        return grpc.unary_stream_rpc_method_handler(behavior, ...)
    if handler.stream_unary:
        return grpc.stream_unary_rpc_method_handler(behavior, ...)
    return grpc.stream_stream_rpc_method_handler(behavior, ...)
```

gRPC 里一个 RPC 有四种形态：

```text
unary_unary    一进一出
unary_stream   一进多出（流式响应，比如分块输出 AI 文本）
stream_unary   多进一出（流式请求）
stream_stream  多进多出（双向流）
```

拦截器拿到的 handler 是其中一种。`_replace_handler_behavior` 检测形态，调用对应的工厂函数重新包一层。这样拦截器不用为四种形态各写一份拒绝逻辑——一个 `behavior` 函数全 cover。

## token 是从哪来的

**两边部署时同步同一份字符串，运行时没动态交换。**

这文件**不负责**生成 token，只负责比对。token 的流转：

```text
.env / config (Agent 微服务端)       .env / config (主后端 / BFF 端)
INTERNAL_GRPC_TOKEN: "shared..."     INTERNAL_GRPC_TOKEN: "shared..."
            ↓ 启动时读                         ↓ 启动时读
GrpcAuthInterceptor(token=...)      BFF 发请求时塞 Authorization: Bearer shared...
```

具体从哪读：

```python
# grpc_server.py（示意）
interceptors = [
    GrpcAuthInterceptor(
        token=settings.INTERNAL_GRPC_TOKEN,
        disabled=settings.GRPC_AUTH_DISABLED,
    ),
]
```

`settings.INTERNAL_GRPC_TOKEN` 的实际值一般放在 `.env`、Secret 或配置中心里。

两边的 token 是**部署时同步**的——通过 K8s Secret / 部署脚本 / 环境变量同步。运行时没有动态交换。

这种"对称共享密钥"模式的取舍：

```text
✅ 实现简单，足够覆盖两个后端内部互联
⚠️ 轮转密钥要双发同时改 + 重启
⚠️ 任一边泄露另一边也失守
```

更严密的方案是 mTLS / 短期 JWT / SPIFFE。当前场景两个后端内部互联，对称密钥成本最低。

## 主后端 / BFF 侧的对偶

**同一份 token，主后端 / BFF 那边在 config 读，每次发请求时塞进 metadata。**

如果主后端用 Go，那边也配同一份 token，发请求时把它放进 metadata：

```go
md := metadata.Pairs(
    "authorization", "Bearer "+viper.GetString("INTERNAL_GRPC_TOKEN"),
    "x-user-id", userId,
    "x-app-id", appId,
)
```

不是连通的密钥交换，是**两边各自持有同一份字符串**：

```text
       主后端 / BFF 这边                       Agent微服务 这边
    ┌────────────┐                          ┌──────────────────┐
    │ config 读  │       HTTP/2 +            │ 拦截器（验 token）  │
    │ 同一个 token│────── metadata ──────→   │ resolve_identity │
    │ 塞 metadata│                          │ (抽 user/app_id)  │
    └────────────┘                          └──────────────────┘
```

调用方的 token 和被调用方的 expected token 通过部署同步，没有运行时协议。

## 这一路下来鉴权相关的几个 status code

**拦截器抛 UNAUTHENTICATED；业务层抛 INVALID_ARGUMENT。其它按需查。**

gRPC 仿 HTTP 的设计，自己定义了一组 status code：

```text
OK                       成功
INVALID_ARGUMENT         参数有问题（业务层 abort 用这个）
UNAUTHENTICATED          调用方身份不合法（拦截器 abort 用这个）
PERMISSION_DENIED        身份合法但没权限做这事
NOT_FOUND                资源不存在
ABORTED                  操作被中止（常用在并发冲突）
FAILED_PRECONDITION      前置条件不满足
INTERNAL                 服务器内部错
```

这个鉴权模块里只用到了前两个：

```text
UNAUTHENTICATED   ← 拦截器   token 错 / 没传
INVALID_ARGUMENT  ← 业务层   x-user-id / x-app-id 缺失或重复
```

完整 list 在 `grpc.StatusCode` 枚举里，按需查阅。

### abort 的两个参数：分类 vs 提示词

`context.abort(...)` 跟 Python 的 `raise` 是一一对应的：

```python
await context.abort(
    grpc.StatusCode.UNAUTHENTICATED,   # ← 分类（status code / 异常类）
    "missing or invalid bearer token", # ← 提示词（写给人的具体原因）
)
```

```text
分类   = 这件事"大致"是什么性质    ← 决定客户端大方向（要不要重试 / 要不要重新登录）
提示词 = "具体"为什么 / 是什么     ← 写到日志、显示给开发、监控上报
```

分类是枚举（UNAUTHENTICATED / INVALID_ARGUMENT / NOT_FOUND / ...），字符串是自由写的。客户端收到时分类决定策略，提示词决定具体原因——两边各管各的。

## 测试鉴权

**覆盖 10 个分支：token 不传 / 错 / 重复，x-user-id 缺 / 空 / 重复，x-app-id 缺 / 重复。**

鉴权的测试主要覆盖：

```text
☐ 不传 authorization
☐ authorization 不对
☐ authorization 重复
☐ disabled=True 时所有都通过
☐ x-user-id 缺失 / 空字符串
☐ x-user-id 重复
☐ x-app-id 缺失（require_app_id=False）
☐ x-app-id 缺失（require_app_id=True）→ 拒
☐ x-app_id 重复
☐ 一切正常 → 放行
```

测试工具用 `grpc.aio` 的 test utilities：

```python
# 伪代码示意
from grpc_auth import GrpcAuthInterceptor, resolve_identity

async def test_no_authorization():
    interceptor = GrpcAuthInterceptor(token="expected")
    # 模拟 RPC 进来、metadata 没带 authorization
    # 期望 abort UNAUTHENTICATED

async def test_x_user_id_missing():
    # 模拟 metadata 只有 authorization，没有 x-user-id
    # 期望 abort INVALID_ARGUMENT
```
