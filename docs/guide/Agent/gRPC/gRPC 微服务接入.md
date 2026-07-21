# gRPC 微服务接入：从 proto 到 stub / servicer

gRPC 属于服务间通信这一层。

一个系统拆成多个服务之后，马上会遇到一个基础问题：服务 A 怎么稳定调用服务 B？

最常见的方式是 HTTP：

```text
service A
→ HTTP request
→ service B
→ HTTP response
```

gRPC 解决的也是同一类问题。区别在于，它的组织方式更偏工程化：先用 `proto` 把接口契约写清楚，再根据这个契约生成不同语言的调用代码。

也就是说，gRPC 关心的不是业务本身，而是服务之间怎么把一次调用说清楚：

```text
调用哪个方法
传什么参数
返回什么结构
失败时用什么错误码
```

这也是它适合微服务的原因。接口不是靠“大家约定一个 JSON 长什么样”，而是先写成一份明确的 `proto` 文件。

## gRPC 不是一个实体服务

gRPC 不是项目里某个具体的业务服务。

它更像一套远程调用框架。

普通 Python 本地调用大概是：

```python
response = await chat_service.chat(request)
```

这里的 `chat_service` 就在当前进程里，函数可以直接调。

但如果 `chat` 这个能力在另一个进程、另一台机器、另一个后端服务里，本地代码就不能直接调用它。

gRPC 做的事情，是把远程调用包装成类似函数调用的形式：

```python
response = await client.Chat(request)
```

这行看起来像普通函数调用，但背后其实是一次网络请求：

```text
client.Chat(request)
→ protobuf 编码 request
→ 通过网络发到 gRPC server
→ server 找到对应的 Chat 方法
→ 执行业务逻辑
→ protobuf 编码 response
→ 返回给 client
```

所以 gRPC 不是单个东西，而是一套组合：

```text
proto 文件       # 定义接口契约
client stub      # 客户端调用入口
server           # 接收 RPC 请求
servicer         # 服务端方法实现
protobuf         # 请求和响应的编码格式
```

放到一个 Agent 微服务里，对应关系大概是：

```text
proto 文件：
proto/agent/agent.proto

客户端 stub：
AgentServiceStub

服务端实现：
AgentServicer.Chat

真正业务逻辑：
ChatService.chat
```

这里要分清楚一层：

```text
gRPC 本身不是业务逻辑
gRPC 是客户端和服务端之间的远程调用通道
```

`response = await client.Chat(request)` 这行代码里，gRPC 隐藏了“怎么发请求、怎么编码、怎么解析返回”的细节。

## HTTP API 和 gRPC 的位置

HTTP 里，一个接口通常长这样：

```text
POST /v1/chat
Content-Type: application/json

{
  "user_id": "u_001",
  "session_id": "s_001",
  "message": "你好"
}
```

它靠 URL、method、header、body 组合出一次调用。

gRPC 里，同样的能力会被写成：

```proto
service AgentService {
  rpc Chat(ChatRequest) returns (ChatResponse);
}

message ChatRequest {
  string user_id = 1;
  string session_id = 2;
  string message = 3;
}

message ChatResponse {
  string reply = 1;
}
```

这里的 `service` 表示一组接口，`rpc` 表示其中一个方法，`message` 表示请求和响应的数据结构。

所以从工程视角看，HTTP 和 gRPC 都是入口层：

```text
HTTP router   → service

gRPC servicer → service
```

真正的业务逻辑不应该因为换了协议就重写一遍。

## proto 是接口契约

`proto` 是 gRPC 的核心。

它把接口写成一种语言无关的格式，然后再生成 Python、Go、Java 等不同语言的代码。

比如 Agent 服务用 Python 写，主后端用 Go 写，只要两边拿到同一份 `proto`，就能生成各自语言里的类型和 client：

```text
proto/agent/agent.proto
├─ Python: *_pb2.py / *_pb2_grpc.py
└─ Go:     *.pb.go / *_grpc.pb.go
```

这个契约的价值在于：

```text
Python 服务端知道自己要实现哪些 RPC
Go 客户端知道自己能调用哪些方法
请求和响应字段在生成代码里都有类型
```

这比手写 HTTP JSON 更强约束一些。

