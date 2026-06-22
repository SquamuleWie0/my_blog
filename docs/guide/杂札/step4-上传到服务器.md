# 上传到服务器

> 本地完成 VitePress 博客构建后，需要将生成的静态文件部署到服务器上。  

这个过程本质上是：**本地写 Markdown → VitePress 构建为静态网页 → 上传到服务器 →Nginx 对外提供访问**。  

在这次部署过程中，我也踩到了一些典型问题，比如路径不对、Docker 容器隔离、图片引用错误、导航 404 等，这些问题都在下面一起整理出来。

---
## 一、先理解整个部署链路

在正式操作之前，先把整个流程想清楚。
### 这套部署流程分成 4 层

#### 1. 内容层
- 你的文章是 Markdown 文件
- 文章放在 `docs/guide/` 下
- 文章内容、分类、标题都在这里维护

#### 2. 构建层
- 使用 VitePress 把 Markdown 转成静态网页
- 构建结果会输出到 `docs/.vitepress/dist/`
#### 3. 服务层
- 服务器上用 Nginx 提供网页访问
- Nginx 本身跑在 Docker 容器
#### 4. 访问层
- 浏览器访问服务器 IP
- 看到的就是部署后的博客页面

### 这套链路可以概括为

```text
Markdown 文章 → vitepress build → dist 静态文件 → 上传到服务器 → 拷贝进 Nginx 容器 → 浏览器访问
```

---
## 二、确认本地 build 文件是否生成成功

>在部署之前，第一步不是上传，而是先确认本地已经成功构建出了静态文件。

### 1. 打开终端，进入项目根目录

```bash
cd /Users/wie0/my_blog/vitepress
```

这一步是进入你的 VitePress 项目目录，后续所有命令都要在这个目录下执行。

- `npx vitepress build docs` 要在项目根目录执行，不然它找不到 `docs/` 目录，build 出来的路径也会不对。

---
### 2. 执行构建命令

```bash
npx vitepress build docs
```

这个命令会把你的 Markdown 文件、配置文件、侧边栏、导航栏、样式文件一起打包，生成一套静态网页。

### 构建完成后输出到
```text
docs/.vitepress/dist/
```

这一步非常关键，因为它把你写的 Markdown 变成了真正可以部署的网站文件。

---
### 3. 检查构建结果

```bash
ls docs/.vitepress/dist
```

如果输出类似下面这样，说明 build 成功了：

```text
404.html  avatar.png  guide  icons.svg  test.html
assets    favicon.svg  hashmap.json  index.html  vp-icons.css
```

- `index.html`：首页入口
- `404.html`：找不到页面时的兜底页面
- `assets/`：CSS、JS 等静态资源
- `guide/`：文章页面对应目录
- `favicon.svg`：浏览器标签页图标
- `vp-icons.css`：VitePress 组件样式

---
## 三、确认服务器和容器状态

这次部署不是直接往服务器文件夹里扔网页，而是部署到 **Docker 容器中的 Nginx**。

**先明确你当前服务器信息**
- 服务器 IP：`101.43.28.73`
- 容器名：`myiginx`
- Nginx 运行在 Docker 容器里
- 容器端口映射为 80
---
## 四、把本地 dist 上传到服务器临时目录

因为容器不能直接接收你本地 Mac 的文件，所以先把文件传到服务器，再拷贝进容器。

### 1. 在本地 Mac 执行上传命令

```bash
scp -r /Users/wie0/my_blog/vitepress/docs/.vitepress/dist/* root@101.43.28.73:/root/dist_temp/
```

### 这一步在干什么

它把你本地 `dist` 目录里的所有静态文件，上传到服务器的 `/root/dist_temp/` 临时目录里。

### 为什么要先上传到临时目录

因为：

- `scp` 是本地 → 服务器
    
- `docker cp` 是服务器 → 容器
    
- 你不能直接从本地 Mac 把文件扔进远程容器里
    
- 所以要先做一层中转
    

---

### 2. 这里的命令参数是什么意思

- `scp`：安全复制文件
    
- `-r`：递归复制整个目录
    
- `dist/*`：复制 dist 下所有文件
    
- `root@101.43.28.73`：服务器登录用户和 IP
    
- `/root/dist_temp/`：服务器上的临时目录
    

---

## 五、登录服务器并确认临时文件是否到位

### 1. SSH 登录服务器

```bash
ssh root@101.43.28.73
```

### 这一步在干什么

进入远程服务器，方便后续执行 Docker 操作。

---

### 2. 检查上传文件是否存在

```bash
ls /root/dist_temp/
```

如果能看到类似下面的内容，说明文件上传成功：

```text
404.html  index.html  assets  guide  favicon.svg ...
```

### 这一步的作用

确认你刚刚从本地上传过来的构建文件已经成功到了服务器临时目录里。

---

## 六、确认 Nginx 容器是否在运行

### 执行命令

```bash
docker ps
```

你看到的结果应该类似：

```text
CONTAINER ID   IMAGE     COMMAND                  CREATED      STATUS      PORTS                 NAMES
5e85550e8ef9   nginx     "/docker-entrypoint.…"   3 days ago   Up 2 days   0.0.0.0:80->80/tcp   myiginx
```

### 这里怎么看

- `IMAGE nginx`：说明这个容器是 Nginx
    
- `STATUS Up`：说明容器在运行
    
- `NAMES myiginx`：这是容器名，后面 `docker cp` 和 `docker restart` 都要用它
    

---

## 七、把静态文件拷贝进 Nginx 容器

### 执行命令

```bash
docker cp /root/dist_temp/. myiginx:/usr/share/nginx/html/
```

### 这一步在干什么

把服务器临时目录里的静态文件，复制进 Nginx 容器的网页根目录。

