---
title: Obidians同步到GitHub
date: 2026-1-16
tags:
  - GitHub
categories: 工程工具
  - 工程工具
---
# Obidians同步到GitHub

## 1 项目说明

本文档用于说明如何将本地 **Obsidian 笔记仓库**通过 **Git 版本控制系统**同步到 GitHub，实现：

- 笔记版本管理
- 云端备份
- 多设备同步
- Git 实操练习

适用于：
- MacOS + Obsidian 用户    
- Git 初学者

---
## 2 基础信息

| 项目         | 内容                                                    |
| ---------- | ----------------------------------------------------- |
| GitHub 用户名 | SquamuleWie0                                          |
| 仓库名称       | wie0_vault                                            |
| 仓库地址       | `https://github.com/SquamuleWie0/wie0_vault.git` I’ll |
| Git 邮箱     | [2762327275@qq.com](mailto:2762327275@qq.com)         |

---

## 3 环境准备

需要提前安装：
- Git
- Obsidian
注册：
- GitHub 账号

检查 Git 是否安装成功：

```bash
git --version
```

如果未安装 Git（MacOS）：

```bash
xcode-select --install
```

系统会自动安装 Git。

---
## 4 Git 基础配置（首次配置）

设置 Git 用户信息（只需配置一次）：

```bash
git config --global user.name "SquamuleWie0"
git config --global user.email "2762327275@qq.com"
```

查看当前配置：

```bash
git config --list
```

---
## 5 克隆 GitHub 仓库

进入希望存放笔记的目录：

```bash
cd ~/Desktop
```

克隆远程仓库：

```bash
git clone https://github.com/SquamuleWie0/wie0_vault.git
```

进入仓库目录：

```bash
cd wie0_vault
```

---
## 6 导入 Obsidian 笔记

将本地 Obsidian 笔记文件复制到仓库目录：

操作步骤：

1. 打开 **Finder**
2. 找到本地 **Obsidian Vault 文件夹**
3. 将所有 `.md` 文件复制到 `wie0_vault` 目录

示例目录结构：

```
wie0_vault
│
├── 算法
├── 计算机网络
├── Linux
├── 每日笔记
│
└── README.md
```

---
## 7 首次提交并同步到 GitHub

查看当前文件状态：

```bash
git status
```

添加所有文件：

```bash
git add .
```

创建提交记录：

```bash
git commit -m "首次上传 Obsidian 笔记"
```

推送到 GitHub：

```bash
git push
```

同步完成后，可以在 GitHub 仓库页面查看文件。

---
## 8 GitHub 身份认证配置

由于 GitHub 已停止使用密码认证，需要使用 **Personal Access Token**。

生成 Token：

1. 登录 GitHub
2. 点击头像 → **Settings**
3. 进入 **Developer settings**
4. 点击 **Personal access tokens**
5. 选择 **Tokens (classic)**
6. 点击 **Generate new token**

推荐设置：

```
Note: Obsidian Git Sync
Expiration: No expiration
Scope: repo
```

生成后复制 Token。

---
## 9 记住认证信息

为了避免每次输入 Token，可以让 Git 记住认证信息：

```bash
git config --global credential.helper store
```

当 `git push` 时输入：

```
Username: SquamuleWie0
Password: [粘贴 token]
```

之后 Git 会自动保存。

---
## 10 日常同步流程

## 编辑前同步远程仓库

进入仓库目录：

```bash
cd ~/Desktop/wie0_vault
```

拉取远程更新：

```bash
git pull
```

---
## 编辑完成后上传

查看修改：

```bash
git status
```

添加修改：

```bash
git add .
```

提交修改：

```bash
git commit -m "更新笔记"
```

推送到 GitHub：

```bash
git push
```

---
## 11 常用 Git 命令速查

|命令|功能|
|---|---|
|git clone|克隆远程仓库|
|git pull|拉取远程更新|
|git status|查看文件状态|
|git add|添加文件到暂存区|
|git commit|提交修改|
|git push|推送到远程仓库|
|git log --oneline|查看提交历史|
|git diff|查看文件修改|

---
## 12 常见问题

#### push 被拒绝

原因：远程仓库有更新。

解决方法：

```bash
git pull --rebase
git push
```

---
#### 文件冲突

查看冲突文件：

```bash
git status
```

打开文件并解决冲突：

```
<<<<<<<
当前版本
=======
远程版本
>>>>>>>
```

解决后提交：

```bash
git add 文件名.md
git commit -m "解决冲突"
git push
```

---
#### 撤销最近提交

撤销提交但保留修改：

```bash
git reset --soft HEAD^
```

彻底撤销：

```bash
git reset --hard HEAD^
```

---
## 13 提交信息规范

推荐使用明确的提交说明：

```
新增：周报模板
修改：README 文档
修复：图片路径错误
删除：旧测试文件
```

示例：

```bash
git commit -m "新增：Linux 网络笔记"
```

---
## 14 自动同步脚本（可选）

创建自动同步脚本：

```bash
echo '#!/bin/bash
cd ~/Desktop/wie0_vault
git add .
git commit -m "自动备份 $(date)"
git push' > ~/obsidian_sync.sh
```

赋予执行权限：

```bash
chmod +x ~/obsidian_sync.sh
```

以后只需运行：

```bash
~/obsidian_sync.sh
```

即可自动同步。

---
## 15 .gitignore 配置

为了避免上传缓存文件，在仓库根目录创建 `.gitignore`：

```
.DS_Store
.obsidian/workspace.json
.obsidian/workspace-mobile.json
.trash/
*.tmp
```

---
## 16 完整工作流程

#### 第一次使用

```bash
cd ~/Desktop
git clone https://github.com/SquamuleWie0/wie0_vault.git
cd wie0_vault

git add .
git commit -m "首次上传笔记"
git push
```

---

### 日常使用

```bash
cd ~/Desktop/wie0_vault

git pull
# 编辑笔记

git add .
git commit -m "更新笔记"

git push
```

---
## 17 验证同步

打开仓库页面：

```
https://github.com/SquamuleWie0/wie0_vault
```

检查：
- 文件是否同步
- 提交记录
- 笔记内容