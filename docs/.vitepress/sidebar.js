// 手写侧边栏，参考 Obsidian 文件树风格
// - 进入每个 /guide/xxx/ 路径，显示该分区的完整嵌套树
// - 进入首页 /，显示 6 个分区的总览（默认折叠）
// - 所有分组 collapsible: true，默认 collapsed: false（可自由折叠）

export default {
  // ============ 首页总览 ============
  '/': [
    {
      text: 'Agent',
      collapsible: true,
      collapsed: true,
      items: [
        { text: 'AI Agent', link: '/guide/Agent/AI Agent/AI Agent' },
        { text: 'Multi Agent', link: '/guide/Agent/AI Agent/multi-agent' },
        { text: 'AI Agent 应用开发学习复盘', link: '/guide/Agent/AI Agent/AI Agent 应用开发学习复盘' }
      ]
    },
    {
      text: '后端开发',
      collapsible: true,
      collapsed: true,
      items: [
        { text: '后端工程与基础设施', link: '/guide/后端开发/业务工程/后端工程与基础设施' },
        { text: 'Web 服务与业务开发', link: '/guide/后端开发/业务工程/Web服务与业务开发' },
        { text: '计算机网络基础', link: '/guide/后端开发/计算机网络基础' },
        { text: '后端 + 云原生能力路线', link: '/guide/后端开发/能力路线/后端+云原生能力路线' },
        { text: 'AI Agent（后端视角）', link: '/guide/后端开发/AI Agent后端/AI Agent' },
        { text: 'Python 后端学习复盘', link: '/guide/后端开发/AI Agent后端/Python 后端学习复盘' },
        { text: 'Go 语言基础', link: '/guide/后端开发/语言基础/Go语言基础' },
        { text: 'Python 语言与后端开发', link: '/guide/后端开发/语言基础/Python语言与后端开发' }
      ]
    },
    {
      text: '工程与部署',
      collapsible: true,
      collapsed: true,
      items: [
        { text: 'Git', link: '/guide/工程与部署/工程工具/Git/Git' },
        { text: 'Obsidian 同步到 GitHub', link: '/guide/工程与部署/工程工具/Git/Obidians同步到GitHub' },
        { text: 'Git 与 Docker 学习总结', link: '/guide/工程与部署/工程工具/Git 与 Docker 学习总结' },
        { text: 'Shell', link: '/guide/工程与部署/工程工具/shell' },
        { text: 'MIT Missing Semester', link: '/guide/工程与部署/工程工具/MIT Missing Semester' },
        { text: 'Linux', link: '/guide/工程与部署/Linux' },
        { text: 'Docker', link: '/guide/工程与部署/Docker/Docker' },
        { text: 'macOS 装 Win11 虚拟机', link: '/guide/工程与部署/macOS装win11虚拟机' }
      ]
    },
    {
      text: '课程笔记',
      collapsible: true,
      collapsed: true,
      items: [
        { text: '大学物理', link: '/guide/课程笔记/大学物理' },
        { text: '嵌入式开发与单片机', link: '/guide/课程笔记/嵌入式开发与单片机' },
        { text: '操作系统', link: '/guide/课程笔记/操作系统' },
        { text: '算法设计', link: '/guide/课程笔记/算法设计' },
        { text: '概统', link: '/guide/课程笔记/概统' },
        { text: '线性代数', link: '/guide/课程笔记/线性代数' },
        { text: '计算机组成原理', link: '/guide/课程笔记/计算机组成原理' },
        { text: '计算机网络课程笔记', link: '/guide/课程笔记/计算机网络课程笔记' },
        { text: '软件工程', link: '/guide/课程笔记/软件工程' }
      ]
    },
    {
      text: '杂札',
      collapsible: true,
      collapsed: true,
      items: [
        { text: '春札记', link: '/guide/杂札/春札记' },
        { text: '断舍离之后', link: '/guide/杂札/断舍离之后' },
        { text: '年末的时候想什么', link: '/guide/杂札/年末的时候想什么' },
        { text: '什么是真正的成长', link: '/guide/杂札/什么是真正的成长' },
        { text: '焦虑的来源', link: '/guide/杂札/焦虑的来源' }
      ]
    },
    {
      text: '项目实践',
      collapsible: true,
      collapsed: true,
      items: [
        { text: 'Blog-agent step1 搭建 learning agent 雏形', link: '/guide/项目实践/Blog-agent/step1-搭建learning agent雏形' },
        { text: 'Blog-agent step2 study agent 开发前准备', link: '/guide/项目实践/Blog-agent/step2-study agent 开发前准备' },
        { text: 'Blog-agent step3 MVP 迭代计划', link: '/guide/项目实践/Blog-agent/step3-AI 学习助手系统功能清单、开发优先级与 MVP 迭代计划' },
        { text: 'Blog-agent step4 AI 系统模块划分与实现设计', link: '/guide/项目实践/Blog-agent/step4-AI系统模块划分与实现设计' },
        { text: 'RopeMind 复盘', link: '/guide/项目实践/RopeMind/复盘' },
        { text: 'RopeMind 进度日志', link: '/guide/项目实践/RopeMind/日志/进度日志' },
        { text: 'RopeMind 日志 README', link: '/guide/项目实践/RopeMind/日志/README' }
      ]
    }
  ],

  // ============ Agent 分区（嵌套树）============
  '/guide/Agent/': [
    {
      text: 'AI Agent',
      collapsible: true,
      collapsed: false,
      items: [
        { text: 'AI Agent', link: '/guide/Agent/AI Agent/AI Agent' },
        { text: 'Multi Agent', link: '/guide/Agent/AI Agent/multi-agent' },
        { text: 'AI Agent 应用开发学习复盘', link: '/guide/Agent/AI Agent/AI Agent 应用开发学习复盘' }
      ]
    }
  ],

  // ============ 后端开发分区（嵌套树）============
  '/guide/后端开发/': [
    {
      text: '业务工程',
      collapsible: true,
      collapsed: false,
      items: [
        { text: '后端工程与基础设施', link: '/guide/后端开发/业务工程/后端工程与基础设施' },
        { text: 'Web 服务与业务开发', link: '/guide/后端开发/业务工程/Web服务与业务开发' }
      ]
    },
    {
      text: '计算机网络',
      collapsible: true,
      collapsed: false,
      items: [
        { text: '计算机网络基础', link: '/guide/后端开发/计算机网络基础' }
      ]
    },
    {
      text: '能力路线',
      collapsible: true,
      collapsed: false,
      items: [
        { text: '后端 + 云原生能力路线', link: '/guide/后端开发/能力路线/后端+云原生能力路线' }
      ]
    },
    {
      text: 'AI Agent 后端',
      collapsible: true,
      collapsed: false,
      items: [
        { text: 'AI Agent（后端视角）', link: '/guide/后端开发/AI Agent后端/AI Agent' },
        { text: 'Python 后端学习复盘', link: '/guide/后端开发/AI Agent后端/Python 后端学习复盘' }
      ]
    },
    {
      text: '语言基础',
      collapsible: true,
      collapsed: false,
      items: [
        { text: 'Go 语言基础', link: '/guide/后端开发/语言基础/Go语言基础' },
        { text: 'Python 语言与后端开发', link: '/guide/后端开发/语言基础/Python语言与后端开发' }
      ]
    }
  ],

  // ============ 工程与部署分区（嵌套树）============
  '/guide/工程与部署/': [
    {
      text: '工程工具',
      collapsible: true,
      collapsed: false,
      items: [
        {
          text: 'Git',
          collapsible: true,
          collapsed: false,
          items: [
            { text: 'Git', link: '/guide/工程与部署/工程工具/Git/Git' },
            { text: 'Obsidian 同步到 GitHub', link: '/guide/工程与部署/工程工具/Git/Obidians同步到GitHub' }
          ]
        },
        { text: 'Git 与 Docker 学习总结', link: '/guide/工程与部署/工程工具/Git 与 Docker 学习总结' },
        { text: 'Shell', link: '/guide/工程与部署/工程工具/shell' },
        { text: 'MIT Missing Semester', link: '/guide/工程与部署/工程工具/MIT Missing Semester' }
      ]
    },
    {
      text: 'Linux',
      collapsible: true,
      collapsed: false,
      items: [
        { text: 'Linux', link: '/guide/工程与部署/Linux' }
      ]
    },
    {
      text: 'Docker',
      collapsible: true,
      collapsed: false,
      items: [
        { text: 'Docker', link: '/guide/工程与部署/Docker/Docker' }
      ]
    },
    {
      text: 'macOS',
      collapsible: true,
      collapsed: false,
      items: [
        { text: 'macOS 装 Win11 虚拟机', link: '/guide/工程与部署/macOS装win11虚拟机' }
      ]
    }
  ],

  // ============ 课程笔记分区（嵌套树）============
  '/guide/课程笔记/': [
    {
      text: '课程笔记',
      collapsible: true,
      collapsed: false,
      items: [
        { text: '大学物理', link: '/guide/课程笔记/大学物理' },
        { text: '嵌入式开发与单片机', link: '/guide/课程笔记/嵌入式开发与单片机' },
        { text: '操作系统', link: '/guide/课程笔记/操作系统' },
        { text: '算法设计', link: '/guide/课程笔记/算法设计' },
        { text: '概统', link: '/guide/课程笔记/概统' },
        { text: '线性代数', link: '/guide/课程笔记/线性代数' },
        { text: '计算机组成原理', link: '/guide/课程笔记/计算机组成原理' },
        { text: '计算机网络课程笔记', link: '/guide/课程笔记/计算机网络课程笔记' },
        { text: '软件工程', link: '/guide/课程笔记/软件工程' }
      ]
    }
  ],

  // ============ 杂札分区（嵌套树）============
  '/guide/杂札/': [
    {
      text: '杂札',
      collapsible: true,
      collapsed: false,
      items: [
        { text: '春札记', link: '/guide/杂札/春札记' },
        { text: '断舍离之后', link: '/guide/杂札/断舍离之后' },
        { text: '年末的时候想什么', link: '/guide/杂札/年末的时候想什么' },
        { text: '什么是真正的成长', link: '/guide/杂札/什么是真正的成长' },
        { text: '焦虑的来源', link: '/guide/杂札/焦虑的来源' }
      ]
    }
  ],

  // ============ 项目实践分区（嵌套树）============
  '/guide/项目实践/': [
    {
      text: 'Blog-agent',
      collapsible: true,
      collapsed: false,
      items: [
        { text: 'step1 搭建 learning agent 雏形', link: '/guide/项目实践/Blog-agent/step1-搭建learning agent雏形' },
        { text: 'step2 study agent 开发前准备', link: '/guide/项目实践/Blog-agent/step2-study agent 开发前准备' },
        { text: 'step3 AI 学习助手系统功能清单、开发优先级与 MVP 迭代计划', link: '/guide/项目实践/Blog-agent/step3-AI 学习助手系统功能清单、开发优先级与 MVP 迭代计划' },
        { text: 'step4 AI 系统模块划分与实现设计', link: '/guide/项目实践/Blog-agent/step4-AI系统模块划分与实现设计' }
      ]
    },
    {
      text: 'RopeMind',
      collapsible: true,
      collapsed: false,
      items: [
        { text: '复盘', link: '/guide/项目实践/RopeMind/复盘' },
        {
          text: '日志',
          collapsible: true,
          collapsed: false,
          items: [
            { text: '进度日志', link: '/guide/项目实践/RopeMind/日志/进度日志' },
            { text: 'README', link: '/guide/项目实践/RopeMind/日志/README' }
          ]
        }
      ]
    }
  ]
}
