# Web服务与业务开发

## 一、API 与 HTTP

**API 是什么**
- API 是系统对外提供的功能入口
- 前端或者其他服务可以通过 API 调用后端功能
- 不同的 API 一般对应不同的请求路径和业务功能

**HTTP 是什么**
- HTTP 是前后端之间常用的通信协议
- 它规定了请求和响应应该怎样传输
- 前端按照 HTTP 协议发送请求，后端处理后再返回 HTTP 响应

**一次 HTTP 请求中通常有什么**
- 请求方法：例如 `GET`、`POST`、`PUT`、`DELETE`
- 请求路径：例如 `/api/v1/chat/context`
- 请求参数：可能来自 body、query、path 或 form
- 请求头：可以携带 Token、数据格式等信息
- 请求体：用于携带 JSON、表单、文件或者其他数据

**请求体是什么**
- 请求体是 HTTP 请求中携带数据的部分
- JSON 是请求体的一种常见格式
- 请求体也可能是普通表单、文件上传或者二进制数据

---

## 二、请求参数的来源

**body 参数**
- 放在 HTTP 请求体中
- 常用于提交 JSON 或表单数据
- 后端需要把原始数据解析成能够处理的结构

**query 参数**
- 放在 URL 的 `?` 后面

例如：
```text
/users?page=1&size=10
```

**path 参数**
- 直接放在请求路径中

例如：
```text
/context/123
```

这里的 `123` 就可能是一个会话 ID。

**form 参数**
- 通过表单格式提交的数据
- 可以同时传普通文本参数和上传文件

---

## 三、JSON 与 Go 结构体

**JSON 和 Go struct 的关系**
- JSON 是前端常用的数据格式
- struct 是后端用来接收和处理数据的结构体
- 前端发送 JSON 后，后端会按照字段关系把 JSON 解析进 struct

**为什么需要结构体**
- 结构体可以明确每个字段的名字和类型
- 可以把原始请求数据整理成后端能够稳定处理的数据
- 方便 API 层、Service 层和其他模块之间传递

**请求对象是什么**
- 用来承载这次请求参数的结构体
- `Req` 一般表示请求参数
- `Resp` 一般表示返回结果

例如：
```go
req := chat.DeleteContextReq{}
```

表示：
- 创建一个空的 `DeleteContextReq` 请求结构体
- 后续把这次删除会话需要的参数解析进去

**前端 JSON 是怎样转换成 Go 结构体的**
```go
func DeleteContext(ctx *http.Context) (interface{}, error) {
	req := chat.DeleteContextReq{}
	if err := ctx.ParseBodyToStruct(&req); err != nil {
		return nil, err
	}

	req.UserId = ctx.UserId()
	return nil, chat.DeleteContext(&req)
}
```

处理过程是：
- `req := chat.DeleteContextReq{}`：创建一个空的请求结构体
- `ctx.ParseBodyToStruct(&req)`：把请求体中的 JSON 解析进 `req`
- 传入 `&req`：让解析函数可以直接修改原来的结构体
- `req.UserId = ctx.UserId()`：补充可信的用户身份
- `chat.DeleteContext(&req)`：把整理好的参数传给 Service 层

**结构体作为数据流转载体**
- 前端传来的 JSON、表单和文件属于原始请求数据
- API 层先对数据进行解析、校验和补充
- 再把需要继续处理的数据整理进结构体
- Service 层通过结构体获取这次业务需要的参数

---

## 四、HTTP Context

**`http.Context` 是什么**
- 这里的 `http.Context` 是项目中对当前 HTTP 请求的封装
- 它保存并提供处理当前请求需要的信息

**Context 里面通常有什么**
- 当前请求对象
- 响应输出对象
- body、query、path、form 等请求参数
- 当前登录用户的信息
- 请求路径和请求头
- 向前端返回响应需要的方法

**`ctx *http.Context` 是什么意思**
- `ctx` 是当前 HTTP 请求的上下文变量
- `*http.Context` 表示拿到的是这个请求上下文的地址
- API 函数可以通过 `ctx` 读取请求，也可以通过它返回响应

**HTTP Context 和业务 Context 的区别**
- HTTP Context：表示当前这一次 HTTP 请求
- 业务 Context：表示聊天会话、任务状态等业务数据
- 两者都叫 Context，但负责的内容不同

---

## 五、路由与 API 函数

**路由是什么**
- 路由负责把请求路径和 API 函数对应起来
- 写出一个 API 函数后，还需要注册路由，前端才能通过 URL 调用它

完整关系是：
```text
前端请求 URL
→ 路由匹配
→ 进入对应的 API 函数
→ API 函数处理请求
```

**请求方法和路由的关系**
- 同一个路径可以通过不同请求方法表示不同操作
- `GET`：查询数据
- `POST`：创建或提交数据
- `PUT`：更新数据
- `DELETE`：删除数据

---

## 六、Swagger 接口文档

**Swagger 注解是什么**
- 用来描述接口并生成接口文档的规范注释
- 可以说明接口名称、参数、返回结果和请求路径

**`@Summary`、`@Param`、`@Router` 是什么**
- 都是 Swagger 使用的固定标签
- 标签本身有固定规范
- 标签后面的具体内容由项目开发者填写

常见作用：
- `@Summary`：说明接口主要功能
- `@Param`：说明接口参数
- `@Router`：说明请求路径和请求方法

