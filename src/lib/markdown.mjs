// Markdown 渲染：语法高亮、标题锚点与目录、外链安全属性、图片自适应。
// 关键约束：
//  - 不改动 source 原文，渲染期修正旧手工目录里不规范的锚点；
//  - 每页只有一个 h1，正文标题整体下移，使最小标题级别落在 h2；
//  - 代码块交给 shiki 双主题高亮，失败时回退为纯文本，不阻断构建。

import { Marked, Renderer, walkTokens } from 'marked';
import { codeToHtml } from 'shiki';

const DUAL_THEMES = { light: 'github-light', dark: 'github-dark' };

const marked = new Marked({ gfm: true, breaks: false });

/**
 * 兼容 GitHub 风格的锚点：小写、空格转连字符、去掉标点、保留中文与字母数字。
 * `Provider 是什么？` -> `provider-是什么`，可修复旧文里坏掉的 `#provider-是什么`。
 */
function slugify(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\p{L}\p{N}\-_]/gu, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** 标题纯文本（去掉内联 Markdown 记号）。 */
function plainHeadingText(token) {
  if (Array.isArray(token.tokens)) {
    return token.tokens
      .map((t) => {
        if (t.type === 'codespan') return t.text;
        if (t.type === 'text') return t.text;
        if (t.type === 'link') return t.text ?? '';
        if (Array.isArray(t.tokens)) return plainHeadingText(t);
        return t.text ?? t.raw ?? '';
      })
      .join('');
  }
  return token.text ?? '';
}

/** HTML 属性安全转义。 */
function escapeAttr(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

async function highlight(code, lang) {
  const language = String(lang || '').trim().split(/\s+/)[0] || 'text';
  try {
    return await codeToHtml(code, {
      lang: language,
      themes: DUAL_THEMES,
    });
  } catch {
    // 未知语言或高亮失败：安全转义为纯文本代码块
    const escaped = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return `<pre class="shiki-fallback"><code>${escaped}</code></pre>`;
  }
}

/**
 * 渲染一篇文章正文。
 * @param {string} markdown 正文
 * @param {{legacyIds?: string[]}} [options] legacyIds: 旧站按正文顺序的标题锚点，
 *        只用于兼容旧分享链接，不改动当前更规范的新锚点。
 * @returns {Promise<{html:string, toc:Array<{depth:number,id:string,text:string}>}>}
 */
export async function renderMarkdown(markdown, options = {}) {
  const source = String(markdown ?? '');
  if (!source.trim()) return { html: '', toc: [] };

  const tokens = marked.lexer(source);

  // 收集标题，计算整体位移，让最小级别落到 h2（原 h1 下移一级）。
  const headingTokens = [];
  walkTokens(tokens, (token) => {
    if (token.type === 'heading') headingTokens.push(token);
  });
  const minDepth = headingTokens.length
    ? Math.min(...headingTokens.map((t) => t.depth))
    : 2;
  const shift = minDepth < 2 ? 2 - minDepth : 0;

  // 预先算出新锚点，保证旧锚点注入时不会与新锚点冲突。
  const rawTexts = headingTokens.map((t) => plainHeadingText(t).trim());
  const newIds = [];
  {
    const seen = new Map();
    for (const raw of rawTexts) {
      const base = slugify(raw) || 'section';
      const count = seen.get(base) ?? 0;
      seen.set(base, count + 1);
      newIds.push(count === 0 ? base : `${base}-${count}`);
    }
  }
  const reservedIds = new Set(newIds);

  // 仅当旧锚点数量与正文标题数完全一致时才启用兼容注入，避免错位。
  const legacyIds = Array.isArray(options.legacyIds) ? options.legacyIds : [];
  const useLegacy =
    legacyIds.length > 0 && legacyIds.length === headingTokens.length;
  if (!useLegacy && legacyIds.length > 0) {
    console.warn(
      `[markdown] 旧标题锚点数(${legacyIds.length})与正文标题数(${headingTokens.length})不匹配，跳过兼容锚点。`,
    );
  }

  // 代码块先异步高亮，再按出现顺序回填。
  const codeTokens = [];
  walkTokens(tokens, (token) => {
    if (token.type === 'code') codeTokens.push(token);
  });
  const highlighted = await Promise.all(
    codeTokens.map((t) => highlight(t.text, t.lang)),
  );

  const toc = [];
  let codeIndex = 0;
  let headingIndex = 0;

  class ArticleRenderer extends Renderer {
    code() {
      return highlighted[codeIndex++] ?? '';
    }

    heading(token) {
      const index = headingIndex++;
      const depth = Math.min(6, token.depth + shift);
      const id = newIds[index] ?? `section-${index}`;
      const raw = rawTexts[index] ?? '';
      const inner = this.parser.parseInline(token.tokens);

      // 旧站锚点作为紧邻标题前的空 span 注入，保留新锚点不变。
      let legacyAnchor = '';
      if (useLegacy) {
        const legacy = legacyIds[index];
        if (legacy && legacy !== id && !reservedIds.has(legacy)) {
          reservedIds.add(legacy);
          legacyAnchor =
            `<span class="legacy-anchor" id="${escapeAttr(legacy)}" aria-hidden="true"></span>`;
        }
      }

      if (depth >= 2 && depth <= 4) toc.push({ depth, id, text: raw });
      return (
        legacyAnchor +
        `<h${depth} id="${id}" class="heading">` +
        `<a class="heading__anchor" href="#${id}" aria-label="链接到本节">#</a>` +
        `${inner}</h${depth}>`
      );
    }

    link(token) {
      const html = super.link(token);
      const href = String(token.href ?? '');
      if (/^https?:\/\//i.test(href)) {
        return html.replace(
          /^<a /,
          '<a target="_blank" rel="noopener noreferrer" ',
        );
      }
      return html;
    }

    image(token) {
      const html = super.image(token);
      return html.replace(/^<img /, '<img loading="lazy" decoding="async" ');
    }
  }

  const html = marked.parser(tokens, { renderer: new ArticleRenderer() });
  return { html, toc };
}
