/**
 * 集中站点配置。
 * 品牌、介绍、导航、精选列表、首页栏目入口、评论等统一在这里维护，
 * 布局与页面只从这里读取，避免出现闲置配置。
 */
export const site = {
  title: '无限犯错',
  author: 'JohnZhu',
  kicker: 'JohnZhu 的个人博客',
  tagline: '在技术与生活中，不断尝试，持续思考。',
  description:
    '但凡伟大一点的目标，都是经得起尝试和挑战。记录技术实践、AI 协作，以及关于成长与生活的思考。',
  perPage: 10,
  // 首页精选：主推荐 + 两篇窄栏推荐（按文章文件主名，不含 .md）。
  featured: {
    main: '云台跟踪算法研发中的AI实践与思考',
    secondary: ['无限犯错', '如何和AI打好配合'],
  },
  // 首页人工整理的三个入口（只影响展示，不改动任何原文分类层级）。
  homeCategories: [
    { label: '技术与 AI', href: '/categories/技术/' },
    { label: '成长与思考', href: '/categories/成长/' },
    { label: '生活记录', href: '/categories/生活/' },
  ],
  comments: {
    title: '有问题请留言~',
    utterances: {
      repo: 'JoneZhu/github-page-comment',
      issueTerm: 'pathname',
      theme: 'preferred-color-scheme',
      label: '',
      branch: 'main',
    },
  },
  github: 'https://github.com/JoneZhu',
};

// 顶栏导航：全站唯一来源。搜索与主题切换由布局单独渲染。
export const nav = [
  { label: '首页', href: '/' },
  { label: '文章', href: '/blog/' },
  { label: '归档', href: '/archives/' },
  { label: '关于', href: '/about/' },
];
