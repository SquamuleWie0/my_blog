<template>
  <div>
    <div class="pp-header">
      <h1 class="pp-title">Projects</h1>
      <p class="pp-intro">我正在做、正在迭代、已经完成的项目。</p>
    </div>

    <div class="hp-divider"></div>

    <h2 class="pp-section-title">Featured</h2>

    <div class="hp-projects-grid hp-projects-stack">
      <article class="hp-project-card hp-project-card-featured" id="mergeguard-ai">
        <div class="hp-project-card-top">
          <div class="hp-project-meta">
            <span class="hp-project-status">
              <span class="hp-project-status-dot"></span>
              Live
            </span>
            <span class="hp-project-type">AI PR Review</span>
          </div>
          <h3 class="hp-project-name">MergeGuard AI</h3>
          <p class="hp-project-desc">
            AI PR Review 工作台，通过多 Agent 协作理解代码变更、评估影响范围并给出可操作的 Review 建议。
          </p>
        </div>

        <div class="hp-project-features">
          <div class="hp-project-feature">
            <div class="hp-project-feature-title">Impact Graph</div>
            <div class="hp-project-feature-desc">追踪代码变更的依赖与影响范围</div>
          </div>
          <div class="hp-project-feature">
            <div class="hp-project-feature-title">Risk Navigation</div>
            <div class="hp-project-feature-desc">定位高风险改动与潜在回归点</div>
          </div>
          <div class="hp-project-feature">
            <div class="hp-project-feature-title">Multi-Agent Review</div>
            <div class="hp-project-feature-desc">多 Agent 分工协作的代码审查</div>
          </div>
        </div>

        <div class="hp-project-actions">
          <a
            href="https://github.com/SquamuleWie0"
            class="hp-btn hp-btn-primary"
            target="_blank"
            rel="noopener"
          >GitHub ↗</a>
          <a
            href="#"
            class="hp-btn hp-btn-secondary"
            target="_blank"
            rel="noopener"
          >Demo ↗</a>
        </div>
      </article>

      <article class="hp-project-card" id="repomind">
        <div class="hp-project-card-top">
          <div class="hp-project-meta">
            <span class="hp-project-status">
              <span class="hp-project-status-dot"></span>
              Live
            </span>
            <span class="hp-project-type">Agentic RAG</span>
          </div>
          <h3 class="hp-project-name">RepoMind</h3>
          <p class="hp-project-desc">
            面向代码仓库理解的 Agentic RAG 工作台，让 AI 真正"读懂"一个项目，针对仓库做结构化问答。
          </p>
        </div>

        <div class="hp-project-actions">
          <a
            href="https://github.com/SquamuleWie0"
            class="hp-btn hp-btn-primary"
            target="_blank"
            rel="noopener"
          >GitHub ↗</a>
        </div>
      </article>
    </div>

    <div class="hp-divider"></div>

    <h2 class="pp-section-title">Archive</h2>

    <div class="hp-timeline">
      <div class="hp-timeline-item">
        <div class="hp-timeline-date">2026.04</div>
        <div class="hp-timeline-body">
          <div class="hp-timeline-title">RopeMind</div>
          <div class="hp-timeline-desc">
            个人项目实践记录
            <a href="/guide/项目实践/RopeMind/复盘" class="pp-timeline-link">查看复盘 →</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>
