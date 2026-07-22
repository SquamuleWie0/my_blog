---
layout: doc
sidebar: false
aside: false
---

<script setup>
import { withBase } from 'vitepress'
</script>

<div class="home-shell">
<section class="home-hero-panel">
<div class="home-hero-copy">
<p class="home-kicker">AI 应用工程化 / Agent 开发 / 后端工程</p>
<h1>Wie0</h1>
<p class="home-hero-text">开发项目进行时，同时系统构建agent、后端服务与部署体系</p>
<div class="home-hero-actions">
<a class="home-primary-action" href="#work">查看项目</a>
<a class="home-secondary-action" href="https://github.com/SquamuleWie0">GitHub</a>
</div>
</div>
<div class="home-hero-meta" aria-label="当前方向">
<span>Lunetale 联调</span>
<span>Agent 微服务</span>
<span>GVA 主后端</span>
<span>gRPC / Proto</span>
<span>LangGraph RAG</span>
<span>CI/CD 部署</span>
</div>
</section>

<section class="home-weekly-entry">
<a class="weekly-card" href="./weekly/">
<span class="weekly-card-label">
<span class="weekly-card-icon" aria-hidden="true"></span>
<span class="weekly-card-word">周报</span>
<span class="weekly-card-note">2026 春夏</span>
</span>
<span class="weekly-card-title">2026 春夏 · 工程与 Agent 周报</span>
<span class="weekly-card-desc">记录小白成长来时路：从慢慢构建认知，到在开发中接触后端、Agent、服务联调和部署里的真实问题。为伟大的小白时期留痕 (ง •̀_•́)ง</span>
<span class="weekly-card-tags">
<span>博客部署</span>
<span>Agent 微服务联调</span>
<span>gRPC / Proto</span>
<span>Prompt Caching</span>
<span>作者预览优化</span>
<span>GVA 对接</span>
</span>
</a>
<div class="weekly-growth-path" aria-label="周报成长线索">
<p class="growth-path-intro">生长线</p>
<div class="growth-path-track">
<span class="growth-step">
<strong>3 月</strong>
<em>从 Shell、Git、Docker 和服务器部署里，第一次理解一个 Web 系统怎么跑起来。</em>
</span>
<span class="growth-step">
<strong>4 月</strong>
<em>开始接触 Python 后端、pytest、异常处理和 LangChain，慢慢确定 Agent 是主线。</em>
</span>
<span class="growth-step">
<strong>5 月</strong>
<em>用 RepoMind 做项目，理解 RAG、LangGraph 和 Agentic RAG，开始按用户、流程、模块和系统结构想问题。</em>
</span>
<span class="growth-step">
<strong>6 月</strong>
<em>做 MergeGuard-AI，在限期交付里练需求收敛、架构拆分、演示表达和结果交付。</em>
</span>
<span class="growth-step">
<strong>7 月</strong>
<em>进入 Lunetale 真实项目节奏，处理 Agent 微服务、gRPC、GVA 主后端、前端预览和版本收尾。</em>
</span>
</div>
<div class="growth-path-summary">
<span>主线：AI 应用工程化 / Agent 开发</span>
<span>底座：后端、数据库、网络、gRPC、服务部署</span>
<span>方法：真实项目驱动 + 系统补课 + 源码阅读 + 复盘沉淀</span>
</div>
</div>
</section>

<section id="work" class="home-section">
<div class="home-section-heading">
<p>Selected Work</p>
<h2>作品轴</h2>
</div>

<div class="project-timeline">
<article class="project-entry project-entry-featured">
<div class="project-node" aria-hidden="true"></div>
<div class="project-card lunetale-card">
<img class="lunetale-card-bg" :src="withBase('/projects/lunetale-hero-banner.png')" alt="" aria-hidden="true">
<div class="project-card-visual">
<div class="lunetale-icon-wrap">
<img :src="withBase('/projects/lunetale-mark.png')" alt="Lunetale 图标">
</div>
<div>
<p class="project-kind">主项目组 / Multi-Agent Creation System</p>
<h3>Lunetale · 月之传说</h3>
<p class="project-desc">围绕 Lunetale 的创作者端、游戏中心、GVA 主后端和 Python Agent 微服务做联调：创作者端承接世界设定、剧情结构、NPC、场景、任务和视觉资产编辑；游戏中心接入对话 Agent，承接玩家与剧情世界的核心互动；主后端通过 gRPC / Proto 调用剧本创作 Multi-Agent、NPC 对话、记忆和状态服务，把创作、游玩预览和世界状态链路接起来。</p>
</div>
</div>

