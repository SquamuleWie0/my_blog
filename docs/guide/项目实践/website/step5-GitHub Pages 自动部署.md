
# GitHub Pages 自动部署

这一步对我来说算是整个博客搭建流程里真正“上线”的节点。

前面我已经完成了这些事情：

- 本地把 VitePress 跑起来
- 调整了目录结构
- 把 Obsidian 的内容同步进 `docs/guide`
- 修好了首页、导航栏和侧边栏
- 把项目推到了 GitHub

接下来要做的，就是让这个博客从“本地能看”，变成“别人也能访问”。

我最后选的是 **GitHub Pages + GitHub Actions** 这套方案。  
原因很简单：

- 对纯静态博客足够用
- 不需要自己维护服务器
- 只要 `git push` 就能自动更新
- 对我现在这种内容型博客来说，维护成本最低

---

## 一、最终效果

部署成功后，博客会发布到下面这个地址：

```text
https://squamulewie0.github.io/my_blog/
````

这里有一个关键点：

我的 GitHub 用户名是 `SquamuleWie0`，仓库名是 `my_blog`，  
所以站点路径不是根域名，而是：

```text
/user/repo/
```

也就是：

```text
/my_blog/
```

这会直接影响 VitePress 的 `base` 配置。

---

## 二、为什么我没有继续用服务器

其实我前面已经把博客部署到服务器上了。  
但后来我想清楚了：

我现在这个博客本质上是一个 **静态技术文档站**，暂时不需要带数据库、登录、接口什么的的复杂项目。

所以如果继续走服务器部署，每次更新都要：

1. 本地 build
2. 再上传到服务器
3. 再检查线上有没有同步成功

这套流程虽然能用，但不够轻。

而 GitHub Pages 这条线更适合我现在这个阶段：

- 写完文章
- `git add .`
- `git commit`
- `git push`
- 自动部署完成

这套节奏更像是在维护一个持续更新的知识库。

---

## 三、VitePress 配置修改

部署到 GitHub Pages 时，我首先改的是：

```js
docs/.vitepress/config.js
```

核心是这行：

```js
base: '/my_blog/',
```

完整配置大概是这样：

```js
import { defineConfig } from 'vitepress';
import sidebar from './sidebar.js';

export default defineConfig({
  title: 'wie0的博客',
  description: '记录学习笔记、项目经验与技术总结的博客',
  base: '/my_blog/',

  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '技术体系', link: '/guide/技术体系/基础能力/Linux' },
      { text: '课程笔记', link: '/guide/课程笔记/大学物理' },
      { text: '项目实践', link: '/guide/项目实践/个人网站部署/step1-网站部署' },
      { text: '学习记录', link: '/guide/学习记录/学习系统' }
    ],
    sidebar,
    lastUpdated: true,
    editLink: {
      pattern: 'https://github.com/SquamuleWie0/my_blog/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页'
    }
  }
});
```

### 这里最容易踩的坑

如果不加这句：

```js
base: '/my_blog/'
```

那么本地预览可能没问题，但一部署到 GitHub Pages，页面资源路径就会错。

常见现象有：

- 样式丢失
- 图片不显示
- 链接异常
- 页面空白

因为 GitHub Pages 这里不是部署在根路径 `/`，而是部署在 `/my_blog/` 下面。

---

## 四、package.json 脚本调整

为了和 GitHub Actions 的流程对齐，我把 `package.json` 调整成了下面这样：

```json
{
  "name": "vitepress-blog",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "docs:dev": "vitepress dev docs",
    "docs:build": "vitepress build docs",
    "docs:preview": "vitepress preview docs"
  },
  "devDependencies": {
    "vitepress": "^1.4.0",
    "vite": "^8.0.0"
  }
}
```

这样做的目的很直接：

- 本地调试：`npm run docs:dev`
- 构建产物：`npm run docs:build`
- 本地预览构建结果：`npm run docs:preview`

后面 GitHub Actions 也会直接用 `npm run docs:build`。

---

## 五、创建 GitHub Actions 工作流

然后我新建了这个文件：

```text
.github/workflows/deploy.yml
```

里面放的是自动部署配置。

```yaml
name: Deploy VitePress site to Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v5
        with:
          fetch-depth: 0

      - name: Setup Node
        uses: actions/setup-node@v6
        with:
          node-version: 24
          cache: npm

      - name: Setup Pages
        uses: actions/configure-pages@v4
        with:
          enablement: true

      - name: Install dependencies
        run: npm ci

      - name: Build with VitePress
        run: npm run docs:build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: docs/.vitepress/dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

