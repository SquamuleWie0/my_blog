---
title: ""
date: ""
tags: []
categories: 项目实践/个人网站部署
---
# 网站部署

操作系统：macOS（本地开发）  
远程服务器：Linux（OpenCloudOS）  
软件依赖：

- Node.js + npm/pnpm
- Hexo + hexo-cli
- Docker + Nginx 镜像
- Git + GitHub/Gitee 仓库

---
## 一、购买服务器

### 1. 购买服务器配置

我买的腾讯云的，最便宜这个够用了：

```
CPU：4核
内存：4GB
系统盘：SSD云硬盘 40GB
流量包：300GB/月（带宽 3Mbps）
```

实例信息：

```
状态：运行中
地域：上海 | 上海五区
IPv4：101.43.28.73
实例ID：lhins-c7fsgu2w
实例名称：OpenCloudOS-41zH
```

---

## 二、远程服务器 SSH 登录与密钥配置

### 1. SSH 登录

SSH (Secure Shell) 是通过加密通道登录远程服务器的协议。本地配置 SSH key 可以实现自动化登录，即便在云控制台也可以操作终端，使用 SSH key 更安全。

```bash
# 登录服务器
ssh root@<server_ip>
```

检查 SSH 配置：

```bash
grep -E "PermitRootLogin|PubkeyAuthentication|PasswordAuthentication" /etc/ssh/sshd_config
```

- 预期输出：

```bash
PermitRootLogin yes
PubkeyAuthentication yes
PasswordAuthentication yes
```

---

### 2. 配置 SSH Key 公钥
（这个环节我卡了一阵）

**原理**：客户端用私钥生成加密请求，服务器用公钥验证，如果匹配则登录成功。

```bash
# 本地生成密钥对（如果没有）
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"

# 在服务器上创建 authorized_keys 文件
mkdir -p ~/.ssh
echo "<你的公钥内容>" >> ~/.ssh/authorized_keys
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

**测试登录**：

```bash
ssh -i ~/.ssh/id_rsa root@<server_ip>
```

**常见问题及解决**
**自动化脚本上传博客到 GitHub 可能卡住**

**可能导致原因**：
- 电脑没有生成 SSH key → （这个很好排除）
- 公钥粘贴不完整 → GitHub 无法识别 → （这个原因确实有要完整复制输出的整串密钥包括begin---end）
- 私钥未被识别到，可能 `~/.ssh/config` 中某些指令被注释掉

我们一个一个来验证

**1、 `sshd_config` 文件配置不正确** 
- 服务端`/etc/ssh/sshd_config`是ssh服务的配置文件，他的决定方式如下：
	- `PubkeyAuthentication` → 允许公钥认证
	- `PasswordAuthentication` → 允许密码登录
	- PermitRootLogin → 允许root用户直接登录
		 -  被`#`注释掉了 或 设置为 `no`，导致了我这个密钥没能被读取所以卡住了
	- `AuthorizedKeysFile` 未指向 `.ssh/authorized_keys`→ 制定公钥的存放路径	
- 私钥未被识别到，可能 `ssh` 配置文件（`~/.ssh/config`）中指令被注释掉

**2、 本地密钥权限不正确** 
- `id_rsa` 权限必须是 600 （只能用户自己可读写）
- `.ssh` 文件夹权限必须是 700 （只有用户自己和读写执行）

**3、公钥没有正确上传到服务器**
- 本地公钥必须写进服务器`/root/.ssh/authorized_keys`上
- 错误或多次修改导致公钥不匹配	

`sshd_config `核心配置示例：

```bash
PermitRootLogin yes
PubkeyAuthentication yes
PasswordAuthentication yes
AuthorizedKeysFile .ssh/authorized_keys
```

**权限设置**：

```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

**重启 SSH 服务**（使配置生效）：

```bash
systemctl restart sshd
```

> **说明**：公钥认证只需要上传公钥 (`id_rsa.pub`)，私钥保留在本地。多次尝试问题通常是粘贴不完整、权限不对或 sshd_config 配置未生效。

---

## 三、本地 Hexo 开发环境

### 1. 安装 Node.js 与 npm

```bash
# 使用 nvm 安装 LTS 版本
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
. "$HOME/.nvm/nvm.sh"
nvm install 24
node -v
npm -v
```

### 2. 安装 Hexo CLI

```bash
npm install -g hexo-cli
```

国内环境下 npm 拉依赖慢，可切换国内镜像：

```bash
npm config set registry https://registry.npmmirror.com
```

权限问题：

```bash
sudo chown -R $(whoami):staff ~/.npm
```

在国内环境下 `npm install -g hexo-cli` 很慢，几乎卡住，可以切换 npm 镜像到国内源

```
npm config set registry https://registry.npmmirror.com
```
---

### 3. 创建 Hexo 项目

1. 创建博客目录：

```bash
mkdir ~/my_blog
cd ~/my_blog
hexo init .
```

- **作用**：初始化 Hexo 项目，包括创建默认目录结构（`_posts`, `source`, `themes` 等）及下载默认主题。

- **问题**：`hexo init` 报错 `target not empty`
    - 原因：目录非空
    - 解决：新建空目录再执行 `hexo init .`
     原先是在我的笔记目录下初始化的，所以Hexo无法覆盖就报错了

2. 安装依赖：

```bash
npm install
```

- **作用**：根据 `package.json` 安装 Hexo 核心、主题和插件依赖。
- **常见问题**
    - 下载依赖慢 → npm 默认源在国外
    - `EACCES: permission denied` → 缓存目录权限不对
    - `File exists` → 缓存残留
- **解决方案**：  
```bash
# 使用国内镜像
npm config set registry https://registry.npmmirror.com