<div class="project-tags">
<span>LunetaleAgent</span>
<span>GVA 主后端</span>
<span>Genesis Studio</span>
<span>Echo 用户端</span>
<span>gRPC / Proto</span>
<span>FastAPI + SQLAlchemy</span>
</div>

<div class="agent-showcase">
<span class="agent-card">
<strong>剧本与图像生成 Agent</strong>
<em>围绕创作者输入、世界设定、角色关系、剧情结构和图片生成，产出可继续编辑的剧本与视觉资产</em>
</span>
<span class="agent-card">
<strong>NPC 对话 Agent</strong>
<em>基于角色设定、当前剧情和历史对话生成多 NPC 互动内容，降低角色口吻漂移和上下文断裂</em>
</span>
<span class="agent-card">
<strong>多 Agent 创作流编排</strong>
<em>在剧本生成、NPC 对话、图片生成、记忆和状态之间做路由，解决单一 Agent 难以覆盖完整创作流程的问题</em>
</span>
<span class="agent-card">
<strong>gRPC / Proto 微服务接入</strong>
<em>把 Python Agent 服务接入 Go / GVA 主后端，处理跨语言调用、鉴权、请求结构和返回结构</em>
</span>
<span class="agent-card">
<strong>生成稳定性工程</strong>
<em>把规则、上下文、剧情状态和缓存策略拆层管理，降低长上下文干扰、角色漂移和重复生成成本</em>
</span>
<span class="agent-card">
<strong>Memory / 长期上下文</strong>
<em>沉淀会话、角色和世界相关记忆，支撑多轮互动里的信息延续和长期玩法扩展</em>
</span>
</div>
</div>
</article>

<article class="project-entry">
<div class="project-node" aria-hidden="true"></div>
<div class="project-card compact-project-card">
<p class="project-kind">Agentic PR Review / GitHub PR Workspace</p>
<h3><a href="https://github.com/SquamuleWie0/mergeguard-ai">MergeGuard AI</a></h3>
<p class="project-desc">面向 GitHub Pull Request 的 Agentic AI 代码审查工作台。输入 PR URL 后，串联 GitHub 数据获取、Rule Engine、Fast / Deep Investigation、Evidence Chain、Impact Graph、多 Agent Review 和 Aggregator，输出风险、合并影响、证据链、Checklist 与 Review 建议。</p>
<div class="project-tags">
<span>Rule Engine</span>
<span>Fast / Deep Investigation</span>
<span>Evidence Chain</span>
<span>Impact Graph</span>
<span>Multi-Agent Review</span>
<span>Aggregator</span>
<span>Next.js + FastAPI</span>
</div>
</div>
</article>

<article class="project-entry">
<div class="project-node" aria-hidden="true"></div>
<div class="project-card compact-project-card">
<p class="project-kind">Agentic RAG / Code Repository Understanding</p>
<h3><a href="https://github.com/SquamuleWie0/RepoMind">RepoMind</a></h3>
<p class="project-desc">面向 GitHub 代码仓库理解的 Agentic RAG 工作台。输入仓库 URL 后，系统解析目录和关键文件，读取代码与文档，构建 Chroma 语义检索索引，再通过 LangGraph Tool Calling Agent 做项目导读、模块解释和代码问答。</p>
<div class="project-tags">
<span>Repository Parser</span>
<span>Chroma</span>
<span>LangGraph Tool Calling</span>
<span>RAG</span>
<span>代码问答</span>
<span>项目导读</span>
<span>Python</span>
</div>
</div>
</article>

</div>
</section>
</div>
