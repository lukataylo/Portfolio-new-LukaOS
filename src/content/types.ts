import type { ComponentType } from 'react';

/**
 * Frontmatter contract for blog posts. Authors set these in the YAML block at
 * the top of each `.mdx` file.
 *
 * ```mdx
 * ---
 * title: Notes on something
 * date: 2025-04-12
 * excerpt: One-line teaser used in the sidebar list and search.
 * tags: [design, ai]
 * readTime: 4 min read
 * image: /covers/foo.jpg
 * ---
 * ```
 */
export interface NoteFrontmatter {
  title: string;
  /** ISO date string (e.g. `2025-04-12`). */
  date: string;
  excerpt: string;
  tags?: string[];
  readTime?: string;
  /** Optional hero image rendered above the post. Relative or absolute URL. */
  image?: string;
  author?: string;
}

/**
 * What a `.mdx` module looks like once compiled. The default export is the
 * post body; the named `frontmatter` export comes from remark-mdx-frontmatter.
 */
export interface MdxModule {
  default: ComponentType<Record<string, unknown>>;
  frontmatter: NoteFrontmatter;
}

/** Loaded post: the slug (filename stem), the frontmatter, and the renderer. */
export interface LoadedNote extends NoteFrontmatter {
  slug: string;
  Component: ComponentType<Record<string, unknown>>;
}
