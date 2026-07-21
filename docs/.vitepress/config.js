import { defineConfig } from 'vitepress';
import sidebar from './sidebar.js';

export default defineConfig({
  title: 'wie0的博客',
  description: '记录学习笔记、项目经验与技术总结的博客',
  base: process.env.VITEPRESS_BASE ?? '/my_blog/',

  head: [
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    ['link', { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=Pacifico&display=swap' }]
  ],

  markdown: {
    math: {
      type: 'mathjax',
      config: {
        tex: {
          inlineMath: [['$', '$'], ['\\(', '\\)']],
          displayMath: [['$$', '$$'], ['\\[', '\\]']]
        }
      }
    }
  },

  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '周报', link: '/weekly/' },
      { text: 'Agent', link: '/guide/Agent/' },
      { text: '后端开发', link: '/guide/后端开发/' },
      { text: '工程与部署', link: '/guide/工程与部署/' },
      { text: '课程笔记', link: '/guide/课程笔记/' },
      { text: '杂札', link: '/guide/杂札/' }
    ],
    sidebar,
    outline: {
      level: [2, 3, 4],
      label: '本页大纲'
    },
    lastUpdated: true,
    editLink: {
      pattern: 'https://github.com/SquamuleWie0/my_blog/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页'
    }
  }
});
