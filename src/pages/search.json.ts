import type { APIRoute } from 'astro';
import { getPosts } from '../lib/posts.mjs';
import { toPlainText } from '../lib/text.mjs';

// 全站搜索索引：标题、正文纯文本、分类、标签。正文含代码内容，仅用于客户端安全检索。
export const GET: APIRoute = () => {
  const { posts } = getPosts();
  const index = posts.map((post) => ({
    title: post.title,
    url: post.url,
    date: post.dateStr,
    categories: post.categories,
    tags: post.tags,
    readingTime: post.readingTime,
    excerpt: post.excerpt,
    text: toPlainText(post.content),
  }));

  return new Response(JSON.stringify(index), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
