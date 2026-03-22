import { defineConfig } from 'vitepress';
import sidebar from './sidebar.js';

export default defineConfig({
  title: 'wie0的博客',
  description: '记录学习笔记、项目经验与技术总结的博客',
  base: '/my_blog/',

  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '技术体系', link: '/guide/技术体系/基础能力/Linux' },
      { text: '课程笔记', link: '/guide/课程笔记/大学物理' },
      { text: '项目实践', link: '/guide/项目实践/个人网站部署/step1-网站部署' },
      { text: '工具箱', link: '/guide/工具箱/学习系统' }
    ],
    sidebar,
    lastUpdated: true,
    editLink: {
      pattern: 'https://github.com/SquamuleWie0/my_blog/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页'
    }
  }
});