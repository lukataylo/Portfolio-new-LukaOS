import type { LoadedDoc, MdxModule } from './types';

/**
 * Build-time content index using Vite's `import.meta.glob`.
 * Each MDX file is split into its own chunk and loaded on demand.
 */
function load(modules: Record<string, () => Promise<unknown>>): Promise<LoadedDoc[]> {
  const entries = Object.entries(modules);
  return Promise.all(
    entries.map(async ([path, importer]) => {
      const mod = (await importer()) as MdxModule;
      const slugMatch = path.match(/\/([^/]+)\.mdx$/);
      const slug = slugMatch?.[1] ?? path;
      return {
        slug,
        Component: mod.default,
        frontmatter: mod.frontmatter,
      };
    }),
  );
}

const noteModules = import.meta.glob('./notes/*.mdx');
const caseStudyModules = import.meta.glob('./case-studies/*.mdx');

export const loadNotes = (): Promise<LoadedDoc[]> => load(noteModules);
export const loadCaseStudies = (): Promise<LoadedDoc[]> => load(caseStudyModules);
