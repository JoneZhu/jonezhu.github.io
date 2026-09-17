import type { APIRoute } from 'astro';
import { getPosts } from '../lib/posts.mjs';
import { toPlainText, truncate } from '../lib/text.mjs';
import { site } from '../site.config.mjs';

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** 作者墙钟时间（+08）转 RFC822。 */
function pubDate(sortKey: string): string {
  return new Date(`${sortKey}+08:00`).toUTCString();
}

export const GET: APIRoute = ({ site: astroSite }) => {
  const base = astroSite ?? new URL('https://jonezhu.github.io');
  const { posts } = getPosts();
  const items = posts.slice(0, 20);

  const entries = items
    .map((post) => {
      const url = new URL(post.url, base).href;
      const description = truncate(post.excerpt || toPlainText(post.content), 200);
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <pubDate>${pubDate(post.sortKey)}</pubDate>
      <description>${escapeXml(description)}</description>
    </item>`;
    })
    .join('\n');

  const lastBuild = items[0] ? pubDate(items[0].sortKey) : new Date().toUTCString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(site.title)}</title>
    <link>${escapeXml(new URL('/', base).href)}</link>
    <description>${escapeXml(site.description)}</description>
    <language>zh-CN</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <atom:link href="${escapeXml(new URL('/rss.xml', base).href)}" rel="self" type="application/rss+xml" />
${entries}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
