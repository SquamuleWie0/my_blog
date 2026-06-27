# Python 最小必备语法笔记

## 1. Python 是什么

Python 是一门编程语言。  
主要用它来做：

- 写后端接口
- 处理请求数据
- 调模型 API
- 操作数据库
- 写测试代码


# 2. 变量

## 定义

变量就是给一个值起名字。
```python
name = "user"  
age = 18  
is_ok = True
```
## 理解

变量像一个“标签”，真正的数据存在变量里。

例如：

```python
resp = client.post("/app/completion")
```

这里：

- `resp` 是变量名
- 它里面装的是一个响应对象


# 3. 常见数据类型

## 3.1 字符串 `str`

```python
text = "hello"
```

常见操作：
```python
name = "user"  
msg = "hello " + name
```

## 3.2 整数 `int`

```python
count = 10
```


## 3.3 浮点数 `float`
```python
price = 9.9
```


## 3.4 布尔值 `bool`
```python
is_success = True  
is_error = False
```

## 3.5 空值 `None`

表示“没有值”。

```python
value = None
```

在后端里很常见：
```python
if query is None:  
    ...
```

# 4. 容器类型

## 4.1 列表 `list`

有顺序的一组数据。
```python
items = [1, 2, 3]  
names = ["a", "b", "c"]

# 取值：

print(items[0])

# 遍历：

for item in items:  
    print(item)
```


## 4.2 字典 `dict`

键值对结构，非常重要。
```python
user = {  
    "name": "user",  
    "age": 18  
}

# 取值：

user["name"]  
user.get("name")
```

区别：

- `user["name"]`：键不存在会报错
- `user.get("name")`：键不存在返回 `None`

在后端里很常见，因为 JSON 进 Python 后通常就是 dict。

例如：
```python
data = request.json  
message = data.get("message")
```

# 5. 条件判断

## `if`
```python
if age >= 18:  
    print("成年人")
```
## `if / else`
```python
if age >= 18:  
    print("成年人")  
else:  
    print("未成年")
```
## `if / elif / else`

```python
if score >= 90:  
    print("A")  
elif score >= 60:  
    print("及格")  
else:  
    print("不及格")
```
后端常见：
````python
if not message:  
    return {"code": "fail", "message": "message不能为空"}
````

# 6. 循环

## `for`

最常用。
```python
for item in [1, 2, 3]:  
    print(item)
```

遍历列表很常见。


## `while`

满足条件就一直执行。
```python
i = 0  
while i < 3:  
    print(i)  
    i += 1
```

当前后端学习里优先掌握 `for` 就够了。


# 7. 函数

## 定义函数
```python
def say_hello():  
    print("hello")
```
## 带参数
```python
def say_hello(name):  
    print("hello", name)
```
## 返回值
```python
def add(a, b):  
    return a + b
```
调用：
```python
result = add(1, 2)
```
## 理解

函数就是把一段逻辑封装起来，方便重复使用。

后端里很常见：

- 校验函数
- 处理业务逻辑函数
- 响应封装函数

例如：
```python
def success(data=None, message="success"):  # 给参数设置默认值
    return {  
        "code": "success",  
        "message": message,  
        "data": data or {}  
    }
```

# 8. 模块 module

## 定义

一个 `.py` 文件就是一个模块。

例如：

- `app.py`
- `response.py`
- `models.py`

## 模块里可以放

- 变量
- 函数
- 类

## 导入
```python
# 导入整个模块
import os  
# 后续调用这个模块里面具体的工具
os.getenv(...)


# 导入模块里的某个具体东西
from response import Response
# 后续调用就直接用了
Response
```
理解：

> 模块是组织代码的最基本单位。


# 9. 类 class

## 定义

类是模板 / 蓝图
```python
class Student:  
    def __init__(self, name):  
        self.name = name
```
这里 `Student` 是类

## 理解

类规定了：

- 这个东西有哪些数据
- 这个东西有哪些行为


# 10. 对象 object

## 定义

对象是根据类创建出来的具体实例。
```python
s1 = Student("user")
```

这里：

- `Student` 是类
- `s1` 是对象

## 理解

类像图纸，对象像按图纸造出来的具体东西。

后端里很多东西都是对象，比如：

- `resp`
- `request`
- `client`
- 数据库模型实例


# 11. 属性 attribute

属性是对象身上的数据。
```python
s1.name  
resp.status_code
```
这里：

- `name`
- `status_code`

都是属性。

理解：

> 属性就是对象“带着的数据”。


# 12. 方法 method

方法是写在类里面的函数。
```python
class Student:  
    def introduce(self):  
        print(self.name)
```
调用：

```python
s1.introduce()
```

理解：

> 方法就是对象能做的动作。


# 13. 成员 member

成员是类或对象里内容的统称，通常包括：

- 属性
- 方法

当前阶段可以简单理解成：

