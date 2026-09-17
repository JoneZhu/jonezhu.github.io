import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

// 直接读取仓库根下的 source/_posts。
// 用 process.cwd()（= 仓库根，Astro 从根运行 dev/build）而非 import.meta.url，
// 避免打包后相对路径漂移。
const POSTS_DIR = path.resolve(process.cwd(), 'source', '_posts');

// 时区固定：文章日期按作者本地（+08）墙钟值处理。
// URL 与显示直接取 frontmatter 的 YYYY-MM-DD 原字符串部分，排序用零填充墙钟值，
// 全程不经过 Date 本地化，保证 TZ=UTC 与 TZ=Asia/Shanghai 下结果完全一致。
const TZ_OFFSET_HOURS = 8;

let cache = null;

// 构建（production）时缓存一次；dev / 脚本运行时不缓存，
// 以便新增或编辑 source/_posts 后尽量即时生效（新增文件仍需重启 dev server 才会被目录扫描到）。
const shouldCache = process.env.NODE_ENV === 'production';

function listPostFiles() {
  return fs
    .readdirSync(POSTS_DIR, { withFileTypes: true })
    .filter((e) => e.isFile() && e.name.toLowerCase().endsWith('.md'))
    .map((e) => e.name)
    .filter((name) => name !== 'README.md');
}

function toList(value) {
  if (value == null) return [];
  if (Array.isArray(value)) return value.map((v) => String(v)).filter(Boolean);
  return String(value).split(/[,，]/).map((v) => v.trim()).filter(Boolean);
}