HTTP 也能做得很规范，比如 OpenAPI / Swagger，但 gRPC 从一开始就是按“接口契约 + 代码生成”这条路设计的。

## protobuf 负责数据编码

`proto` 是写接口契约的文件，`protobuf` 是真正负责数据编码的格式。

在代码里，请求对象可能长这样：

```python
request = ChatRequest(
    user_id="u_001",
    session_id="s_001",
    message="你好",
)
```

这个对象不能原样在网络上传。

发送前要先被编码成一串 bytes：

```text
ChatRequest 对象
→ protobuf 编码
→ bytes
→ 网络传输
```

服务端收到之后，再按照同一份 `proto` 定义解回来：

```text
bytes
→ protobuf 解码
→ ChatRequest 对象
→ AgentServicer.Chat(request, context)
```

所以 `protobuf` 解决的是“数据怎么在网络上传”的问题。

和 JSON 对比会更直观。

JSON 传输时大概是：

```json
{
  "message": "你好",
  "user_id": "u_001"
}
```

它主要靠字段名通信，比如 `"message"`、`"user_id"`。

protobuf 更依赖字段编号。

比如：

```proto
message ChatRequest {
  string user_id = 1;
  string session_id = 2;
  string message = 3;
}
```

这里的：

```proto
string message = 3;
```

表示：

```text
代码里字段名叫 message
字段类型是 string
传输时字段编号是 3
```

字段名主要给人和生成代码看，真正编码时更核心的是字段编号。

这也是为什么 `proto` 里的字段编号不能随便改。字段名改了还能通过兼容策略处理，字段编号乱改就可能导致新旧服务解码错位。

简化理解：

```text
protobuf = 更紧凑、更严格的 JSON 替代格式
gRPC = 基于 protobuf 做远程函数调用的一套通信框架
```

## service / rpc / message 只是定义

`proto` 里的这些写法不是初始化对象，也不是运行时代码。

比如：

```proto
service AgentService {
  rpc Chat(ChatRequest) returns (ChatResponse);
}
```

这段是在定义接口规则：

```text
服务名：AgentService
方法名：Chat
入参类型：ChatRequest
返回类型：ChatResponse
```

`ChatRequest` 和 `ChatResponse` 一般会在同一个 proto 文件里定义：

```proto
message ChatRequest {
  string user_id = 1;
  string session_id = 2;
  string message = 3;
}

message ChatResponse {
  string reply = 1;
}
```

所以 `rpc Chat(ChatRequest) returns (ChatResponse)` 里的两个名字，是在引用前面定义好的 message 类型。

放到 Python 里，大概接近这种函数签名：

```python
async def Chat(request: ChatRequest) -> ChatResponse:
    ...
```

区别是，Python 函数是在本地进程里调用；`proto` 里的 `rpc` 定义的是远程服务方法。

## 生成出来的 Python 文件

`.proto` 文件本身不能直接被 Python 当成代码执行。

改完 proto 后，需要生成 Python 文件。

通常会生成两类：

```text
agent_pb2.py
agent_pb2_grpc.py
```

它们分工不一样。

`agent_pb2.py` 主要负责 message：

```text
ChatRequest
ChatResponse
```

也就是请求对象和响应对象。

`agent_pb2_grpc.py` 主要负责 service：

```text
AgentServiceStub
AgentServiceServicer
add_AgentServiceServicer_to_server
```

也就是客户端代理、服务端基类、注册函数。

项目里导入生成代码一般会长这样：

```python
from generated.agent import agent_pb2, agent_pb2_grpc
```

然后就可以在 Python 里创建请求对象：

```python
request = agent_pb2.ChatRequest(
    user_id="u_001",
    session_id="s_001",
    message="你好",
)
```

也可以创建客户端 stub：

```python
client = agent_pb2_grpc.AgentServiceStub(channel)
```

生成代码的作用，就是把 `proto` 里的规则变成 Python 能直接使用的类和方法。

## 客户端：channel 和 stub

客户端这边一般是三步：

```text
创建 channel
创建 stub
调用 RPC 方法
```

代码大概是：

```python
async with grpc.aio.insecure_channel("127.0.0.1:50051") as channel:
    client = agent_pb2_grpc.AgentServiceStub(channel)

    request = agent_pb2.ChatRequest(
        user_id="u_001",
        session_id="s_001",
        message="你好",
    )

    response = await client.Chat(request)
```

