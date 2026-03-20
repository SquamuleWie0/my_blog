const fs = require('fs')
const path = require('path')

// 自动扫描 docs/guide 下的所有文件夹及子文件夹
const baseDir = path.join(__dirname, 'docs', 'guide')

// 递归生成 sidebar
function generateSidebar(dir, urlPrefix) {
  const items = []
  if (!fs.existsSync(dir)) return items

  const entries = fs.readdirSync(dir, { withFileTypes: true })
  entries.forEach(entry => {
    const fullPath = path.join(dir, entry.name)
    const linkPath = path.join(urlPrefix, entry.name)

    if (entry.isDirectory()) {
      const children = generateSidebar(fullPath, linkPath)
      if (children.length > 0) {
        items.push({
          text: entry.name,
          items: children
        })
      }
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
	items.push({
        	text: entry.name.replace('.md', ''),
        	link: '/' + linkPath.replace(/\\/g, '/')
      })
    }
  })

  return items
}

// 最终 sidebar 对象
const sidebar = {}
fs.readdirSync(baseDir, { withFileTypes: true })
  .filter(f => f.isDirectory())
  .forEach(folder => {
    const folderPath = path.join(baseDir, folder.name)
    const items = generateSidebar(folderPath, `guide/${folder.name}`)
    if (items.length > 0) sidebar[`/guide/${folder.name}/`] = items
  })

console.log(JSON.stringify(sidebar, null, 2))

// 👉 把 sidebar 转成首页 markdown
function generateHome(sidebar) {
  let content = `# 我的技术博客\n\n## 📚 全部内容\n\n`

  for (const key in sidebar) {
    const section = key.replace('/guide/', '').replace('/', '')

    content += `### ${section}\n`

    const items = sidebar[key]

    items.forEach(item => {
      if (item.items) {
        content += `\n#### ${item.text}\n`
        item.items.forEach(sub => {
          if (sub.items) {
            sub.items.forEach(s => {
              content += `- [${s.text}](${s.link.replace(/\.md$/, '')})\n`
            })
          } else {
            content += `- [${sub.text}](${sub.link.replace(/\.md$/, '')})\n`
          }
        })
      } else {
        content += `- [${item.text}](${item.link.replace(/\.md$/, '')})\n`
      }
    })

    content += `\n`
  }

  return content
}

// 👉 生成 index.md
const homeContent = generateHome(sidebar)

fs.writeFileSync(
  path.join(__dirname, 'docs/index.md'),
  homeContent
)

console.log('✅ 首页 index.md 已自动生成')

// 👉 生成 sidebar.js（关键）
fs.writeFileSync(
  path.join(__dirname, 'docs/.vitepress/sidebar.js'),
  'export default ' + JSON.stringify(sidebar, null, 2)
)

console.log('✅ sidebar 已自动生成')
