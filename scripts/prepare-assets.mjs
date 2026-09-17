// 构建/开发前的静态资源准备。
// 1) source/images  ->  .astro-public/images   （站点图片与 favicon）
// 2) 各文章附件目录  ->  .astro-public/<旧文章URL目录>/
//    例：source/_posts/2025年段永平浙江大学谈话/  ->  .astro-public/2025/01/15/2025年段永平浙江大学谈话/
// 说明：
//  - 绝不把 source 下的 Markdown 当作公开静态文件拷贝。
//  - 忽略 .DS_Store 与 source/_drafts 草稿。
//  - 目标目录 .astro-public 已在 .gitignore 中，不入库。
import fs from 'node:fs';
import path from 'node:path';
import { getPosts } from '../src/lib/posts.mjs';

const ROOT = process.cwd();
const OUT = path.join(ROOT, '.astro-public');
const SOURCE_IMAGES = path.join(ROOT, 'source', 'images');

// 只拷贝这些扩展名的静态资源（图片/字体/媒体），天然排除一切 .md
// 额外允许 favicon_io 下的公开说明/清单（.webmanifest / .txt），与旧 public/images 保持一致。
const COPY_EXT = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico', '.avif',
  '.bmp', '.pdf', '.mp4', '.webm', '.mp3', '.woff', '.woff2', '.ttf', '.eot',
]);

function isCopiable(srcPath, name) {
  if (name === '.DS_Store' || name === 'Thumbs.db') return false;
  const ext = path.extname(name).toLowerCase();
  if (COPY_EXT.has(ext)) return true;
  // 只允许 source/images/favicon_io 下的公开说明文件，其它位置一律不拷
  const normalized = path.normalize(srcPath);
  const faviconIO = path.join(ROOT, 'source', 'images', 'favicon_io');
  return normalized.startsWith(faviconIO + path.sep) && (ext === '.webmanifest' || ext === '.txt');
}

// 递归拷贝目录下所有可拷贝文件，保留相对结构，跳过不可拷贝项
function copyFiltered(srcDir, destDir) {
  let files = 0;
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const s = path.join(srcDir, entry.name);
    const d = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      fs.mkdirSync(d, { recursive: true });
      files += copyFiltered(s, d);
    } else if (entry.isFile() && isCopiable(s, entry.name)) {
      fs.mkdirSync(path.dirname(d), { recursive: true });
      fs.copyFileSync(s, d);
      files += 1;
    }
  }
  return files;
}

function run() {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });
  let total = 0;

  // 1) 站点图片
  if (fs.existsSync(SOURCE_IMAGES)) {
    total += copyFiltered(SOURCE_IMAGES, path.join(OUT, 'images'));
  }

  // 2) 文章附件目录 -> 旧文章 URL 目录
  const { posts } = getPosts();
  let assetDirs = 0;
  for (const post of posts) {
    const assetDir = path.join(ROOT, 'source', '_posts', post.name);
    if (!fs.existsSync(assetDir) || !fs.statSync(assetDir).isDirectory()) continue;
    // 旧 URL 去掉末尾 "/" 即为目录名，如 /2025/01/15/xxx/ -> .astro-public/2025/01/15/xxx
    const destDir = path.join(OUT, post.url.replace(/\/+$/, ''));
    const n = copyFiltered(assetDir, destDir);
    if (n > 0) assetDirs += 1;
    total += n;
  }

  // 3) 兼容别名：Hexo 历史附件路径异常。按 docs/legacy-asset-aliases.json
  //    把已跟踪 source 文件额外复制到旧公开路径，保留旧 URL。
  //    仅读已跟踪的 source，不依赖未跟踪的 public/db.json。
  const aliasFile = path.join(ROOT, 'docs', 'legacy-asset-aliases.json');
  let aliases = 0;
  if (fs.existsSync(aliasFile)) {
    const { aliases: aliasList } = JSON.parse(fs.readFileSync(aliasFile, 'utf8'));
    for (const a of aliasList) {
      const src = path.join(ROOT, a.source);
      const dest = path.join(OUT, a.old_public_path);
      if (!fs.existsSync(src)) {
        console.warn(`[prepare-assets] 别名源缺失，跳过: ${a.source}`);
        continue;
      }
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(src, dest);
      total += 1;
      aliases += 1;
    }
  }

  console.log(`[prepare-assets] 已生成 ${OUT}`);
  console.log(`[prepare-assets] 文章数=${posts.length}  附件目录=${assetDirs}  兼容别名=${aliases}  资源文件=${total}`);
}

await run();
