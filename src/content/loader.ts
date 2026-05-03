import type { LoadedNote, MdxModule } from './types';

/**
 * Build-time content index. `import.meta.glob` is statically analysed by Vite,
 * so each `.mdx` file is split into its own chunk and loaded on demand.
 *
 * `eager: true` resolves all modules synchronously at module init — fine here
 * because the note set is small and we want the sidebar list available without
 * a flash. Switch to lazy (`eager: false`) if the post list grows large.
 */
const noteModules = import.meta.glob<MdxModule>('./notes/*.mdx', { eager: true });

const slugFromPath = (path: string): string => {
  const match = path.match(/\/([^/]+)\.mdx$/);
  return match?.[1] ?? path;
};

/** All notes, sorted newest-first by frontmatter date. */
export const NOTES: LoadedNote[] = Object.entries(noteModules)
  .map(([path, mod]) => ({
    slug: slugFromPath(path),
    Component: mod.default,
    ...mod.frontmatter,
  }))
  .sort((a, b) => (a.date < b.date ? 1 : -1));

export const findNote = (slug: string): LoadedNote | undefined =>
  NOTES.find((n) => n.slug === slug);
