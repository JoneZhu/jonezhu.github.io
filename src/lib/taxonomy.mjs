// 分类 / 标签到文章的索引，供分类、标签路由复用。
import { getPosts } from './posts.mjs';
import { encodeSegment } from './urls.mjs';

/** slug -> 文章数组（分类按层级路径累积：父分类包含全部后代）。 */
export function getCategoryPosts() {
  const { posts } = getPosts();
  const map = new Map();
  for (const post of posts) {
    for (let i = 1; i <= post.categories.length; i++) {
      const slug = post.categories.slice(0, i).map(encodeSegment).join('/');
      if (!map.has(slug)) map.set(slug, []);
      map.get(slug).push(post);
    }
  }
  return map;
}

/** 标签 slug -> 文章数组。 */
export function getTagPosts() {
  const { posts } = getPosts();
  const map = new Map();
  for (const post of posts) {
    for (const tag of post.tags) {
      const slug = encodeSegment(tag);
      if (!map.has(slug)) map.set(slug, []);
      map.get(slug).push(post);
    }
  }
  return map;
}
