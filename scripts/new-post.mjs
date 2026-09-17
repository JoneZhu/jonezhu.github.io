#!/usr/bin/env node
// 新建文章草稿脚本。
// 用法：
//   npm run new -- "文章标题"            新建 source/_posts/文章标题.md（同时建同名附件目录）
//   npm run new -- "文章标题" --draft     放到 source/_drafts/文章标题.md
//   npm run new -- "文章标题" --no-assets 不创建附件目录
// 日期使用作者墙钟时区（+08），与站内其它日期一致。

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

function pad2(n) {
  return String(n).padStart(2, '0');
}

/** 当前 +08 墙钟时间字符串 YYYY-MM-DD HH:mm:ss。 */
function nowInCST() {
  const now = new Date(Date.now() + 8 * 3600 * 1000);
  return (
    `${now.getUTCFullYear()}-${pad2(now.getUTCMonth() + 1)}-${pad2(now.getUTCDate())}` +
    ` ${pad2(now.getUTCHours())}:${pad2(now.getUTCMinutes())}:${pad2(now.getUTCSeconds())}`
  );
}

const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`用法: npm run new -- "文章标题" [--draft] [--no-assets]`);
  process.exit(0);
}

const flags = new Set(args.filter((a) => a.startsWith('--')));
const title = args.find((a) => !a.startsWith('--'));

if (!title) {
  console.error('缺少文章标题。用法: npm run new -- "文章标题" [--draft] [--no-assets]');
  process.exit(1);
}

// 拒绝换行与控制字符，避免破坏路径或 frontmatter。
if (/[\u0000-\u001f\u007f]/.test(title)) {
  console.error('标题包含换行或控制字符，已拒绝。');
  process.exit(1);
}

// 文件名去掉路径与 URL 保留字符（# 会变成 fragment、% 会被当作转义），仅用于文件名。
const safeTitle = title.replace(/[\\/:*?"<>|#%]/g, '_').trim();
if (!safeTitle) {
  console.error('标题不合法。');
  process.exit(1);
}

const isDraft = flags.has('--draft');
const withAssets = !flags.has('--no-assets');
const baseDir = isDraft
  ? path.join(ROOT, 'source', '_drafts')
  : path.join(ROOT, 'source', '_posts');
const filePath = path.join(baseDir, `${safeTitle}.md`);
const assetDir = path.join(baseDir, safeTitle);

fs.mkdirSync(baseDir, { recursive: true });

if (fs.existsSync(filePath)) {
  console.error(`文件已存在: ${path.relative(ROOT, filePath)}`);
  process.exit(1);
}

const frontmatter = `---
title: ${JSON.stringify(title)}
date: ${nowInCST()}
categories: []
tags: []
---

在这里开始写正文。图片放在同名目录中，用 /images/ 或相对路径引用。
`;

fs.writeFileSync(filePath, frontmatter, 'utf8');
console.log(`已创建文章: ${path.relative(ROOT, filePath)}`);

if (withAssets && !isDraft) {
  fs.mkdirSync(assetDir, { recursive: true });
  const keep = path.join(assetDir, '.gitkeep');
  if (!fs.existsSync(keep)) fs.writeFileSync(keep, '', 'utf8');
  console.log(`已创建附件目录: ${path.relative(ROOT, assetDir)}`);
}

if (isDraft) {
  console.log('这是草稿，不会进入构建与搜索；完成后移动到 source/_posts/ 即可发布。');
}
