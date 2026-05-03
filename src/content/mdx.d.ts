declare module '*.mdx' {
  import type { ComponentType } from 'react';
  import type { ContentFrontmatter } from './types';
  export const frontmatter: ContentFrontmatter;
  const MDXComponent: ComponentType;
  export default MDXComponent;
}
