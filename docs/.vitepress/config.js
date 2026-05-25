import { defineConfig } from 'vitepress';
import sidebar from './sidebar.js';

export default defineConfig({
  title: 'wie0的博客',
  description: '记录学习笔记、项目经验与技术总结的博客',
  base: '/my_blog/',

  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '技术体系', link: '/guide/技术体系/AI Agent/AI Agent 应用开发& Python 后端开发学习复盘' },
      { text: '课程笔记', link: '/guide/课程笔记/算法设计' },
      { text: '项目实践', link: '/guide/项目实践/RopeMind/日志/README' },
      { text: '工具箱', link: '/guide/工具箱/工程工具/Git/Git' }
    ],
    sidebar,
    lastUpdated: true,
    editLink: {
      pattern: 'https://github.com/SquamuleWie0/my_blog/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页'
    }
  }
});