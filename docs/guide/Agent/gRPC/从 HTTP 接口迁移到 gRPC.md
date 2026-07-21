# 从 HTTP 接口迁移到 gRPC：业务 Service 不应该重写

已有项目里一般不会从 0 写 gRPC。

更常见的情况是：HTTP 接口已经跑通了，后面因为服务拆分、跨语言调用、内部通信性能这些原因，再补一层 gRPC。

这时候最重要的不是“把所有业务用 gRPC 重写一遍”，而是把现有 HTTP 契约翻译成 `proto`，再让 gRPC 入口回到同一套业务 service。

核心原则是：

```text
HTTP router   → service

gRPC servicer → service
```

HTTP 和 gRPC 是两个入口，业务内核最好只有一套。

## 为什么已有 HTTP 项目还要接 gRPC

HTTP 很适合对外提供接口，尤其是给浏览器、前端、第三方调用。

但在后端服务之间，gRPC 会更常见，原因主要有几个：

```text
接口契约更明确
跨语言生成客户端更方便
请求和响应有类型约束
服务间调用更像本地函数调用
二进制编码更紧凑
流式 RPC 支持更自然
```

比如一个 Agent 系统，最开始可能只有 Python 后端提供 HTTP 接口：

```text
前端
→ HTTP
→ Agent 后端
→ LLM / Memory / DB / Workflow
```

后面系统拆开之后，可能变成：

```text
前端
→ 主后端 / BFF
→ gRPC
→ Agent 微服务
→ LLM / Memory / DB / Workflow
```

前端入口还是 HTTP，但主后端和 Agent 微服务之间改成 gRPC。

这种模式下，gRPC 是内部服务通信协议，不是直接面向用户的页面接口。

## HTTP 契约怎么翻译成 proto

迁移时可以先从 HTTP 契约出发。

HTTP 里的东西大概这样对应：

```text
HTTP path 参数      → request 字段
HTTP query 参数     → request 字段
HTTP body 字段      → request 字段
HTTP response data  → response 字段
HTTP status code    → gRPC status code
```

比如原来有一个 HTTP 接口：

```text
GET /v1/game/sessions/{session_id}
```

可以翻成：

```proto
service GameSessionService {
  rpc GetSession(GetSessionRequest) returns (GetSessionResponse);
}

message GetSessionRequest {
  string session_id = 1;
}

message GetSessionResponse {
  string session_json = 1;
}
```

这里用了 `session_json`，因为会话状态可能比较复杂。

一开始把复杂对象全拆成 proto message，成本会比较高。早期可以先用 JSON 字符串承载复杂结构，把链路跑通；等字段稳定之后，再逐步拆成更细的 proto 类型。

这不是最完美的建模，但很实用。

gRPC 接入早期，最容易犯的错误是上来就追求“所有字段都完美 proto 化”，结果业务没跑通，接口契约先变成负担。

更稳妥的节奏是：

```text
先让核心链路跑通
再稳定请求和响应字段
最后再精细化 proto message
```

## servicer 是协议适配层

Python 这边生成代码之后，会有一个 `Servicer` 基类。

业务代码里实现这个类，就相当于实现了 gRPC server 端的处理逻辑。

但 `servicer` 不适合写太多业务。

它更像一层适配：

```text
proto request
→ 转成项目里的 Pydantic / 普通参数
→ 调用现有 service
→ 把结果转成 proto response
```

大概结构：

```python
class GameSessionServicer(agent_pb2_grpc.GameSessionServiceServicer):
    async def GetSession(self, request, context):
        if not request.session_id:
            await context.abort(
                grpc.StatusCode.INVALID_ARGUMENT,
                "session_id is required",
            )

        identity = await resolve_identity(context)

        async with async_session() as db:
            service = GameSessionService(db)
            session = await service.get_session(
                user_id=identity.user_id,
                session_id=request.session_id,
            )

        return agent_pb2.GetSessionResponse(
            session_json=session.model_dump_json()
        )
```

这段里，gRPC 相关的部分主要是：

```text
request
context
context.abort
agent_pb2.GetSessionResponse
```

业务还是落在：

```python
service.get_session(...)
```

这个边界很重要。

HTTP 和 gRPC 只是两个入口，最后都应该回到同一个 service 层。

如果把业务逻辑写进 servicer，会有几个问题：

