/** A blog article's address: each business has its own blog. */
export const postHref = (post: { business: 'clinic' | 'academy'; slug: string }): string =>
  `/${post.business}/blog/${post.slug}`
