// 旧站标题锚点兼容映射。
// 数据来源：docs/legacy-heading-ids.json（旧 Hexo 页面按正文顺序的 heading id）。
// 仅从 docs 读取，不依赖任何旧构建产物；用于在渲染时插入兼容锚点，
// 使旧分享链接（大小写/标点规则与现行不同）仍能跳转。
import fs from 'node:fs';
import path from 'node:path';

let cache = null;

function loadMap() {
  if (cache) return cache;
  const file = path.resolve(process.cwd(), 'docs', 'legacy-heading-ids.json');
  try {
    cache = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    cache = {};
  }
  return cache;
}

/** 由文章 URL（/年/月/日/slug/）取旧标题锚点数组，缺失时返回空数组。 */
export function getLegacyHeadingIds(postUrl) {
  const map = loadMap();
  const key = `${String(postUrl).replace(/^\//, '')}index.html`;
  const ids = map[key];
  return Array.isArray(ids) ? ids : [];
}
