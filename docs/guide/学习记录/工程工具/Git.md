---
title: Git
date: 2026-3-08
tags:
  - GitHub
categories: 工程工具 - 工程工具
---
# Git

`Git = 记录项目历史快照的版本管理系统`
## 关于版本控制系统 VCS

> **版本控制系统（version control system）** 记录项目历史变化的工具

在整个开发过程中，代码会不断进行：
- 修改、增加删除

> 每一次`commit`都会进行一次项目快照记录，形成历史版本

**git**本质上是记录**快照**，每一次`commit`的本质是整个项目文件的一次快照

---
## 版本控制系统作用
### 版本退回
- 可以回到某个历史版本
```
git checkout 某个版本
```

### 修改记录
- 可以查看修改操作人、修改时间、修改原因等
```
git blame
```

### 分支开发
- 不同功能并行开发
```
main
   │
   ├── login-feature
   └── payment-feature
```

### 多人协作
- 多人同时开发，负责不同的功能板块
```
git merge
```

---
## Git的历史结构--GAD
git 的历史提交是一个GAD（Directed Acyclic Graph）
- 有向无环图
```
o ← o ← o ← o
        ↑
         \
          o ← o
```

---
## Git的数据类型
>Git有三种核心对象
### blob

- 文件内容，本质上就是一段字节数据
 
```
blob = array<byte>
```

### tree

- 表示目录结构

```
tree = map<name, blob | tree>
```
```
root
 ├── foo
 │   └── bar.txt
 └── baz.txt
```

### commit （提交）

- 父commit
- 作者
- 提交信息
- 项目快照（tree）

```
commit {
    parents
    author
    message
    snapshot(tree)
}
```

---
## Git 的对象储存

Git 的所有对象都是通过**SHA-1 哈希值**储存

```
objects = map<hash, object>
```
- 内容相同哈希值就相同
- 对象不可修改
- 被修改后的文件生成新的对象

---
## References（引用）

由于 commit 的 hash 很长，不方便记忆，
Git 使用 reference（引用）来指向 commit。

例如：
```
main → a3f5c9d
dev  → 91f83aa
```

branch 本质就是一种 reference。

---

## HEAD

HEAD 是一个特殊的 reference，
表示当前所在的位置。

结构：

HEAD → branch → commit

---
## Git的本质
包含两个部分：
```
.git
 ├── objects
 └── references
```

但是所有的git 的操作本质都是：修改 commit DAG

---
## Staging Area 暂存区

主要作用是控制提交的内容

```
        （git add）.         (git commit)
工作区     ------>    暂存区     ----->.     生成 commit
```

---
## 常用的操作

### 版本退回
```
git checkout 
```

#### 查看修改记录
```
git blame
```

### 分支开发不同功能并行开发
```
main
   │
   ├── login-feature
   └── payment-feature
```

### 合并
```
git merge
```