```text
HTTP 入口和 gRPC 入口行为容易不一致
同一套业务规则要维护两份
测试要重复写
后面换协议或新增入口很难收
```

servicer 应该做协议转换，不应该变成新的业务层。

## 错误也要翻译

HTTP 有自己的状态码，比如 `400`、`401`、`404`、`500`。

gRPC 也有自己的状态码，比如：

```text
INVALID_ARGUMENT
UNAUTHENTICATED
PERMISSION_DENIED
NOT_FOUND
ABORTED
FAILED_PRECONDITION
INTERNAL
```

所以挂 gRPC 的时候，异常也要做一层映射。

可以先按这个方向处理：

```text
ValueError                 → INVALID_ARGUMENT
ResourceNotFound           → NOT_FOUND
VersionConflict            → ABORTED / FAILED_PRECONDITION
未登录 / token 错          → UNAUTHENTICATED
无权限                    → PERMISSION_DENIED
未预期异常                → INTERNAL
```

代码里大概是：

```python
try:
    result = await service.apply_action(...)
except VersionConflict as e:
    await context.abort(grpc.StatusCode.ABORTED, str(e))
except ResourceNotFound as e:
    await context.abort(grpc.StatusCode.NOT_FOUND, str(e))
except ValueError as e:
    await context.abort(grpc.StatusCode.INVALID_ARGUMENT, str(e))
except Exception:
    await context.abort(grpc.StatusCode.INTERNAL, "internal server error")
```

如果这层不统一，调用方就很难稳定处理失败情况。

尤其是主后端 / BFF 这一层，它要把 gRPC 错误再翻译成前端能理解的 HTTP 响应。gRPC status code 如果乱抛，前端最终看到的错误格式也会混乱。

## 接入现有业务 Service

放到一个 Agent 微服务里看，原来的 HTTP 链路可能是：

```text
HTTP router
→ request schema
→ business service
```

gRPC 这边就是补一套入口：

```text
proto/agent/agent.proto
→ generated/agent/*_pb2.py
→ generated/agent/*_pb2_grpc.py
→ grpc servicer
→ business service
```

改 `proto` 后生成代码：

```bash
python scripts/gen_proto.py
```

然后在 `servicer` 里接到现有 service。

最后注册到 `grpc_server`：

```python
agent_pb2_grpc.add_GameSessionServiceServicer_to_server(
    GameSessionServicer(),
    grpc_server,
)
```

注册逻辑一般放在服务启动阶段。

整体链路是：

```text
主后端 / BFF
→ Agent gRPC client
→ Agent gRPC server
→ Agent servicer
→ business service
→ LLM / Memory / DB / Workflow
```

这里的关键不是把 gRPC “接上”就完了，而是让它接到正确的边界上。

最理想的情况是：

```text
HTTP 入口负责 HTTP 协议适配
gRPC 入口负责 gRPC 协议适配
业务 service 负责业务规则
```

## 接口按业务域拆分

gRPC 的 `service` 不一定要一个文件里塞所有 RPC。

比较自然的拆法是按业务域分 service。

比如：

```proto
service CreatorService {
  rpc ScriptChat(ScriptChatRequest) returns (ScriptChatResponse);
}

service PlayerAuthService {
  rpc Login(LoginRequest) returns (LoginResponse);
  rpc GetInfo(GetInfoRequest) returns (GetInfoResponse);
}

service GameSessionService {
  rpc CreateSession(CreateSessionRequest) returns (CreateSessionResponse);
  rpc GetSession(GetSessionRequest) returns (GetSessionResponse);
  rpc ApplyAction(ApplyActionRequest) returns (ApplyActionResponse);
  rpc PatchSession(PatchSessionRequest) returns (PatchSessionResponse);
}

service HealthService {
  rpc Check(HealthCheckRequest) returns (HealthCheckResponse);
}
```

这样拆有几个好处：

```text
接口边界更清楚
不同业务域可以独立演进
客户端生成代码后也更容易找方法
测试可以按业务域拆文件
```

会话类接口尤其容易牵涉几个问题：

```text
session_id 放在哪个 request 字段
version conflict 映射成哪个 gRPC status
session state 用 JSON 还是拆成 proto message
```

这些问题最好在 proto 设计阶段就先约定下来。

因为 proto 一旦被多个服务使用，字段调整成本会比单体内部函数签名高很多。

## 主后端 / BFF 侧怎么接