// Hexo URL 编码：分类/标签名称中的字符映射到文件名安全形式。
// "/" 与空格 → "-"，其余字符（含中文）保持可读。
// "CI/CD" -> "CI-CD"，"github pages" -> "github-pages"
function encodeSegment(name) {
  return String(name)
    .trim()
    .replace(/\s+/g, '-')
    .replace(/\//g, '-')
    .replace(/-+/g, '-');
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

/**
 * 从 frontmatter 原始文本里提取 date: 行的原始值（去掉可选引号）。
 * 原因：gray-matter 会把未加引号的 YAML 日期解析成 Date，String(Date) 不再是
 * YYYY-MM-DD，直接作为原始字符串会破坏 URL。因此从原文取回作者写的墙钟值。
 */
function rawDateOf(content) {
  const m = content.match(/^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(\r?\n|$)/);
  const fm = m ? m[1] : '';
  const line = fm.split(/\r?\n/).find((l) => /^date[ \t]*:/.test(l));
  if (!line) return null;
  const val = line.replace(/^date[ \t]*:[ \t]*/, '');
  return val.replace(/^["']|["']$/g, '').trim();
}

/**
 * 解析作者墙钟日期字符串，保留原分量。
 * 例：`2026-03-07 23:20:14` →
 *   urlDate:  "2026/03/07"
 *   dateStr:  "2026-03-07"
 *   sortKey:  "2026-03-07T23:20:14"  （零填充，字符串比较即 +08 时间序）
 */
function parseDateParts(raw) {
  const s = String(raw ?? '').trim().replace('T', ' ');
  const m = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
  if (!m) return null;
  const [, y, mo, d, h = '0', mi = '0', se = '0'] = m;
  return {
    y: +y,
    dateStr: `${y}-${pad2(+mo)}-${pad2(+d)}`,
    urlDate: `${y}/${pad2(+mo)}/${pad2(+d)}`,
    sortKey: `${y}-${pad2(+mo)}-${pad2(+d)}T${pad2(+h)}:${pad2(+mi)}:${pad2(+se)}`,
  };
}

// 保留旧 Hexo 规则 :year/:month/:day/:title/
// slug 直接取 markdown 文件名（不含 .md），保证中文/日期目录 URL 与旧站一致。
function urlFor(name, dateParts) {
  const slug = name.endsWith('.md') ? name.slice(0, -3) : name;
  return `/${dateParts.urlDate}/${slug}/`;
}

function readingMinutes(content) {
  const text = content.replace(/```[\s\S]*?```/g, ' ');
  const cn = (text.match(/[\u3400-\u9fff]/g) || []).length;
  const words = text
    .replace(/[\u3400-\u9fff]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .length;
  return Math.max(1, Math.round(cn / 400 + words / 200));
}

function excerptOf(content, limit = 140) {
  let t = content
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#>*_`~|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  // 去掉段首列表标记（- / + / 1. 等），原文不改，仅影响自动摘要。
  t = t
    .replace(/(^|\s)[-+]\s+/g, '$1')
    .replace(/(^|\s)\d+[.)]\s+/g, '$1')
    .trim();
  if (t.length <= limit) return t;
  return t.slice(0, limit).trimEnd() + '…';
}

// 分类语义：frontmatter categories 列表是【层级路径】，不是并列分类。
// 每个前缀都要生成独立分类页：
//   [技术, 感悟] => /categories/技术/ 与 /categories/技术/感悟/
function buildCategoryIndex(posts) {
  const map = new Map(); // slug -> record
  for (const p of posts) {
    for (let i = 1; i <= p.categories.length; i++) {
      const segs = p.categories.slice(0, i);
      const slug = segs.map(encodeSegment).join('/');
      if (!map.has(slug)) {
        map.set(slug, { name: segs[segs.length - 1], path: segs, slug, count: 0 });
      }
      map.get(slug).count += 1;
    }
  }
  return [...map.values()].sort((a, b) => b.count - a.count || a.slug.localeCompare(b.slug));
}

// tags 是并列的独立标签。
function buildTagIndex(posts) {
  const map = new Map();
  for (const p of posts) {
    for (const t of p.tags) {
      if (!map.has(t)) map.set(t, { name: t, count: 0, slug: encodeSegment(t) });
      map.get(t).count += 1;
    }
  }
  return [...map.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'zh'));
}

function buildPosts() {
  const files = listPostFiles();
  const posts = [];

  for (const file of files) {
    const raw = fs.readFileSync(path.join(POSTS_DIR, file), 'utf8');
    const { data, content } = matter(raw);

    // 草稿不进入公开内容（source/_drafts 另存；frontmatter draft 亦跳过）
    if (data.draft === true) continue;

    // 日期一律从 frontmatter 原始文本取作者墙钟值，避免 gray-matter 的 Date 转换
    const dateParts = parseDateParts(rawDateOf(raw) ?? data.date);
    if (!dateParts) {
      throw new Error(`无法解析 frontmatter date: ${file}`);
    }

    const title = String(data.title ?? file.replace(/\.md$/, '')).trim();
    const categories = toList(data.categories);
    const tags = toList(data.tags);

    posts.push({
      file,
      name: file.replace(/\.md$/, ''),
      title,
      dateParts,
      dateStr: dateParts.dateStr,
      sortKey: dateParts.sortKey,
      url: urlFor(file, dateParts),
      categories, // 层级路径数组（保持 frontmatter 原顺序）
      tags,       // 并列
      readingTime: readingMinutes(content),
      excerpt: excerptOf(content),
      content,    // 原文 markdown，交给页面渲染
    });
  }

  // 日期倒序；同日期按文件名稳定排序（sortKey 已零填充，字符串比较即 +08 墙钟序）
  posts.sort(
    (a, b) =>
      a.sortKey === b.sortKey
        ? a.file < b.file
          ? -1
          : 1
        : a.sortKey > b.sortKey
          ? -1
          : 1,
  );

  const years = [...new Set(posts.map((p) => p.dateParts.y))].sort((a, b) => b - a);
  const catIndex = buildCategoryIndex(posts);
  const tagIndex = buildTagIndex(posts);

  return {
    posts,
    years,
    categoryPaths: catIndex, // 全部层级（顶层+深层）分类页
    categoryPages: catIndex, // 供页面展示的同结构
    tags: tagIndex,          // 并列标签
    count: posts.length,
    tzOffsetHours: TZ_OFFSET_HOURS,
  };
}

export function getPosts() {
  if (!shouldCache) return buildPosts();
  if (!cache) cache = buildPosts();
  return cache;
}

export function getPostByFile(name) {
  return getPosts().posts.find((p) => p.name === name) || null;
}

export function getPostByUrl(url) {
  const target = url.endsWith('/') ? url : url + '/';
  return getPosts().posts.find((p) => p.url === target) || null;
}
