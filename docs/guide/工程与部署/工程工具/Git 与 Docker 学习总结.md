# Git 与 Docker 学习总结

  

## 📚 今日学习概览

- **Git**：版本控制工具，用于代码管理和协作开发

- **Docker**：容器化平台，用于应用部署和环境隔离

---
## 🔧 Git 学习要点

  

### 核心概念

- **仓库（Repository）**：存储项目所有版本的文件和提交历史

- **提交（Commit）**：保存项目在某个时间点的快照

- **分支（Branch）**：独立开发线，用于功能开发或实验

- **合并（Merge）**：将分支更改整合到主分支

  

### 常用命令

```bash

# 初始化与克隆

git init

git clone <仓库地址>

  

# 提交更改

git add <文件>

git commit -m "提交说明"

  

# 分支操作

git branch <分支名>

git checkout <分支名>

git merge <分支名>

  

# 远程仓库

git remote add origin <远程地址>

git push origin <分支名>

git pull origin <分支名>

```

  

### 工作流程

1. 创建/克隆仓库

2. 创建功能分支

3. 添加和提交更改

4. 推送至远程仓库

5. 创建合并请求（Pull Request）

  
---

  

## 🐳 Docker 学习要点

  

### 核心概念

- **镜像（Image）**：只读模板，包含运行应用所需的所有内容

- **容器（Container）**：镜像的运行实例

- **Dockerfile**：构建镜像的脚本文件

- **Docker Hub**：公共镜像仓库

  

### 基本操作

```bash

# 镜像管理

docker pull <镜像名>

docker build -t <镜像名> .

docker images

  

# 容器操作

docker run -d -p 主机端口:容器端口 <镜像名>

docker ps

docker stop <容器ID>

docker rm <容器ID>

```

  

### Dockerfile 示例

```dockerfile

FROM node:14-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]

```

  

### 使用场景

1. 环境一致性保证

2. 快速部署应用

3. 微服务架构支持

4. 持续集成/持续部署（CI/CD）

  

---

  

## 💡 关键收获

  

### Git 优势

- ✅ 版本追踪和回退能力

- ✅ 团队协作开发支持

- ✅ 代码变更历史清晰可见

  

### Docker 优势

- ✅ 环境隔离，避免“在我机器上能运行”问题

- ✅ 轻量级，资源利用率高

- ✅ 快速部署和扩展

  

---

  

## 🔄 Git 与 Docker 结合使用

1. 在 Git 仓库中管理 Dockerfile 和 docker-compose 文件

2. 使用 Git 标签标记 Docker 镜像版本

3. 通过 CI/CD 流程自动构建和部署 Docker 容器

  

---

  

## 📝 后续学习建议

- [ ] 深入学习 Git 高级操作（rebase、stash等）

- [ ] 实践 Docker 网络和存储管理

- [ ] 学习 Docker Compose 多容器编排

- [ ] 了解 Kubernetes 容器编排平台

  

---

  

## 🎯 实践任务

1. 创建一个 Git 仓库，练习分支管理和合并操作

2. 编写简单的 Dockerfile 构建自定义镜像

3. 尝试将本地应用容器化并运行

  

---

  

**学习时间**：`{{当前日期}}`

**掌握程度**：基础概念理解，可进行基本操作


> 提示：建议通过实际项目练习巩固今日所学内容，理论与实践结合效果更佳。