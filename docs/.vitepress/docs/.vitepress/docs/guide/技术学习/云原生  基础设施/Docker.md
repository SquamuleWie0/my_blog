---
title: ""
date: ""
tags: []
categories: 技术学习/云原生  基础设施
---
# Docker

>解决软件部署时环境不一致的问题。

- 应用依赖管理
- 运行环境封装
- 部署标准化

`应用 = 代码 + 依赖 + 运行环境` 

**问题**：传统在**服务器上**的部署环境各个版本冲突
- 在我电脑上能跑，到了服务器就不行。

解决：利用Docker可以**实现环境隔离**
- 把`程序 + 运行环境 + 依赖`一起打包运行。

**在这个过程中涉及了docker 的两个核心：镜像+容器**
- **镜像**本身作为容器创建的依据，将某个软件运行所需要的软件及其环境、配置、依赖都打包在镜像里。作为后续创建容器的模版。
- **容器**根据镜像模版创建并运行
>Build once, run anywhere

**总的来说Docker解决了什么问题**

1️⃣ **环境不一致**  
开发环境 = 测试环境 = 生产环境

2️⃣ **部署复杂**  
原来需要安装一堆软件，现在只需要：`docker run`

3️⃣ **应用隔离**  
一个服务器可以同时运行多个独立服务（web、数据库、缓存）。

---
## 二、Docker 的优势

- **环境统一**：到哪都能运行
- **部署快**：秒级启动
- **资源占用小**：比虚拟机轻量
- **易扩展**：适合微服务架构

---

**学习目标**：
- 理解Docker核心概念
- 掌握镜像/容器/网络/juan
- 独立搭建运行一个容器化的项目

----
## 一、Docker核心概念

**镜像 image**：容器只读模版，静态文件系统。
- 通过`Dockerfile`构建

**容器 Container**：镜像运行的实例。
- 可以启动停止删除

**Dockerfile**：构建镜像的指令集。
- 可以版本化、复用。

**卷 volume**：数据持久化
- 容器重启数据不会丢失

**网络 Network**：容器间通信
 - 默认bridge，支持自定义

---

## 二、Docker安装和基础指令集

