// 归档数据：按年、月分组，供归档路由与 sitemap 共用。
import { getPosts } from './posts.mjs';

/** 返回全部文章的归档结构（按时间倒序）。 */
export function getArchiveData() {
  const { posts } = getPosts();
  const years = new Map(); // year -> Map(month -> posts[])

  for (const post of posts) {
    const year = post.dateParts.y;
    const month = Number(post.dateStr.slice(5, 7));
    if (!years.has(year)) years.set(year, new Map());
    const months = years.get(year);
    if (!months.has(month)) months.set(month, []);
    months.get(month).push(post);
  }

  return [...years.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([year, months]) => ({
      year,
      posts: [...months.values()].flat(),
      months: [...months.entries()]
        .sort((a, b) => b[0] - a[0])
        .map(([month, monthPosts]) => ({ month, posts: monthPosts })),
    }));
}