这套流程的逻辑很清楚：

- 代码 push 到 `main`
- GitHub 自动执行 workflow
- 安装依赖
- 构建 VitePress
- 把构建结果发布到 GitHub Pages
---

## 六、GitHub Pages 设置

除了 workflow 本身，还需要到 GitHub 仓库里手动开一下 Pages。

路径是：

```text
Settings -> Pages
```

然后把发布源设置成：

```text
GitHub Actions
```

这个步骤一开始我其实就踩了坑。

表面上我已经写好了 `deploy.yml`，但 workflow 报错：

```text
Get Pages site failed
```

后来发现根因不是代码本身，而是仓库 Pages 还没有真正启用完成。

把 Source 设成 `GitHub Actions` 之后，再重新触发 workflow，部署就成功了。

---

## 七、我实际执行的 Git 命令

把项目推到 GitHub 的基础流程是：

```bash
git init
git add .
git commit -m "初始化博客项目"
git remote add origin https://github.com/SquamuleWie0/my_blog.git
git branch -M main
git push -u origin main
```

后面每次更新文章，其实就很简单了：

```bash
git add .
git commit -m "更新博客内容"
git push
```

这时候 GitHub Actions 会自动开始跑，等 workflow 成功，线上博客就更新了。

---

## 八、部署成功后的判断方式

我最后是在 GitHub 的 `Actions` 页面里确认成功的。

当看到下面两个 job 都是绿色时，就说明整套流程已经跑通了：

- `build`
- `Deploy` 

并且会显示实际站点地址。

部署成功后，如果直接访问还是 404，也不用慌。  
这种情况很多时候只是 GitHub Pages 还在同步，等几分钟或者强刷一次就好了。

---

## 九、这一步对我的意义

如果说前面的工作是在“搭博客”，  
那这一步其实更像是在“建立一个长期输出系统”。

因为从这里开始，这个站点已经不再只是本地文件，而是一个真正在线、可访问、可持续更新的技术文档库。

这套流程跑通以后，我后面的更新方式就变得很轻：

- 在 Obsidian 写内容
- 同步到博客目录
- 修改、整理
- `git push`
- 自动上线

它已经不是一次性的部署，而是一个能长期维护的写作系统。

---

## 十、我这一步踩过的坑

### 1. `base` 没配对

这是最容易忽略的点。  
只要仓库名不是用户名主页仓库，就一定要注意子路径问题。

### 2. 以为 `git push` 会更新服务器

后来我才彻底分清：

- `git push` 更新的是 GitHub 仓库
- 配了 Actions 后，才会顺带更新 GitHub Pages
- 但它不会自动更新我自己的服务器
### 3. Pages 开了，但没真正生效

明明选了 GitHub Actions，workflow 还是报 Pages not found。  
最后重新触发一次 workflow 才恢复正常。

---

## 十一、后续计划

现在 GitHub Pages 这条线已经跑通了，后面我准备继续做这些事情：

- 优化首页内容展示
- 整理侧边栏结构
- 统一文章命名规则
- 继续把 Obsidian 的内容系统化迁移过来
- 让博客从“能用”变成“真正长期可维护”
---

## 总结

这次把博客部署到 GitHub Pages，对我来说不只是“网站上线”这么简单。
更重要的是，我把自己的写作、整理、输出流程真正接到了线上。
从这一步开始，我的博客不是一个静态成品，而是一个持续生长的技术系统。
