// URL 与分页的集中拼装，保证旧路径兼容且全站一致。
// 分页规则（与旧 Hexo 一致）：第 1 页是目录本身，第 N 页是 `<base>page/N/`。

/** 分类页 URL（slug 已按层级用 / 连接）。 */
export function categoryUrl(slug) {
  return `/categories/${slug}/`;
}

/**
 * Hexo 兼容的路径段编码：空白与 / 转为 -，其余字符（含中文）保持可读。
 * 与 src/lib/posts.mjs 中分类/标签 slug 规则一致。
 */
export function encodeSegment(name) {
  return String(name)
    .trim()
    .replace(/\s+/g, '-')
    .replace(/\//g, '-')
    .replace(/-+/g, '-');
}

/** 由分类层级数组生成分类页 URL。 */
export function categoryUrlFromPath(path) {
  return categoryUrl(path.map(encodeSegment).join('/'));
}

/** 标签页 URL。 */
export function tagUrl(slug) {
  return `/tags/${slug}/`;
}

/** 在某路径后追加分页（base 需以 / 结尾）。 */
export function pageUrl(base, page) {
  return page <= 1 ? base : `${base}page/${page}/`;
}

/**
 * 把列表按每页数量切分。
 * @returns {Array<{page:number,totalPages:number,items:any[]}>}
 */
export function paginate(items, perPage) {
  const size = perPage > 0 ? perPage : items.length || 1;
  const totalPages = Math.max(1, Math.ceil(items.length / size));
  const pages = [];
  for (let page = 1; page <= totalPages; page++) {
    pages.push({
      page,
      totalPages,
      items: items.slice((page - 1) * size, page * size),
    });
  }
  return pages;
}

/** 归档年 / 月路径。month 为 1-12 的数字。 */
export function archiveYearUrl(year) {
  return `/archives/${year}/`;
}

export function archiveMonthUrl(year, month) {
  const m = String(month).padStart(2, '0');
  return `/archives/${year}/${m}/`;
}
