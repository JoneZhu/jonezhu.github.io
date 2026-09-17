// @ts-check
import { defineConfig } from 'astro/config';

// Static site output for GitHub Pages.
// publicDir is pointed at a fresh, local-only directory so the old Hexo
// `public/` build output is never read, copied or polluted by Astro.
export default defineConfig({
  site: 'https://jonezhu.github.io/',
  output: 'static',
  trailingSlash: 'always',
  publicDir: './.astro-public',
});
