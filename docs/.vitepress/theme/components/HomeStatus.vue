<script setup>
import { featuredProjects, techStack } from '../data.js'
</script>

<template>
  <div class="hp-status">
    <div class="hp-terminal" aria-label="最近状态">
      <div class="hp-terminal-header">
        <span class="hp-tdot hp-tdot-r"></span>
        <span class="hp-tdot hp-tdot-y"></span>
        <span class="hp-tdot hp-tdot-g"></span>
        <span class="hp-terminal-title">~/status</span>
      </div>
      <div class="hp-terminal-body">
        <div class="hp-term-row">
          <span class="hp-term-key">当前项目</span>
        </div>
        <div class="hp-term-row hp-term-row-value">
          <span class="hp-term-prompt">→</span>
          <span class="hp-term-value">{{ featuredProjects[0].name }}</span>
        </div>

        <div class="hp-term-row">
          <span class="hp-term-key">当前方向</span>
        </div>
        <div
          v-for="t in techStack.slice(0, 3)"
          :key="t.link"
          class="hp-term-row hp-term-row-value"
        >
          <span class="hp-term-prompt">→</span>
          <span class="hp-term-value">{{ t.name }}</span>
        </div>

        <div class="hp-term-row">
          <span class="hp-term-key">下一步目标</span>
        </div>
        <div class="hp-term-row hp-term-row-value">
          <span class="hp-term-prompt">→</span>
          <span class="hp-term-value">上线产品</span>
        </div>
        <div class="hp-term-row hp-term-row-value">
          <span class="hp-term-prompt">→</span>
          <span class="hp-term-value">获取真实用户</span>
        </div>
      </div>
    </div>
  </div>
</template>
