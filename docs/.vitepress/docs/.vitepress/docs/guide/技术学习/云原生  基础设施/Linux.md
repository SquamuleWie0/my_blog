---
title: ""
date: ""
tags: []
categories: 技术学习/云原生  基础设施
---

# Linux 学习笔记（基础阶段）

这部分记录我在 Linux 学习初期整理的基础知识与实践内容。  
主要目标是建立 Linux 的基本使用能力，为后续学习 **Docker / Kubernetes / 云架构**打基础。

笔记按模块归档：

```
Linux
├── 1 Linux 文件系统
├── 2 Linux 核心命令
├── 3 文本处理工具
├── 4 权限系统
├── 5 进程管理
├── 6 软件安装
├── 7 网络基础
└── 8 Shell 脚本
```

---

# 1 Linux 文件系统

Linux 的文件系统是树形结构，所有目录都从根目录 `/` 开始。

常见目录结构：

```
/
├── bin    # 基础命令
├── etc    # 系统配置文件
├── home   # 用户目录
├── usr    # 应用程序
├── var    # 日志、数据
```

常用命令：

查看当前目录：

```bash
pwd
```

查看目录内容：

```bash
ls
```

进入目录：

```bash
cd
```

查看目录结构：

```bash
tree
```

简单实践：

```bash
mkdir project
cd project
touch test.txt
tree
```

---

# 2 Linux 核心命令

Linux 中大量操作通过命令行完成。

## 文件操作

创建文件：

```bash
touch file.txt
```

复制文件：

```bash
cp file.txt copy.txt
```

移动或重命名：

```bash
mv file.txt new.txt
```

删除文件：

```bash
rm file.txt
```

查看文件内容：

```bash
cat file.txt
```

---

## 输出与重定向

Linux 中程序输出默认显示在终端。

可以通过重定向改变输出位置。

覆盖写入：

```bash
echo "hello" > file.txt
```

追加写入：

```bash
echo "world" >> file.txt
```

---

## 管道（Pipe）

管道符：

```
|
```

作用是：

> 将一个命令的输出作为另一个命令的输入

示例：

```bash
ls | grep txt
```

统计文件数量：

```bash
ls | wc -l
```

---

# 3 文本处理工具

Linux 的强大之处在于 **文本处理能力**。

## grep

用于筛选文本内容。

例如：

```bash
ls | grep txt
```

查找进程：

```bash
ps aux | grep sleep
```

---

## wc

统计文本信息。

统计行数：

```bash
ls | wc -l
```

---

## 常见文本工具

| 工具   | 作用    |
| ---- | ----- |
| grep | 文本搜索  |
| wc   | 统计文本  |
| sort | 排序    |
| head | 查看前几行 |
| tail | 查看后几行 |

---

# 4 权限系统

Linux 使用权限控制文件访问。

查看权限：

```bash
ls -l
```

输出示例：

```
-rwxr-xr-x
```

权限结构：

```
用户权限 组权限 其他用户权限
```

权限类型：

|符号|含义|
|---|---|
|r|读取|
|w|写入|
|x|执行|

---

## 修改权限

增加执行权限：

```bash
chmod +x script.sh
```

数字权限：

|数字|权限|
|---|---|
|7|rwx|
|5|r-x|
|4|r--|

示例：

```bash
chmod 755 script.sh
```

含义：

```
用户：读写执行
组：读执行
其他：读执行
```

---

# 5 进程管理

在 Linux 中：

> 每一个运行的程序都是一个进程

例如：

- Terminal
- 浏览器
- Web服务器
- Docker容器

---

## 查看进程

查看所有进程：

```bash
ps aux
```

重要字段：

|字段|含义|
|---|---|
|PID|进程ID|
|CPU|CPU使用率|
|MEM|内存使用|
|COMMAND|运行程序|

---

## 筛选进程

结合 grep：

```bash
ps aux | grep sleep
```

---

## 创建进程实验

运行：

```bash
sleep 100
```

作用：

程序暂停 100 秒。
系统中会生成一个新的进程。

---

## 后台运行

```bash
sleep 100 &
```

符号：

```
&
```

表示：

> 在后台运行程序

---

## 结束进程

查看 PID：

```bash
ps aux | grep sleep
```

终止进程：

```bash
kill PID
```

示例：

```bash
kill 12345
```

---

# 6 软件安装

在 macOS 环境中可以使用 Homebrew 管理软件。

安装软件：

```bash
brew install tree
```

安装完成后可以使用：

```bash
tree
```

查看目录结构。

在 Linux 服务器中常见的软件管理工具：

|系统|工具|
|---|---|
|Ubuntu|apt|
|CentOS|yum|

例如：

```bash
sudo apt install nginx
```

---

# 7 网络基础

Linux 提供多种网络调试工具。

## ping

测试网络连通性：

```bash
ping google.com
```

使用协议：

```
ICMP
```

停止：

```
Ctrl + C
```

---

## curl

发送 HTTP 请求：

```bash
curl https://example.com
```

可以理解为：

> 命令行浏览器

---

## 查看端口占用

查看某个端口：

```bash
lsof -i :8000
```

用于判断哪个程序占用了端口。

---

# 8 Shell 脚本

Shell 脚本可以自动执行一系列命令。

创建脚本：

```bash
nano system_info.sh
```

脚本内容：

```bash
#!/bin/bash

echo "User:"
whoami

echo "Current directory:"
pwd

echo "Date:"
date

echo "Files in directory:"
ls | wc -l
```

赋予执行权限：

```bash
chmod +x system_info.sh
```

运行脚本：

```bash
./system_info.sh
```

脚本会输出系统信息。

---

# Linux 实践实验

## 本地服务器实验

使用 Python 快速启动 Web 服务器。

启动服务器：

```bash
python3 -m http.server 8000
```

浏览器访问：

```
http://localhost:8000
```

当前目录会作为网站目录。

查看端口：

```bash
lsof -i :8000
```

停止服务器：

```
Ctrl + C
```

---

# 阶段总结

通过这一阶段的学习，我已经掌握了 Linux 的基础使用能力，包括：

- Linux 文件系统
- 常用命令
- 文本处理
- 权限系统
- 进程管理
- 软件安装
- 网络调试
- Shell 脚本

这些知识构成了 Linux 使用的基础。

接下来将进入下一阶段：

```
Linux
↓
Docker
↓
Kubernetes
↓
云架构
```

下一步目标是学习 **Docker 容器技术**，理解容器运行原理并部署第一个服务。

---