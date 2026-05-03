/**
 * Z-index scale. Use semantic names instead of magic numbers.
 * Keep gaps so we can insert new layers later without renumbering.
 */
export const Z = {
  desktop: 0,
  window: 100,
  windowActive: 200,
  dock: 300,
  menuBar: 400,
  dropdown: 500,
  modal: 600,
  snapPreview: 650,
  contextMenu: 700,
  spotlight: 800,
  notification: 900,
  dragGhost: 1000,
} as const;

export type ZLayer = keyof typeof Z;
