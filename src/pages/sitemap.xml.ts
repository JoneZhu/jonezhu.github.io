import type { APIRoute } from 'astro';
import { getPosts } from '../lib/posts.mjs';
import { getArchiveData } from '../lib/archives.mjs';
import { categoryUrl, tagUrl } from '../lib/urls.mjs';

function escapeXml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// 只收录 canonical 且可索引的页面：
//  - 兼容/分页重复页（/page/N/、.../page/N/）已 noindex，不进 sitemap；
//  - 标签无分页路由，不生成分页条目。
export const GET: APIRoute = ({ site: astroSite }) => {
  const base = astroSite ?? new URL('https://jonezhu.github.io');
  const { posts, categoryPaths, tags } = getPosts();
  const urls = new Set<string>();

  urls.add('/');
  urls.add('/blog/');
  urls.add('/archives/');
  urls.add('/categories/');
  urls.add('/tags/');
  urls.add('/about/');
  urls.add('/search/');

  for (const entry of getArchiveData()) {
    urls.add(`/archives/${entry.year}/`);
    for (const m of entry.months) {
      urls.add(`/archives/${entry.year}/${String(m.month).padStart(2, '0')}/`);
    }
  }

  for (const cat of categoryPaths) urls.add(categoryUrl(cat.slug));
  for (const tag of tags) urls.add(tagUrl(tag.slug));
  for (const post of posts) urls.add(post.url);

  const postLastmod = new Map(posts.map((p) => [p.url, p.dateStr]));

  const entries = [...urls].map((path) => {
    const loc = escapeXml(new URL(path, base).href);
    const lastmod = postLastmod.get(path);
    return `  <url>
    <loc>${loc}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''}
  </url>`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>
`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
