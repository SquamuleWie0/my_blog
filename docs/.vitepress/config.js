import { defineConfig } from 'vitepress';
import sidebar from './sidebar.js';

export default defineConfig({
  title: 'wie0的博客',
  description: '记录学习笔记、项目经验与技术总结的博客',
  base: '/my_blog/',

  head: [
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    ['link', { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=Pacifico&display=swap' }],
    ['link', { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css' }]
  ],

  markdown: {
    math: {
      type: 'katex',
      config: {
        strict: false,
        throwOnError: false
      }
    }
  },

  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: 'Agent', link: '/guide/Agent/' },
      { text: '后端开发', link: '/guide/后端开发/' },
      { text: '工程与部署', link: '/guide/工程与部署/' },
      { text: '课程笔记', link: '/guide/课程笔记/' },
      { text: '杂札', link: '/guide/杂札/' }
    ],
    sidebar,
    lastUpdated: true,
    editLink: {
      pattern: 'https://github.com/SquamuleWie0/my_blog/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页'
    }
  }
});