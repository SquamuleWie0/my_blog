// 手写侧边栏，参考 Obsidian 文件树风格
// - 进入每个 /guide/xxx/ 或 /weekly/ 路径，显示该分区的完整嵌套树
// - 进入首页 /，显示各分区的总览（默认折叠）
// - 所有分组 collapsible: true，默认 collapsed: false（可自由折叠）

export default {
  // ============ 首页总览 ============
  '/': [
    {
      text: '周报',
      collapsible: true,
      collapsed: true,
      items: [
        { text: '2026 春夏技术成长周报', link: '/weekly/' }
      ]
    },
    {
      text: 'Agent',
      collapsible: true,
      collapsed: true,
      items: [
        { text: 'AI Agent', link: '/guide/Agent/AI Agent/AI Agent' },
        { text: 'Multi Agent', link: '/guide/Agent/AI Agent/multi-agent' },
        { text: 'AI Agent 应用开发学习复盘', link: '/guide/Agent/AI Agent/AI Agent 应用开发学习复盘' },
        { text: 'gRPC', link: '/guide/Agent/gRPC/' }
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
        { text: '断舍离之后', link: '/guide/杂札/断舍离之后' },
        { text: '年末的时候想什么', link: '/guide/杂札/年末的时候想什么' },
        { text: '什么是真正的成长', link: '/guide/杂札/什么是真正的成长' }
      ]
    }
  ],

  // ============ 周报分区 ============
  '/weekly/': [
    {
      text: '周报',
      collapsible: true,
      collapsed: false,
      items: [
        { text: '2026 春夏技术成长周报', link: '/weekly/' }
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
    },
    {
      text: 'gRPC',
      collapsible: true,
      collapsed: false,
      items: [
        { text: 'gRPC', link: '/guide/Agent/gRPC/' },
        { text: 'gRPC 微服务接入', link: '/guide/Agent/gRPC/gRPC 微服务接入' },
        { text: '从 HTTP 接口迁移到 gRPC', link: '/guide/Agent/gRPC/从 HTTP 接口迁移到 gRPC' },
        { text: 'gRPC 鉴权', link: '/guide/Agent/gRPC/gRPC 鉴权：调用方认证与用户身份解析' }
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
        { text: '断舍离之后', link: '/guide/杂札/断舍离之后' },
        { text: '年末的时候想什么', link: '/guide/杂札/年末的时候想什么' },
        { text: '什么是真正的成长', link: '/guide/杂札/什么是真正的成长' }
      ]
    }
  ]
}