`grpc.aio.insecure_channel("127.0.0.1:50051")` 创建的是到服务端的连接通道。

这里几个词拆开看：

```text
grpc：gRPC 框架
aio：异步版本
insecure_channel：不带 TLS 的连接通道
127.0.0.1:50051：服务端地址
```

`channel` 是连接。

`stub` 是基于这条连接创建出来的客户端代理。

所以这行：

```python
response = await client.Chat(request)
```

看起来像普通方法调用，实际会走网络。

`await` 表示这里要等服务端返回结果。

## 服务端：继承 Servicer，实现 RPC 方法

服务端这边会继承生成代码里的 `Servicer` 基类。

比如：

```python
class AgentServicer(agent_pb2_grpc.AgentServiceServicer):
    async def Chat(self, request, context):
        ...
```

`AgentServiceServicer` 是生成出来的服务端基类。

`AgentServicer` 是项目里自己写的实现类。

因为 proto 里定义了：

```proto
service AgentService {
  rpc Chat(ChatRequest) returns (ChatResponse);
}
```

所以服务端实现类里就要实现对应的 `Chat` 方法。

`request` 是客户端发来的 `ChatRequest` 对象。

`context` 是这次 gRPC 请求的上下文，可以拿 metadata，也可以返回错误状态。

比如参数缺失时：

```python
if not request.message:
    await context.abort(
        grpc.StatusCode.INVALID_ARGUMENT,
        "message is required",
    )
```

真正业务逻辑还是继续往 service 层走：

```python
result = await chat_service.chat(
    user_id=request.user_id,
    session_id=request.session_id,
    message=request.message,
)
```

最后再组装成 proto response：

```python
return agent_pb2.ChatResponse(
    reply=result.reply,
)
```

## 客户端、通信层、服务端的分工

这里最好分成三个区域看，不然很容易把 `client.Chat`、`AgentServicer.Chat`、`ChatResponse` 混在一起。

### 客户端做的

客户端主要负责发起远程调用：

```text
创建 ChatRequest
创建 channel
创建 stub
调用 client.Chat(request)
等待 ChatResponse
读取 response.reply
```

代码大概是：

```python
async with grpc.aio.insecure_channel("127.0.0.1:50051") as channel:
    client = agent_pb2_grpc.AgentServiceStub(channel)

    request = agent_pb2.ChatRequest(
        user_id="u_001",
        session_id="s_001",
        message="你好",
    )

    response = await client.Chat(request)
    print(response.reply)
```

这里的重点是：

```text
client.Chat(request)
= 客户端发起远程调用
```

它看起来像调用本地函数，实际会走网络。

### 中间 gRPC / protobuf 做的

这一层一般不会在业务代码里显式出现，但它实际做了很多事：

```text
把 request 对象编码成二进制
通过网络发出去
服务端解码成 request 对象
服务端返回 response 对象
编码成二进制
客户端解码成 response 对象
```

也就是：

```text
request 对象
→ protobuf bytes
→ 网络
→ protobuf bytes
→ request 对象

response 对象
→ protobuf bytes
→ 网络
→ protobuf bytes
→ response 对象
```

protobuf 负责对象和二进制之间的转换。

gRPC 负责远程调用的通道、方法路由、请求响应这些运行机制。

### 服务端做的

服务端负责接住远程调用，然后转到业务逻辑。

代码大概是：

```python
class AgentServicer(agent_pb2_grpc.AgentServiceServicer):
    async def Chat(self, request, context):
        result = await chat_service.chat(
            user_id=request.user_id,
            session_id=request.session_id,
            message=request.message,
        )

        return agent_pb2.ChatResponse(
            reply=result.reply,
        )
```

这里的重点是：

```text
AgentServicer.Chat(request, context)
= 服务端接收并处理远程调用
```

`request` 已经是 gRPC 解码后的 `ChatRequest` 对象。

`context` 是这次 RPC 的上下文，可以拿 metadata，也可以用来返回错误状态。

服务端最后这句：

```python
return agent_pb2.ChatResponse(...)
```

只是创建并返回一个响应对象。

它不是远程调用。

真正的远程调用发生在客户端这一边：

```python
response = await client.Chat(request)
```
