// updateSidebar.cjs
const fs = require('fs')
const path = require('path')

// ---------------------------
// 配置
const docsRoot = path.resolve(__dirname, '../guide') // guide 根目录
const sidebarPath = path.resolve(__dirname, 'sidebar.js')
const defaultCollapsed = false // 一级目录默认折叠状态
// ---------------------------

/**
 * 美化标题：去掉数字前缀和 .md
 */
function beautifyName(name) {
  return name.replace(/^\d+[_-]?/, '').replace(/\.md$/, '')
}

/**
 * 遍历目录生成 sidebar 项目
 */
function walkDir(dir) {
  const items = fs.readdirSync(dir, { withFileTypes: true })
  return items.map(item => {
    const fullPath = path.join(dir, item.name)
    if (item.isDirectory()) {
      const children = walkDir(fullPath)
      if (children.length === 0) return null
      return {
        text: beautifyName(item.name),
        collapsible: true,
        collapsed: defaultCollapsed,
        items: children
      }
    } else if (item.isFile() && item.name.endsWith('.md')) {
      const relativePath = path.relative(path.resolve(__dirname, '../'), fullPath)
        .replace(/\\/g, '/')
        .replace(/\.md$/, '')
      const link = '/' + relativePath
      return { text: beautifyName(item.name), link }
    }
    return null
  }).filter(Boolean)
}

/**
 * 读取原 sidebar，兼容 ES module export default
 */
let originalSidebar = []
if (fs.existsSync(sidebarPath)) {
  const sidebarModule = require(sidebarPath)
  originalSidebar = sidebarModule.default || sidebarModule
  if (!Array.isArray(originalSidebar)) originalSidebar = []
}

/**
 * 更新一级目录，如果已存在则保留折叠状态
 */
function updateSection(newSections) {
  return newSections.map(sec => {
    const dirName = sec.text
    const sectionIndex = originalSidebar.findIndex(s => s.text === dirName)
    if (sectionIndex !== -1) {
      // 保留折叠状态
      sec.collapsed = originalSidebar[sectionIndex].collapsed
    }
    return sec
  })
}

// 生成最新 sidebar
const newSidebar = walkDir(docsRoot)
const finalSidebar = updateSection(newSidebar)

// 写入 sidebar.js
fs.writeFileSync(
  sidebarPath,
  `export default ${JSON.stringify(finalSidebar, null, 2)}`
)

console.log('✅ sidebar.js 已生成 / 更新完成，文章访问保持正常')