**下载**：
- **Docker Desktop（适合 macOS / Windows）**  
[https://docs.docker.com/desktop/](https://docs.docker.com/desktop/)

**官方入门教程**：
- **Get Started（官方入门实践）**  
[https://docs.docker.com/get-started/](https://docs.docker.com/get-started/)

**基础指令集**：

| 分类               | 命令示例                    | 作用说明               | 使用示例                               |
| ---------------- | ----------------------- | ------------------ | ---------------------------------- |
| **镜像管理**         | `docker pull`           | 从远程仓库拉取镜像          | `docker pull nginx:latest`         |
|                  | `docker build`          | 根据 Dockerfile 构建镜像 | `docker build -t myweb .`          |
|                  | `docker images`         | 查看本地镜像列表           | `docker images`                    |
|                  | `docker rmi`            | 删除本地镜像             | `docker rmi myweb`                 |
| **容器管理**         | `docker run`            | 创建并启动容器            | `docker run -d -p 8080:80 nginx`   |
|                  | `docker ps`             | 查看运行中的容器           | `docker ps`                        |
|                  | `docker stop`           | 停止运行中的容器           | `docker stop <container_id>`       |
|                  | `docker rm`             | 删除已停止容器            | `docker rm <container_id>`         |
| **数据卷 (Volume)** | `docker volume create`  | 创建数据卷              | `docker volume create mydata`      |
|                  | `docker run -v`         | 挂载数据卷到容器           | `docker run -v mydata:/data nginx` |
| **网络 (Network)** | `docker network create` | 创建自定义网络            | `docker network create mynet`      |
|                  | `docker run --network`  | 将容器连接到指定网络         | `docker run --network mynet nginx` |

----
## 三、项目实操
### Docker单容器应用

![[技术学习/云原生  基础设施/单容器架构示意图.png]]
### **阶段 1：准备镜像**

1. **查看本地镜像**
    - `docker images` 
	
2. **拉取远程仓库拉取镜像**
    - `docker pull nginx:latest` → 获取官方镜像

3. **自定义镜像**    
    - 创建编写` Dockerfile`
    - 构建镜像`docker build -t myweb .` 

---

### **阶段 2：使用镜像创建并启动容器**

1. **使用镜像创建并运行容器**
    
    - `docker run -d -p 8080:80 myweb` → 端口映射，后台运行
        
    - 容器：镜像的运行实例
    
2. **查看容器状态**
    
    - `docker ps` → 了解容器是否启动、端口映射情况
    
3. **端口映射暴露服务**
	
	- `docker run -p 8080:80 nginx`

---

### 阶段3：访问服务

在浏览器打开 `http://localhost:8080` → 验证网页服务

```
浏览器
↓
localhost:8080
↓
Docker端口映射
↓
容器80端口
↓
Nginx服务
```

---
### 阶段4：容器生命周期管理

**查看运行容器**：`docker ps`

**停止容器**：`docker stop <container_id>`

**删除容器**：`docker rm <container_id>`

**查看日志**：`docker logs <container_id>`

---
### 阶段5：数据持久化

容器如果需要保存数据，可以使用**数据卷**

挂在数据卷：`docker run -v mydata:/data myweb`

- 执行指令后，数据就储存在数据卷中
- 容器删除后，数据仍然存在

查看数据卷：`docker volume ls`

删除数据卷：`docker volume rm <volume_name>`


---
### Docker Compose 多容器完整流程
系统架构
```
浏览器
 ↓
Docker端口映射
 ↓
WordPress容器
 ↓
MySQL容器
```
  ![[技术学习/云原生  基础设施/多容器应用架构图.png]]
#### **第一阶段**：编写`docker-compose.yml`文件定义服务

先创建一个配置文件：

`docker-compose.yml`

用于定义整个应用的框架（包括）：

- 使用什么镜像
- 创建哪些容器
- 容器端口映射
- 容器环境变量
- 容器之间的依赖关系

#### 第二阶段：根据yml配置创建并启用容器

执行`docker compose up -d`

会自动创建网络并启动所有服务

Docker compose自动创建网络，无需手动连接容器

#### 第三阶段：Docker自动创建网络，让容器之间通过服务名通信

```bash
WORDPRESS_DB_HOST: db

# db就是mysql的服务名
```

`db`就是mysql的服务名

Docker会自动提供**内部DNS**
`wordpress 容器 → db → mysql 容器`

就自动连接起来了

#### 第四阶段：通过端口映射把容器服务暴露给宿主机

`ports:
  `- "8080:80"` 
  
将mac的 `8080` 端口映射到 Wordpress 容器的`80`端口  

那么浏览器访问`http://localhost:8080`实际上访问的是容器中的Wordpress

#### 第五阶段：浏览器访问网站

```word
浏览器
 ↓
localhost:8080
 ↓
Docker端口映射
 ↓
WordPress容器
 ↓
MySQL容器
```

**WordPress** 再从**数据库**读取数据

---
### 流程一览

1. 先准备镜像 → 构建、拉取
    
2. 再启动容器 → 测试服务
    
3. 然后管理数据 → 持久化卷
    
4. 容器生命周期管理 → 停止/删除/查看日志
    
5. 进阶 → 多容器 + 网络通信

```text
Docker镜像准备
   │
   ├─> 查看本地镜像 (docker images)
   ├─> 拉取远程镜像 (docker pull)
   └─> 自定义镜像 (docker build)

容器启动与验证
   │
   ├─> 启动容器 (docker run)
   ├─> 查看容器状态 (docker ps)
   └─> 访问服务 (浏览器测试)

数据与持久化
   │
   ├─> 挂载卷 (docker run -v)
   └─> 管理卷 (docker volume ls/rm)

容器生命周期管理
   │
   ├─> 停止容器 (docker stop)
   ├─> 删除容器 (docker rm)
   └─> 查看日志 (docker logs)

多容器协作 (进阶)
   │
   ├─> 同时运行多个容器
   └─> 容器间通信 (docker network)
```

![[技术学习/云原生  基础设施/Docker整体架构.png]]

---
## 四、Docker网络基础

### 1 什么是监听（listen）

监听：程序在某个端口等待客户端请求。

例如：

| 服务 | 监听端口 |
|-----|-----|
| Web服务器 | 80 |
| MySQL | 3306 |
| SSH | 22 |

例如： WordPress 在 80 端口监听，浏览器访问时请求会发送到该端口。

---

### 2 Docker端口映射
 
>容器怎么被访问？

Docker容器内部的端口默认外部无法访问，需要进行端口映射。

示例：

`ports:`
  `- "8080:80"`
  
含义：

宿主机8080端口 → 容器80端口

---
### 3 容器服务的访问范围  

**原理：**
Docker 通过 **端口映射（Port Mapping）** 将容器内部服务暴露到宿主机端口。  
- 例如：  `docker run -d -p 8080:80 nginx`

**含义：**
`宿主机 8080 端口 → 容器 80 端口`

**访问流程：**
`浏览器  
`↓  `
`宿主机端口 (8080)  `
`↓  `
`Docker端口映射`  
`↓  `
`容器端口 (80)  `
`↓`  
`Web服务`

---
#### 1 本机访问

在宿主机上可以通过：`http://localhost:8080`

访问容器中的 Web 服务。 

---
#### 2 局域网访问

如果其他设备能够访问宿主机 IP，例如：`http://192.168.x.x:8080`

并且**网络**与**防火墙**允许访问该端口，则局域网中的设备也可以访问容器服务。

---
#### 3 公网访问

如果 Docker 运行在 **云服务器** 上，并且开放公网 IP 和端口，例如：

`http://服务器公网IP:8080`

则互联网用户也可以访问容器中的服务。

---
### 总结

容器服务是否能够被访问，取决于以下因素：

1. 是否进行了端口映射

2. 是否能够访问宿主机 IP

3. 网络和防火墙是否开放端口
---
### 4 为什么需要端口映射

容器运行在独立网络空间，外部无法直接访问。

端口映射可以：

- 将容器服务暴露给宿主机

- 允许浏览器访问容器中的应用

---
### 5 实际访问流程
```
浏览器
↓
宿主机端口
↓
Docker端口映射
↓
容器端口
↓
Web服务
```

---
![[Pasted image 20260312000643.png]]

![[技术学习/云原生  基础设施/真实服务部署.png]]## 五、总结