# 无限犯错

JohnZhu 的个人博客。中文编辑式排版，记录技术实践、AI 协作，以及关于成长与生活的思考。

站点使用 **Astro** 静态构建，输出到 `dist/`，部署到 GitHub Pages：<https://jonezhu.github.io/>

## 环境要求

- Node.js 22（见 `.nvmrc`，CI 与本地一致）
- npm 9+

## 常用命令

```bash
npm ci          # 按锁文件安装依赖（CI 使用）
npm run dev     # 本地开发，默认 http://localhost:4321
npm run preview # 预览 dist/ 构建产物
npm run build   # 构建静态站点到 dist/
npm run server  # 兼容旧习惯的别名，等同于 npm run dev
npm run new -- "文章标题"   # 新建文章
```

`predev` / `prebuild` / `preserver` 会自动运行 `scripts/prepare-assets.mjs`，把 `source/images`、文章附件目录与历史附件别名复制到 `.astro-public`（Astro 的 publicDir，不入 Git）。

## 目录结构

```
source/_posts/      文章 Markdown 原文（127 篇，保持原样）
source/_drafts/     草稿，不进入构建与搜索
source/images/      全站图片与 favicon
source/about/       关于页原文
src/lib/posts.mjs   读取 frontmatter、生成 URL/摘要/阅读时长
src/lib/markdown.mjs Markdown 渲染、语法高亮、目录、标题锚点
src/pages/          路由（首页、文章、列表、归档、分类、标签、搜索、关于、404）
src/components/     复用组件（列表、分页、目录、年份入口等）
scripts/            资源准备、新建文章
docs/               设计与迁移基准
```

## 写新文章

```bash
npm run new -- "我的新文章"            # 生成 source/_posts/我的新文章.md 与同名附件目录
npm run new -- "草稿标题" --draft      # 生成到 source/_drafts/，不会公开
npm run new -- "标题" --no-assets     # 不创建附件目录
```

生成的文件头：

```yaml
---
title: 我的新文章
date: 2026-03-07 10:00:00
categories: []
tags: []
---
```

- **日期**来自 frontmatter，不使用文件修改时间；发布时间影响排序与归档。
- **分类**是层级路径，写成数组，如 `categories: [技术, 心得]`，会同时生成 `/categories/技术/` 与 `/categories/技术/心得/`。层级与旧站一致，不要改动旧文分类。
- **标签**是并列标签，如 `tags: [AI, 效率]`。
- `draft: true` 或放在 `source/_drafts/` 的文章不会进入构建与搜索。

### 图片

有两种放置方式，按放置位置选择引用路径：

1. **单篇附件（推荐）**：放到与文章同名的目录 `source/_posts/文章名/`，正文写

   ```markdown
   ![架构说明](diagram.png)
   ```

   构建时会复制到该文章的旧 URL 目录，文章内的相对图片路径可直接访问。

2. **全站图片**：放到 `source/images/`，适合多篇文章共用的图；正文用站点绝对路径引用：

   ```markdown
   ![架构说明](/images/diagram.png)
   ```

   注意：放在 `source/_posts/文章名/` 的附件请用相对文件名（`diagram.png`）引用，不要写成 `/images/diagram.png`。

历史附件路径（含 13 条异常别名）由 `scripts/prepare-assets.mjs` 与 `docs/legacy-asset-aliases.json` 保证可用。

### 草稿与发布

草稿位于 `source/_drafts/`，移动到 `source/_posts/` 即视为发布。

关于本地预览的刷新行为（诚实说明，未做源码 watcher）：

- **编辑已有文章**：保存后在浏览器刷新页面即可看到最新内容。
- **新增/删除文章、图片或改动 `source/_posts` 目录结构**：请重启 `npm run dev`——目录扫描与文章模块在 dev 进程中有缓存，重启后才会生效。
- `npm run build` 每次都会重新读取 `source/`；`npm run preview` 仅预览最近一次构建产物，改文后需先 `npm run build`。

Astro dev 作为后台服务运行，可用命令管理：

```bash
npm run dev                        # 启动（或重新启动）dev 服务
npm run astro -- dev status        # 查看运行状态
npm run astro -- dev stop          # 停止 dev 服务
npm run astro -- dev logs          # 查看日志
```

## 站点配置

集中维护在 `src/site.config.mjs`：

- `site`：品牌、作者、介绍、每页篇数、GitHub。
- `featured`：首页精选（主推荐文件主名 + 两个次推荐文件主名）。
- `homeCategories`：首页三个入口（只影响展示，不改动原文分类）。
- `comments`：utterances 配置（仓库、issue-term、主题、分支）。
- `nav`：顶栏导航，所有页面统一读取，不在模板里重复硬编码。

## 兼容与迁移

- 文章 URL 固定为旧 Hexo 规则 `/年/月/日/文件名/`，127 篇全部保留。
- 旧路径 `/archives/`、`/archives/年/`、`/archives/年/月/`、`/archives/page/N/`、`/page/N/`、`/categories/.../page/N/`、`/tags/...`、`/notebooks/`、`/about/`、`/404.html` 均可访问。
- 旧 Hexo 配置（`_config.yml`、`themes/`）保留作为迁移依据，不再参与构建。
- 构建产物 `dist/`、`node_modules/`、`.astro/`、`.astro-public/`、旧 `public/` 均不入 Git。

## 搜索

`/search.json` 在构建时生成纯文本索引（标题、正文、代码内容、分类、标签），`/search/` 页面在客户端安全渲染（仅用 `textContent`/DOM API，不注入 HTML）。

## 评论

文章页使用 utterances（`JoneZhu/github-page-comment`，`issue-term=pathname`），以保持旧 issue 关联；深浅色切换时会同步 utterances 主题。

## 部署

`.github/workflows/pages.yml` 在推送到 `main` 时：Node 22 → `npm ci` → `npm run build` → 上传 `dist/` → 发布 GitHub Pages。

## SEO

每个页面输出 title、description、canonical、Open Graph；站点提供 `/rss.xml`、`/sitemap.xml`、`/robots.txt`。兼容与分页重复页使用 `noindex` 且不进入 sitemap。
