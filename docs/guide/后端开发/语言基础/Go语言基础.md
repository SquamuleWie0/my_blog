# Go语言与代码机制

## 一、包、文件与导入

**`package` 是什么**
- 表示当前 Go 文件属于哪个包
- 同一个文件夹下面的一组 Go 文件，一般会共同组成一个包
- 同一个包里的多个文件虽然分开编写，但代码可以互相调用

**`import` 是什么**
- 把其他包里的功能引入当前文件使用
- 可以理解成当前文件需要使用的外部依赖

**package 和文件夹的关系**
- 一般情况下，一个文件夹对应一个包
- 一个文件夹中的多个 `.go` 文件会一起组成这个包
- `import` 导入的是整个包，不是单独导入某个 `.go` 文件

**导入包别名**
```go
errors2 "包路径"
```
- 表示给导入的包取一个新的名字 `errors2`
- 后续通过 `errors2.ErrorInvalidParams` 使用这个包里的内容
- 一般是为了避免不同包之间出现重名

---

## 二、变量声明与赋值

**`var` 是什么**
- `var` 用来声明变量
```go
var req chat.ChatReq
```
- 声明一个叫 `req` 的变量
- 规定它的类型是 `chat.ChatReq`
- 没有主动赋值时，会先使用这个类型对应的空值

**`:=` 是什么**
- 声明变量并赋值的简写
```go
contextId, err := ctx.SfID("contextId")
```
- 声明 `contextId` 和 `err`
- 分别接收函数返回的两个结果

**`=` 和 `:=` 的区别**
- `:=`：声明新变量并赋值
- `=`：给已经存在的变量重新赋值
- 使用 `:=` 时，左边至少要有一个新变量
```go
conn, err := chat.WsUpgrader.Upgrade(...)
```
- `conn` 是新变量
- `err` 已经存在
- 因为左边有新的 `conn`，所以仍然可以使用 `:=`

---

## 三、指针与结构体

**`*` 是什么**
- 表示指针
- 拿到的是变量的地址，不是复制出来的值
```go
ctx *http.Context
```
- `ctx` 是一个指向 `http.Context` 的指针
- 函数拿到的是当前请求上下文的地址

**`&` 是什么**
- 表示取地址
- 把变量的内存地址传给其他函数
```go
ctx.ParseBodyToStruct(&req)
```
- 传入 `&req`，是为了让解析函数把请求数据直接写进原来的 `req` 结构体

**值传递和指针传递**
- 值传递：复制一份数据传进去
- 指针传递：把原数据的地址传进去
- 使用指针后，函数具备读取或者修改原数据的能力
- 是否真的修改，还要看函数内部的代码

**结构体复制和修改原对象**
- 不使用指针，通常传入的是结构体副本
- 使用指针，传入的是原结构体的地址

**`&Type{...}` 是什么**
```go
&chat.TranscribeSpeechRequest{
	Filename: file.Filename,
	Audio:    audioData,
	Language: language,
}
```
- 创建一个 `TranscribeSpeechRequest` 结构体
- 给里面的字段赋值
- 直接取得这个结构体的地址
- 把地址传给后续函数

---

## 四、空值与通用类型

**`nil` 是什么**
- 表示当前没有有效的数据、对象或者结果
- 后端代码中经常用来表示没有返回数据或者没有发生错误
```go
return nil, err
```
- 没有正常数据
- 发生了错误
```go
return result, nil
```
- 有正常数据
- 没有发生错误
- `nil` 一般用于指针、切片、map、interface、函数和 channel 等类型
- 普通的 `int`、`bool` 和结构体不能直接等于 `nil`

**`interface{}` 是什么**
- 可以接收任意类型的数据
- 所以 `(interface{}, error)` 的第一个返回值可以放不同类型的业务结果

---

## 五、多返回值与错误处理

**Go 多返回值是什么**
- Go 函数可以同时返回多个结果
- 后端代码中最常见的是同时返回业务数据和错误

**`(interface{}, error)` 是什么意思**
- 第一个返回值是业务数据
- 第二个返回值是错误信息

**多个返回值怎么接收**
```go
contextId, err := ctx.SfID("contextId")
```
- 第一个返回值交给 `contextId`
- 第二个返回值交给 `err`

**`_` 是什么**
- `_` 叫空白标识符
- 表示函数返回了这个值，但当前代码不需要使用，直接丢弃
```go
if _, err = chat.GetChatContext(contextId, userId); err != nil {
	return nil, err
}
```
- `GetChatContext` 会返回会话数据和错误
- 当前代码只想校验会话是否存在、是否属于用户
- 不需要使用会话数据，所以用 `_` 丢弃
- 只保留 `err` 判断是否出错

