---
title: MIT Missing Semester
date: 2026-3-08
tags:
  - shell
  - MIT
categories: 工程工具
  - 工程工具
---
# MIT Missing Semester（shell）

## Shell 的核心思想

Linux 命令可以 **像乐高一样组合**，每个命令只做一件事，但组合起来就很强大。

例如：

```
ls | grep "关键字"| sort | wc
```

- ls文件查找的结果，经过筛选关键字后，进行排序，最后计数显示行数

---
## 1. Shell 基础与常用命令

### 1.1 什么是 Shell

**Shell** 是操作系统提供的一种 **命令行界面（CLI）**，用于让用户通过输入命令与系统交互。

简单理解：

```
用户 → Shell → 操作系统
```

例如：

```bash
ls
```

Shell 会把这个命令交给系统执行，然后返回结果。

常见的 Shell：
- **bash**（最常见）
- **zsh**（Mac 默认）
- **sh**

我的终端提示：

```
wie0@wie0deMacBook-Air ~ %
```

含义：

| 部分                | 含义         |
| ----------------- | ---------- |
| wie0              | 用户名        |
| wie0deMacBook-Air | 主机名        |
| ~                 | 当前目录（home） |
| %                 | zsh 的提示符   |

---

### 1.2 常用终端命令

#### 查看当前目录

```bash
pwd
```

输出当前路径。

---
查看目录内容：

```bash
ls
```

常见参数：

```bash
ls -l
```

显示详细信息。

```bash
ls -a
```

显示隐藏文件。

---

#### 切换目录

```bash
cd 目录名
```

例如：

```bash
cd Desktop
```

返回上一级：

```bash
cd ..
```

回到用户目录：

```bash
cd ~
```

---

### 1.3 创建文件

创建文件：

```bash
touch hello.sh
```

作用：

- 创建一个 **hello.sh 文件**

- 如果文件存在则更新时间戳


文件名解释：

```
hello.sh
```

- hello → 文件名

- .sh → shell script（Shell 脚本）   

---

### 1.4 编辑文件

使用 nano 编辑器：

```bash
nano hello.sh
```

进入编辑界面后可以输入代码。

保存：

```
Ctrl + O
```

退出：

```
Ctrl + X
```

---

# 2. Shell 脚本基础

### 2.1 什么是脚本

**脚本（script）** 是一组按顺序执行的命令集合。

本质：

> 把多个终端命令写进一个文件，让系统自动执行。

例如：

如果你每天需要执行：

```bash
echo hello
date
pwd
```

可以写成脚本：

```bash
echo hello
date
pwd
```

保存为：

```
hello.sh
```

执行后就会自动运行所有命令。

---

### 2.2 第一个 Shell 脚本

编辑文件：

```bash
nano hello.sh
```

写入：

```bash
echo "Hello World"
```

保存后执行：

```bash
bash hello.sh
```

输出：

```
Hello World
```

---

### 2.3 脚本的作用

Shell 脚本主要用于：

1️⃣ **自动化任务**

例如：

- 自动备份文件
- 自动启动程序
- 自动部署服务


2️⃣ **批量执行命令**

例如：

```bash
mkdir project
cd project
touch main.py
```

可以写成脚本一次执行。

3️⃣ **系统管理**

例如：

- 服务器维护
- 日志处理
- 定时任务

---

# 3. 本节学习总结

本节学习内容：

- 了解 **Shell 是什么**
- 掌握 **基本终端命令**
- 创建文件 `touch`
- 使用 `nano` 编辑文件
- 编写并运行 **第一个 Shell 脚本**

核心思想：

> 通过 Shell 可以高效地控制计算机，并通过脚本实现自动化。

---

### 实践
#### 掌握shell基础
- 基本文件操作命令
- 输入输出重定向
- 管道`|`
- 执行条件`&&` `||`
- 命令替换 `$(commamd)`
- 编写运行shell脚本
- 使用循环批量处理文件
- 理解通配符`*`
---
#### 基础命令实践

## 一、**查看系统环境**

查看当前所在目录：

```bash
pwd
```

查看目录文件：

```bash
ls -l
```

输出文本：

```bash
echo "你好，Shell 世界！"
```

创建练习目录并进入：

```bash
mkdir shell_practice
cd shell_practice
```

实践结果：
- 成功创建 Shell 练习目录
- 熟悉基本命令行操作

---

# 三、文件操作实践

创建文件：

```bash
echo "这是第一行" > file1.txt
```

查看文件内容：

