declare module '*.mdx' {
  import type { ComponentType } from 'react';
  import type { NoteFrontmatter } from './types';

  /** Compiled MDX renderer. */
  const MDXComponent: ComponentType<Record<string, unknown>>;
  export default MDXComponent;

  /** YAML frontmatter exposed by remark-mdx-frontmatter. */
  export const frontmatter: NoteFrontmatter;
}
