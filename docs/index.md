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
<p class="project-desc">围绕 Lunetale 的创作者端、用户端、GVA 主后端和 Python Agent 微服务做联调：创作者端承接世界设定、剧情结构、NPC、场景、任务等编辑；主后端通过 gRPC / Proto 调用 Agent 微服务，把剧本生成、对话、记忆、statePatch 和前端预览链路接起来。</p>
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
<strong>CreatorService.ScriptChat</strong>
<em>v2 创作入口，承接 workflowId / scriptId / contextId，返回 replyPayload 和 statePatch</em>
</span>
<span class="agent-card">
<strong>SingleAgentService.Chat</strong>
<em>v1 单智能体对话服务，把流式 SSE 聚合成 unary reply 供 Go 后端调用</em>
</span>
<span class="agent-card">
<strong>Game Prompt Orchestrator</strong>
<em>把 history、worldState、runtimeState、NPC 选择和 maxTurns 组织进生成链路</em>
</span>
<span class="agent-card">
<strong>Memory Service</strong>
<em>围绕 memory / mem0 做会话记忆、上下文承接和后续长期记忆扩展</em>
</span>
<span class="agent-card">
<strong>Prompt Assembler</strong>
<em>区分稳定规则与动态状态，服务结构化输出和 prompt caching 优化</em>
</span>
<span class="agent-card">
<strong>Structured Render</strong>
<em>用户端处理 AI Chat 的结构化 JSON、type 渲染和页面预览承接</em>
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