```bash
cat file1.txt
```

追加内容：

```bash
echo "这是第二行" >> file1.txt
```

复制文件：

```bash
cp file1.txt file2.txt
```

重命名文件：

```bash
mv file2.txt renamed.txt
```

删除文件：

```bash
rm renamed.txt
```

实践收获：

- `>` 会 **覆盖写入**
- `>>` 会 **追加内容**
- 掌握 Linux 基本文件操作流程

---

# 四、重定向实践

Shell 可以控制 **程序输出的位置**。

标准输出重定向：

```bash
echo "我会被写入文件" > output.txt
```

将输出丢弃：

```bash
echo "你看不到我" > /dev/null
```

错误信息重定向：

```bash
ls /fakefolder 2> /dev/null
```

同时丢弃输出和错误：

```bash
ls /fakefolder > /dev/null 2> /dev/null
```

简写形式：

```bash
ls /fakefolder &> /dev/null
```

实践收获：

理解 Linux 三种输出：

|类型|编号|
|---|---|
|标准输入|0|
|标准输出|1|
|错误输出|2|

---

# 五、管道实践

管道 `|` 可以把 **一个命令的输出作为另一个命令的输入**。

筛选文件：

```bash
ls -l | grep ".txt"
```

统计文件数量：

```bash
ls -l | wc -l
```

查找进程：

```bash
ps aux | grep bash
```

结合重定向：

```bash
ls -l | grep ".txt" > txt_files.txt
```

实践收获：

> 管道是 Linux 最重要的工具之一，可以组合多个命令完成复杂任务。

---

# 六、条件执行

Shell 可以根据执行结果决定是否继续执行命令。

成功时执行：

```bash
true && echo "成功时执行"
```

失败时执行：

```bash
false || echo "失败时执行"
```

创建目录并进入：

```bash
mkdir myproject && cd myproject
```

失败提示：

```bash
ls /nonexistent || echo "文件不存在"
```

实践收获：

| 符号   | 含义       |
| ---- | -------- |
| `&&` | 前一个成功才执行 |
|      | 前一个失败才执行 |

---

# 七、命令替换

Shell 可以把命令执行结果 **存入变量**。

保存日期：

```bash
now=$(date)
```

使用变量：

```bash
echo "现在是 $now"
```

嵌入命令：

```bash
echo "今天日期：$(date +%Y-%m-%d)"
```

动态文件名：

```bash
backup_file="backup_$(date +%Y%m%d).tar.gz"
```

实践收获：

> `$()` 可以把命令结果嵌入到字符串或变量中。

---

# 八、Shell 脚本编写

创建脚本：

```bash
nano wie0_first.sh
```

脚本内容：

```bash
#!/bin/bash

echo "==== 系统信息报告 ===="
echo "当前用户：$(whoami)"
echo "当前目录：$(pwd)"
echo "今天日期：$(date +%Y-%m-%d)"

file_count=$(ls | wc -l)
echo "当前目录下有 $file_count 个文件"

txt_count=$(ls *.txt 2> /dev/null | wc -l)

if [ $txt_count -gt 0 ]; then
    echo "有 $txt_count 个 .txt 文件"
else
    echo "没有找到 .txt 文件"
fi

echo "==== 报告结束 ===="
```

赋予执行权限：

```bash
chmod +x wie0_first.sh
```

执行脚本：

```bash
./wie0_first.sh
```

实践收获：

- 理解 Shell 脚本基本结构
- 学会变量使用
- 学会简单条件判断

---

# 九、for 循环实践

基础循环：

```bash
for i in 1 2 3 4 5; do
    echo "数字：$i"
done
```

批量处理文件：

```bash
for file in *.txt; do
    echo "找到文件：$file"
done
```

批量重命名：

```bash
for file in *.txt; do
    mv "$file" "${file%.txt}.bak"
done
```

实践收获：

> Shell 循环可以批量处理文件。

---

# 十、通配符

Shell 可以通过 **通配符匹配文件**。
`*`代替文件名中不确定的部分

|通配符|含义|
|---|---|
|`*.txt`|所有 txt 文件|
|`data.*`|data 开头的文件|
|`*test*`|文件名包含 test|

示例：

```bash
echo *.txt
```

查看通配符被扩展后的结果。

---

# 十一、实践总结

本次实践掌握的能力：

- Linux 文件操作 
- Shell 重定向机制
- 管道组合命令
- 条件执行逻辑
- 命令替换
- Shell 脚本编写
- for 循环批处理
- 通配符匹配
