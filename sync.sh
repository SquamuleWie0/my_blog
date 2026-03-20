#!/bin/bash

# Obsidian 根目录
OBS="/Users/wie0/Library/Mobile Documents/iCloud~md~obsidian/Documents/obsidian/wie0_vault"

# VitePress docs 目录
DOCS="/Users/wie0/my_blog/vitepress/docs/guide"

echo "🚀 开始同步 Obsidian → VitePress..."

# 先清空旧内容（避免残留）
rm -rf "$DOCS"/*

# 同步5个目录
cp -r "$OBS/工程工具" "$DOCS/"
cp -r "$OBS/基础知识" "$DOCS/"
cp -r "$OBS/技术学习" "$DOCS/"
cp -r "$OBS/课程笔记" "$DOCS/"
cp -r "$OBS/项目实践" "$DOCS/"

echo "📚 同步完成"

# 更新 sidebar
echo "🧭 生成 sidebar..."
node docs/.vitepress/generateSidebar.cjs

echo "✅ sidebar 已更新"