**`error` 是什么**
- 表示函数执行过程中是否发生错误
- `err == nil`：没有错误
- `err != nil`：发生了错误

**`if err != nil` 是什么意思**
```go
if err != nil {
	return nil, err
}
```
- 前面的操作发生了错误
- 立即返回具体错误
- `return` 执行后，当前函数直接结束
- 后面的代码不会继续运行

**`if 初始化语句; 条件`**
```go
if err := ctx.ParseBodyToStruct(&req); err != nil {
	return nil, err
}
```
可以理解成：
```go
err := ctx.ParseBodyToStruct(&req)
if err != nil {
	return nil, err
}
```
- 第一种写法中的 `err` 只在当前 `if` 里面使用

**三种常见返回方式**
```go
return result, nil
```
- 成功
- 有业务数据
- 没有错误
```go
return nil, nil
```
- 成功
- 没有需要返回的数据
- 没有错误
```go
return nil, err
```
- 失败
- 没有正常业务数据
- 返回具体错误

**为什么可以直接返回业务函数**
```go
return nil, chat.SetStoryLine(&form)
```
- 当前函数需要返回 `(数据, error)`
- `chat.SetStoryLine(&form)` 本身返回的就是 `error`
- 所以可以直接作为第二个返回值

---

## 六、控制逻辑与资源清理

**`||` 是什么**
- 表示逻辑“或”
- 两个条件中只要有一个成立，整个条件就成立
```go
if file.Size <= 0 || file.Size > chat.MaxSpeechAudioBytes {
	return nil, errors2.ErrorInvalidParams
}
```
- 文件为空，或者文件超过最大大小
- 只要出现其中一种情况，就返回参数错误

**错误提前返回**
- 参数错误、文件读取失败或者业务调用失败时，直接 `return`
- 当前函数立即结束
- 后面的业务逻辑不会继续执行
- 可以防止错误数据继续往后传

**`defer` 是什么**
- 表示把某个操作推迟到当前函数结束前执行
```go
defer src.Close()
```
- 当前函数结束前关闭文件
- 即使中途因为错误提前 `return`，也会执行关闭操作
- 避免文件资源一直被占用

---

## 七、函数、字段和方法的调用

**不同包可以有同名函数**

API 层可能有：
```go
func SetStoryLine(ctx *http.Context) (interface{}, error)
```

函数内部又调用：
```go
chat.SetStoryLine(&form)
```

它们不是自己调用自己：
- 当前的 `SetStoryLine` 属于 API 包
- `chat.SetStoryLine` 属于导入的 Service 包
- 包不同，所以是两个不同的函数

**点号调用链怎么理解**
- 点号后面可能是包中的变量或者函数
- 也可能是结构体字段或者对象方法

**调用包中的函数**
```go
chat.DeleteContext(&req)
```
- `chat`：包
- `DeleteContext`：这个包里的函数

**调用变量的方法**
```go
ctx.UserId()
```
- `ctx`：当前请求上下文变量
- `UserId()`：它可以调用的方法

**访问结构体字段**
```go
file.Size
```
- `file`：文件对象
- `Size`：文件对象中的大小字段

**逐层访问字段**
```go
global.GVA_CONFIG.BusinessAi.SpeechProvider
```
- `global`：包
- `GVA_CONFIG`：包里的全局配置变量
- `BusinessAi`：总配置中和 AI 业务有关的部分
- `SpeechProvider`：决定语音服务商的字段

**对象方法调用**
```go
chat.WsUpgrader.Upgrade
```
- 找到 `chat` 包
- 找到包里的 `WsUpgrader`
- 调用它的 `Upgrade` 方法

---

## 八、字节数据

**`byte` 是什么**
- `byte` 表示一个字节
- 8 个二进制位组成一个字节

**`[]byte` 是什么**
- `[]byte` 表示一组字节
- 可以保存音频、图片或者其他文件的二进制内容

**音频文件在计算机中怎么保存**
- 音频文件底层也是由 `0` 和 `1` 组成的二进制数据
- 程序一般按照字节读取，不是一个二进制位一个二进制位地处理
- MP3、WAV 等格式规定了这些字节应该怎样组织和解释
- 音频文件不是二进制源码，而是按照音频格式保存的二进制字节数据