# 修复缓存目录权限
sudo chown -R $(whoami):staff ~/.npm

# 使用 pnpm 加速安装
npm install -g pnpm
pnpm install
```

> **说明**：npm 是 Node.js 的包管理器，“包”就是 Hexo 插件、主题等代码模块。pnpm 通过共享依赖，加速下载和安装。

---

### 4. 生成静态文件

```bash
hexo generate
```

- **作用**：把 Markdown 内容生成静态网页文件（HTML、CSS、JS），输出到 `public/` 文件夹。

- **常见问题**：
    - `public/` 文件夹不存在 → 依赖未安装完整或主题缺失
    - 解决：
```bash
pnpm install
hexo generate
```

> **说明**：生成静态文件在本地完成，Docker 镜像是部署环境，不影响本地生成。

---

## 四、部署到服务器

### 1. 上传静态文件到服务器

```bash
scp -i ~/.ssh/id_rsa -r ./public/. root@<server_ip>:/tmp/my_hexo_public
```
说明：
- `scp -i ~/.ssh/id_rsa -r ./public/. root@<server_ip>:/tmp/my_hexo_public`  
  ① `-i` 指定密钥  
  ② `-r` 递归复制整个目录  
  ③ `./public/.` 表示复制 public 下所有文件  
  ④ `/tmp/my_hexo_public` 是远程服务器临时存放路径  
- `-v` 可加上查看上传详细日志
- 上传后可通过 SSH 登录服务器确认文件：
  ssh -i ~/.ssh/id_rsa root@<server_ip>
  ls /tmp/my_hexo_public

- **作用**：把本地生成的静态文件上传到远程服务器，以便后续 Docker 部署。
- **常见问题**：
    - `No such file or directory` → 当前目录下没有 `public` 文件夹
        - 解决：`cd ~/my_blog` 确认路径
		
---

### 2. Docker 容器部署 Nginx

**原理**：Nginx 在容器中提供静态网页服务，容器与宿主机是隔离文件系统。

0. **注意**：在拉取 Nginx 镜像时可能会失败
   `docker pull nginx` 失败☹️

主要的原因可能有三种：
- docker 没安装好
- 网络访问 Docker Hub 慢或被墙（国内环境最常见）
- CPU架构问题

所以首先确认docker安装正常
使用国内 Docker 加速器 / 脚本刷新网络后再 pull

昨天被gpt误导了，一直以为是架构问题，后面看了些资料发现这个貌似对docker拉镜像没有啥影响。就是网络的问题写个加速脚本运行一下再pull就好了。

1. 启动 Nginx 容器：

```bash
docker run -d -p 80:80 --name myiginx nginx
```

2. 复制静态文件到容器：

```bash
docker cp /tmp/my_hexo_public/. myiginx:/usr/share/nginx/html
docker restart myiginx
```

- **说明**：
    - 容器内 Nginx 默认读取 `/usr/share/nginx/html` 提供网页访问
    - 不要在容器内部直接 `cp /tmp/...`，因为容器文件系统与宿主机隔离
    - `docker cp` 可以从宿主机直接复制文件到容器

---

### 3. 查看 Nginx 配置

```bash
docker exec -it myiginx /bin/bash
cat /etc/nginx/nginx.conf
```

- **说明**：    
    - 容器内的 Nginx 配置才是生效的
    - Mac 本地 `/etc/nginx/nginx.conf` 不存在 → Mac 未安装 Nginx

---

## 五、验证部署

- 浏览器访问服务器 IP：
    - 默认 Hexo 页面显示 “Welcome to Hexo!”
- 问题：仍然看到 Nginx 默认页面
    - 原因：宿主机 `/usr/share/nginx/html` 与容器隔离
    - 解决：使用 `docker cp` 把 Hexo `public` 内容复制到容器内并重启

>显示hexo的页面即部署成功

---
