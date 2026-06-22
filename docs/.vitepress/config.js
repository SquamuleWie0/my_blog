import { defineConfig } from 'vitepress';
import sidebar from './sidebar.js';

export default defineConfig({
  title: 'wie0的博客',
  description: '记录学习笔记、项目经验与技术总结的博客',
  base: '/my_blog/',

  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: 'Agent', link: '/guide/Agent/AI Agent/AI Agent' },
      { text: '后端开发', link: '/guide/后端开发/云原生/后端+云原生能力路线' },
      { text: '部署运维', link: '/guide/部署运维/Docker/Docker' },
      { text: '课程笔记', link: '/guide/课程笔记/算法设计' },
      { text: '项目实践', link: '/guide/项目实践/RopeMind/日志/README' },
      { text: '工具箱', link: '/guide/工具箱/工程工具/Git/Git' },
      { text: '杂札', link: '/guide/杂札/step3-博客重构与迁移' }
    ],
    sidebar,
    lastUpdated: true,
    editLink: {
      pattern: 'https://github.com/SquamuleWie0/my_blog/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页'
    }
  }
});