### 为什么是这个路径

因为 Nginx 默认的网站根目录通常就是：

```text
/usr/share/nginx/html/
```

### 这一步的本质

你不是在“部署一个程序”，而是在“替换 Nginx 当前对外展示的网页内容”。

---

## 八、重启容器让新内容生效

### 执行命令

```bash
docker restart myiginx
```

### 这一步在干什么

让 Nginx 容器重新加载新的静态文件。

### 为什么要重启

因为文件虽然已经拷贝进去了，但 Nginx 可能还在缓存旧页面或旧资源，重启后才能确保新内容生效。

---

## 九、浏览器访问验证

### 打开浏览器访问

```text
http://101.43.28.73/
```

### 验证什么

- 首页是否显示正常
- 顶部导航是否正常
- 侧边栏是否正常
- 文章是否能打开
- CSS 样式是否正确
- 是否还是旧页面
---

# 十、你这次部署过程中踩到的错误和解决方法

## 1. 访问 IP 后看到的是 Nginx 默认页面

现象：
刚部署的时候，浏览器访问服务器 IP，看到的不是博客，而是 Nginx 默认页面。

这是因为：
- 服务器上虽然有 Nginx
- 但宿主机目录和 Docker 容器目录是隔离的
- 你改的是宿主机内容，但真正对外提供页面的是容器内部的 `/usr/share/nginx/html/`

解决办法：
用 `docker cp` 把生成的 `dist` 文件复制进容器。

原理：
Docker 容器有自己的文件系统，宿主机上的文件不会自动影响容器内部页面内容，所以必须显式拷贝进去。

---

## 2. 本地执行 `docker ps` 失败

你在 Mac 本地执行：

```bash
docker ps
```

报错：

```text
Cannot connect to the Docker daemon at unix:///Users/wie0/.docker/run/docker.sock
```

原因

因为 Docker 容器不是在 Mac 上，而是在远程服务器上。

### 解决办法

SSH 登录服务器后再执行：

```bash
ssh root@101.43.28.73
docker ps
```

### 原理

`docker ps` 是查询当前机器上的 Docker 容器，不是查询远程服务器的容器。  
所以必须先进入服务器环境再看。

---

## 3. 找不到 `/etc/nginx/nginx.conf`

### 现象

你在服务器上执行：

```bash
cat /etc/nginx/nginx.conf
```

发现文件不存在。

### 原因

说明服务器上的 Nginx 并不是直接以系统服务方式安装的，而是运行在 Docker 容器中。

### 解决办法

改用：

```bash
docker ps
```

找到容器名后，再用 `docker cp` 和 `docker restart` 操作容器。

### 原理

容器化部署时，Nginx 的配置文件和页面目录都在容器内部，宿主机未必有对应配置路径。

---

## 4. 构建报错：图片路径无法解析

### 现象

build 时出现过类似：

```text
Rollup failed to resolve import "/img/Pasted_image_20251209234148.png"
```

### 原因

你文章里引用图片时用了不正确的路径，或者图片没有放在 VitePress 可以识别的位置。

### 解决办法

你后来决定先不要图片，把图片引用删掉，先保证构建通过。

### 原理

VitePress 构建阶段会检查资源路径，如果路径不存在，就会直接报错。

---

## 5. 构建报错：Duplicate attribute

### 现象

build 时出现：

```text
Duplicate attribute
```

### 原因

这是 Markdown 中某些 HTML 标签或组件属性重复导致的。

### 解决办法

检查对应文章，删掉重复属性，或者把不兼容的写法改成标准 Markdown。

### 原理

VitePress 最终会把 Markdown 转成 Vue 模板，如果标签属性重复，Vue 编译器会直接报错。

---

## 6. 顶部导航栏跳转 404

### 现象

顶部导航栏点击后进入 404 页面。

### 原因

因为导航栏链接指向了目录，但该目录下没有对应的入口页面，或者路径没有正确对应文章。

### 解决办法

把导航栏直接改成指向具体文章路径，而不是目录路径。

### 原理

VitePress 不会自动为目录生成页面，导航栏如果指向目录，目录里没有入口文件就会 404。

---

## 十一、这套部署流程背后的原理

这一部分可以直接写进你的技术文档里，作为“原理说明”。

### 1. 为什么要先 build

因为 VitePress 不是运行时动态渲染，而是把 Markdown 预先构建成静态网页。  
所以必须先执行 `vitepress build`，拿到最终网页文件。

### 2. 为什么要先上传到服务器临时目录

因为本地 Mac 无法直接操作远程容器，必须先通过 `scp` 上传到服务器，再由服务器 `docker cp` 到容器里。

### 3. 为什么容器里有独立网页目录

因为 Docker 容器和宿主机文件系统隔离。  
即使宿主机有文件，容器里的 Nginx 也看不到，必须显式复制进去。

### 4. 为什么要重启容器

因为 Nginx 需要重新加载新的静态内容。  
不重启的话，旧页面可能还在缓存或旧文件未生效。

---

## 十二、最终可以总结成一句话

> 这次部署的本质，是把本地 Markdown 内容通过 VitePress 构建成静态网页，再通过 Docker + Nginx 将网页文件部署到服务器上对外提供访问。  
> 过程中遇到的路径问题、容器隔离问题、图片引用问题和构建报错，最终都通过统一目录结构、规范资源引用和正确使用 Docker 命令得到解决。

---

如果你愿意，我下一步可以继续帮你做两件事里的任意一个：

1. 把这份内容改成更适合放进你博客正文的“正式版”
    
2. 把这份内容再压缩成“简历项目经历版”
    

如果你要，我可以直接继续帮你整理成你博客里能直接贴的最终稿。