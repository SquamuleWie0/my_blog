---
title: 途中
sidebar: false
aside: false
---

<script setup>
import LifeFeed from '../.vitepress/theme/components/LifeFeed.vue'
import posts from '../.vitepress/data/life-posts.json'
</script>

<LifeFeed :posts="posts" />