在常见架构里，前端请求先进主后端，再由主后端调用 Agent 微服务的 gRPC 接口：

```text
前端
→ 主后端 / BFF
→ Agent gRPC client
→ Agent 微服务 gRPC server
→ Agent business service
```

前端入口还是 HTTP，gRPC 在主后端和 Agent 服务之间。

Agent 这边的 `proto` 稳定之后，主后端同步同一份 `proto`。

如果主后端是 Go，就生成 Go client，再包一层 service：

```text
HTTP controller
→ application service
→ Agent gRPC client
→ Agent gRPC server
→ Agent business service
```

controller 里不应该散落一堆远程调用细节。

远程调用集中放在主后端的 service 层，后面换地址、换协议、加重试、加超时都比较好收。

## 为什么不让前端直接调用微服务

如果把链路改成：

```text
前端
→ Agent 微服务
```

表面上少了一层主后端 / BFF。

但系统整体成本不一定更低。

前端直接调微服务，会把很多原本可以集中在主后端里的问题暴露出来：

```text
认证鉴权要在每个微服务里重复处理
权限模型要暴露给微服务
CORS、token、session、安全策略要重复处理
前端要知道多个后端服务地址
接口变化会更直接影响前端
微服务暴露面变大
统一错误格式、日志、限流、审计更难集中做
```

所以前端直连微服务虽然可能少一次网络转发，但会增加前端和各个微服务的工程复杂度。

主后端 / BFF 这一层的运行时开销通常不是主要瓶颈。

如果主后端做的是：

```text
接收 HTTP 请求
校验 token
整理参数
调用 Agent gRPC 服务
返回结果
```

这类 HTTP、鉴权、路由、转发、聚合工作，本身就适合集中在 BFF 层处理。

尤其在 Agent / LLM 场景里，真正耗时的通常是：

```text
LLM 调用
Agent 推理
数据库查询
向量检索
外部 API
复杂业务逻辑
```

而不是 BFF 多出来的这一跳。

浏览器前端直接调用 gRPC 也不自然。

浏览器更适合使用：

```text
HTTP / REST
WebSocket
SSE
```

标准 gRPC 更适合后端服务之间调用。

如果一定要让前端调 gRPC，通常还要引入：

```text
gRPC-Web
Envoy / 代理层
前端 proto client 生成
额外的协议转换
```

这样反而会让链路变复杂。

所以当前更合理的分工是：

```text
前端 → 主后端 / BFF：面向页面的 HTTP / WebSocket / SSE 接口
主后端 / BFF → Agent 微服务：后端内部 gRPC 调用
Agent 微服务：专注 Agent、LLM、工作流、记忆等能力
```

也就是说，主后端 / BFF 在这里不只是简单转发层，而是：

```text
BFF
API Gateway
业务聚合层
统一认证鉴权层
```

判断标准可以先按这个来：

```text
前端页面直接需要的业务接口：
前端 → 主后端 / BFF → 微服务

后端内部能力调用：
主后端 / BFF / 其他服务 → gRPC → 微服务

长连接或流式输出：
前端 → 主后端 / BFF WebSocket / SSE → Agent 微服务流式接口
```

不建议一开始让前端直接感知太多微服务。

## 测试重点

gRPC 测试不是测模型效果，主要测协议适配有没有问题。

至少覆盖：

```text
正常请求
参数缺失
鉴权失败
资源不存在
会话版本冲突
JSON 序列化 / 反序列化
```

可以放在：

```text
tests/test_grpc_servicers.py
```

或者按业务域拆：

```text
tests/test_game_session_grpc.py
tests/test_player_auth_grpc.py
```

测试时重点看几件事：

```text
proto request 能不能正确转成业务参数
业务 service 的返回能不能正确转成 proto response
业务异常能不能映射成稳定的 gRPC status code
metadata 里的身份信息能不能被正确读取
流式接口能不能正确结束
```

如果 gRPC 层没有测试，最容易出现的问题不是“业务错了”，而是协议适配层漏字段、错字段、错误码不稳定。

## 小结

从 HTTP 接口迁移到 gRPC，本质不是换一种写业务的方式。

它更像是在已有业务 service 外面再补一个后端内部通信入口。

这条线要保持住：

```text
HTTP router   → service

gRPC servicer → service
```

HTTP 和 gRPC 可以共存。

协议入口可以多个，业务内核最好只有一套。