> 类或对象里面定义的东西，都可以叫成员。


# 14. `self` 是什么

`self` 可以先理解成：

> 当前这个对象自己

例如：
```python
class Student:  
    def __init__(self, name):  
        self.name = name
```

这里的意思是：

- 把传进来的 `name`
- 存到这个对象自己的 `name` 属性里

如果创建两个对象：
```python
s1 = Student("user")  
s2 = Student("tom")
```
那么：

- `s1.name` 是 `"user"`
- `s2.name` 是 `"tom"`

说明每个对象都有自己的数据。


# 15. `__init__` 是什么

这是类的初始化方法。  
创建对象时会自动执行。
````python
class Student:  
    def __init__(self, name):  
        self.name = name
````
调用：

```python
s1 = Student("user")
```

创建 `s1` 的时候，`__init__` 会自动运行。


# 16. `super()` 是什么

先记简单版：

> 用来调用父类的内容

例如：
```python
class Http(Flask):  
    def __init__(self, *args, **kwargs):  
        super().__init__(*args, **kwargs)
```
这里的意思是：

> `Http` 继承了 `Flask`，所以先调用一下 Flask 本身的初始化逻辑

当前阶段先理解到这层就够。


# 17. 点号 `.` 是什么

`.` 可以理解成：

> 从当前这个东西里面继续往下找属性 / 方法 / 成员

例如：
```python
resp.status_code  
resp.json.get("code")  
os.getenv("FLASK_ENV")  
HttpCode.VALIDATE_ERROR
```
拆解思路：

## 17.1 `resp.status_code`

- `resp`：对象
- `status_code`：属性

## 17.2 `resp.json.get("code")`

- `resp`：对象
- `json`：属性
- `get()`：方法

## 17.3 `os.getenv("FLASK_ENV")`

- `os`：模块
- `getenv`：模块里的函数

## 17.4 `HttpCode.VALIDATE_ERROR`

- `HttpCode`：类
- `VALIDATE_ERROR`：类里的成员/常量


# 18. 属性和方法怎么区分

## 属性

一般没有 `()`
```python
resp.status_code  
resp.json
```

## 方法

一般有 `()`
```python
client.post("/xx")  
data.get("code")
```

速记：

> 没括号通常是属性，有括号通常是在调用函数/方法。


# 19. 函数 和 方法的区别

## 函数

独立写的。
```python
def add(a, b):  
    return a + b
```
## 方法

写在类里面的函数。
```python
class Student:  
    def introduce(self):  
        print(self.name)
```


# 20. 异常处理

## 基本写法
```python
try:  
    x = 1 / 0  
except Exception as e:  
    print("出错了", e)
```
## 理解

异常处理的作用是：

- 接住错误
- 防止程序直接崩掉
- 按规则返回错误信息

在后端里很重要：
```python
try:  
    result = do_something()  
    return {"code": "success", "data": result}  
except Exception as e:  
    return {"code": "fail", "message": str(e), "data": {}}
```

# 21. `isinstance()` 是什么
```python
isinstance(error, CustomException)
```
意思是：

> 判断 `error` 是否是 `CustomException` 这个类型

常用于：

- 判断是不是某种对象
- 判断是不是某种异常类型


# 22. 调用、定义、执行顺序的一个核心理解

Python 能不能先写调用，再写定义，不完全看书写顺序，而看：

> 真正运行到那一刻，这个名字是否已经存在

例如：
````python
class A:  
    def x(self):  
        self.y()  
  
    def y(self):  
        print("hello")
````
这是可以的。  
因为真正执行 `x()` 时，`y()` 已经作为类的方法存在了。


# 23. JSON 和 dict 的关系

## JSON

是一种数据格式，常用于请求和响应。

## dict

是 Python 里的字典类型。

很多时候：

> JSON 进入 Python 后会变成 dict

例如：
```python
data = request.json  
message = data.get("message")
```

# 24. 面向 Flask / 后端最常见的 Python 场景

## 24.1 读取请求数据

把请求里的json解析成python字典，去键对应的值

```python
data = request.json  
query = data.get("query")
```

这里会用到：

- 变量
- dict
- `.get()`


## 24.2 参数判断
```python
if query is None:  
    ...
```


## 24.3 返回统一响应
```python
return {  
    "code": "success",  
    "message": "ok",  
    "data": {}  
}
```


## 24.4 调对象的方法

测试客户端：client调用post( )，向`/app/completion`发送一个post请求，内容是json数据`"query": None`

```python
resp = client.post("/app/completion", json={"query": None})
```


## 24.5 断言测试结果

`assert`表示断言，要求某个条件必须成立，否则测试失败
```python
assert resp.status_code == 200  
assert resp.json.get("code") == HttpCode.VALIDATE_ERROR
```

这里会用到：

- 对象属性
- dict 取值
- 类成员访问

