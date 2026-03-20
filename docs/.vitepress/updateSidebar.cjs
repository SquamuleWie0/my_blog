const fs = require('fs')
const path = require('path')

// guide 根目录
const guideRoot = path.resolve(__dirname, '../guide')
const sidebarPath = path.resolve(__dirname, './sidebar.js')
const defaultCollapsed = false

function beautifyName(name) {
  return name.replace(/^\d+[_-]?/, '').replace(/\.md$/, '')
}

function walkDir(dir) {
  const items = fs.readdirSync(dir, { withFileTypes: true })

  items.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'))

  return items
    .map(item => {
      const fullPath = path.join(dir, item.name)

      if (item.isDirectory()) {
        const children = walkDir(fullPath)
        if (children.length === 0) return null

        return {
          text: beautifyName(item.name),
          collapsed: defaultCollapsed,
          items: children
        }
      }

      if (item.isFile() && item.name.endsWith('.md')) {
        if (item.name === 'index.md') return null

        const relativePath = path
          .relative(path.resolve(__dirname, '../'), fullPath)
          .replace(/\\/g, '/')
          .replace(/\.md$/, '')

        return {
          text: beautifyName(item.name),
          link: '/' + relativePath
        }
      }

      return null
    })
    .filter(Boolean)
}

function generateSidebarBySection() {
  const topDirs = fs.readdirSync(guideRoot, { withFileTypes: true })
    .filter(item => item.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'))

  const sidebarMap = {}

  for (const dir of topDirs) {
    const sectionName = dir.name
    const sectionPath = path.join(guideRoot, sectionName)
    const sectionItems = walkDir(sectionPath)

    sidebarMap[`/guide/${sectionName}/`] = [
      {
        text: sectionName,
        items: sectionItems
      }
    ]
  }

  return sidebarMap
}

const finalSidebar = generateSidebarBySection()

fs.writeFileSync(
  sidebarPath,
  `export default ${JSON.stringify(finalSidebar, null, 2)}\n`,
  'utf-8'
)

console.log('✅ sidebar.js 已按一级目录分组生成完成')