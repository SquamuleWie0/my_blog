const fs = require('fs');
const path = require('path');

// ---------------------------
// 配置
const docsRoot = path.resolve(__dirname, '../guide'); // guide 根目录
const defaultCollapsed = false; // 一级目录是否折叠
// ---------------------------

// 美化标题（去掉数字前缀和 .md 扩展名）
function beautifyName(name) {
  return name.replace(/^\d+[_-]?/, '').replace(/\.md$/, '');
}

// 遍历目录生成 sidebar，只处理 .md 文件
function walkDir(dir) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  return items.map(item => {
    const fullPath = path.join(dir, item.name);

    if (item.isDirectory()) {
      const children = walkDir(fullPath);
      if (children.length === 0) return null; // 空目录不生成
      return {
        text: beautifyName(item.name),
        collapsible: true,
        collapsed: defaultCollapsed,
        items: children
      };
    } else if (item.isFile() && item.name.endsWith('.md')) {
      // 生成 link 路径：严格相对于 docs 根目录
      const relativePath = path.relative(path.resolve(__dirname, '../'), fullPath)
        .replace(/\\/g, '/') // Windows 兼容
        .replace(/\.md$/, ''); // 去掉扩展名
      const link = '/' + relativePath;
      return { text: beautifyName(item.name), link };
    }
    return null;
  }).filter(Boolean);
}

// 生成 sidebar
const sidebar = walkDir(docsRoot);

// 写入 sidebar.js
fs.writeFileSync(
  path.resolve(__dirname, 'sidebar.js'),
  `export default ${JSON.stringify(sidebar, null, 2)}`
);

console.log('✅ sidebar.js 已生成，严格保持原路由，文章可访问');