**Swagger 和路由注册的区别**
- Swagger 注解主要用于生成接口文档
- 真正决定 URL 调用哪个函数的，是项目中的路由注册代码
- Swagger 描述接口，Router 代码真正连接接口

---

## 七、API 层与 Service 层

**API 层负责什么**
- 接收 HTTP 请求
- 从 body、query、path 或 form 中解析参数
- 把参数转换成结构体或者对应的值
- 校验参数是否合法
- 补充用户身份、默认值等可信参数
- 调用 Service 层
- 返回业务数据或者错误

**Service 层负责什么**
- 执行真正的业务逻辑
- 根据参数判断业务应该怎样处理
- 调用数据库、缓存或者外部服务
- 组织最终的业务结果
- 把结果或者错误返回给 API 层

**为什么要分成 API 层和 Service 层**
- API 层负责处理请求入口
- Service 层负责处理业务
- 两层分开后，接口处理和业务逻辑不会全部混在一起
- 后续修改接口或者复用业务逻辑时会更方便

**为什么 API 层看起来像在转发**
- API 层一般不会承担复杂的核心业务
- 它主要负责为 Service 层准备正确、可信、格式统一的参数
- 然后调用 Service 层完成真正的业务处理

---

## 八、调用不同包中的函数

**`chat.SetStoryLine` 是不是自己调用自己**
- 不是
- 当前 API 函数和 `chat.SetStoryLine` 属于不同的包
- 即使函数名字相同，只要包不同，就是两个不同的函数

例如：
```go
func SetStoryLine(ctx *http.Context) (interface{}, error) {
	var form chat.SetStoryLineReq
	if err := ctx.ParseBodyToStruct(&form); err != nil {
		return nil, err
	}

	form.UserId = ctx.UserId()
	return nil, chat.SetStoryLine(&form)
}
```

这里：
- 当前的 `SetStoryLine` 是 API 层函数
- `chat.SetStoryLine(&form)` 是 Service 包中的业务函数
- API 层准备参数后，再调用 Service 层完成设置故事线的业务

---

## 九、可信用户身份注入

**用户 ID 是怎样注入的**
```go
req.UserId = ctx.UserId()
```

表示：
- 从当前请求上下文中获取已经登录用户的真实 ID
- 再把这个 ID 写进请求结构体
- Service 层后续根据这个 ID 处理当前用户的数据

**为什么 `ctx.UserId()` 是可信的**
- 用户身份不是直接相信前端 JSON 中传来的值
- 一般由鉴权流程验证 Token 后得到
- 验证成功后，再把真实用户 ID 保存进当前 HTTP Context

完整过程可以理解成：
```text
前端携带 Token
→ 鉴权中间件验证 Token
→ 得到真实用户身份
→ 把 UserId 写进 HTTP Context
→ API 通过 ctx.UserId() 获取
→ 写入请求结构体
```

**中间件是什么**
- 中间件是在请求进入具体 API 函数之前统一执行的处理
- 常用于鉴权、日志、跨域和请求信息记录
- 多个 API 都需要的公共逻辑，可以放进中间件统一完成

---

## 十、参数校验与默认值

**为什么需要参数校验**
- 前端可能漏传参数
- 可能传入错误类型
- 文件可能为空或者过大
- 参数可能不符合业务要求
- 如果不校验，错误数据会继续进入 Service 层

**默认值是什么**
- 当前端没有传某个可选参数时，后端自动使用预设值

例如：
```go
language := ctx.DefaultPostForm("language", "zh-CN")
```

表示：
- 前端传了 `language`，就使用前端传入的值
- 前端没有传，就默认使用 `zh-CN`

**API 层为什么要补充参数**
- 前端只负责传用户能够决定的数据
- 用户 ID、服务器配置等可信信息由后端补充
- API 层把这些信息整理完整后，再传给 Service 层

---

## 十一、HTTP 状态与项目错误

**`ctx.BadRequest()` 是什么**
- 表示当前请求的参数或者格式不符合要求
- 一般对应 HTTP 状态码 `400`

**项目里的错误对象**
- `ErrorInvalidParams`：请求参数不合法
- `ErrorInternal`：服务器内部处理失败

错误处理过程可以理解成：
```text
发生错误
→ 返回项目中的错误对象
→ 上层统一处理错误
→ 按照规定格式返回给前端
```

**错误提前返回**
- 参数解析、校验或者业务调用失败后，立即 `return`
- 当前函数结束
- 后面的业务逻辑不会继续执行
- 防止错误数据继续向后传递

---

## 十二、一次请求的完整处理流程

```text
客户端按照 HTTP 协议发送请求
→ 路由找到对应的 API 函数
→ 中间件完成鉴权等公共处理
→ API 从 body、query、path 或 form 中解析参数
→ 把参数转换成 Go 结构体
→ 校验参数并补充可信的 UserId、默认值等数据
→ 把整理好的结构体传给 Service 层
→ Service 执行真正的业务逻辑
→ 返回业务结果或者错误
→ 后端按照统一格式响应前端
```

以删除会话为例：
```text
前端发送删除会话请求
→ 路由进入 DeleteContext
→ JSON 被解析成 DeleteContextReq
→ 从 ctx 中获取可信的 UserId
→ 调用 Service 层的 DeleteContext
→ Service 判断会话是否属于当前用户
→ 执行删除操作
→ 返回成功结果或者错误
```
