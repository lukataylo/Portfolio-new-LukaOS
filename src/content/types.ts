import type { ComponentType } from 'react';

/** Frontmatter shared by every MDX document. */
export interface ContentFrontmatter {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  readTime?: string;
  author?: string;
  tags?: string[];
  image?: string;
  /** When set, the document is gated behind a SHA-256 password hash. */
  passwordHash?: string;
  protected?: boolean;
}

/** Module shape of each MDX file at runtime. */
export interface MdxModule {
  default: ComponentType;
  frontmatter: ContentFrontmatter;
}

export interface LoadedDoc {
  slug: string;
  Component: ComponentType;
  frontmatter: ContentFrontmatter;
}
