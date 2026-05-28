// Sindri Pixel Editor — initial sprite data + palette.
// 32×32 canvas. The demo content is a patrol drone drawn across 4 frames
// as a hover bob animation.

import type { Frame, PixelGrid, Lesson, LessonStep } from './types';

export const CANVAS_W = 32;
export const CANVAS_H = 32;

// Sindri palette — restricted to non-amber colors for sprite art.
// Amber (#f0c050) is reserved for AI affordances only.
export const SWATCHES: string[] = [
  '#0d1117', '#1a1a1a', '#4a4642', '#6e6960', '#a8a298', '#e6e1d4',
  '#6dbcdb', '#3a6e8a', '#9bb070', '#5a7038',
  '#d4541e', '#a03a0e', '#e05555', '#7a1f1f',
  '#c4beae', '#8a8580',
];

// Sprite encoding — each char is a color index into MAP below.
// '.' = transparent.
const MAP: Record<string, string | null> = {
  '.': null,
  'k': '#1a1a1a',
  'm': '#6e6960',
  'M': '#4a4642',
  's': '#a8a298',
  'c': '#6dbcdb',
  'C': '#3a6e8a',
  'o': '#d4541e',
  'O': '#a03a0e',
  'g': '#9bb070',
};

function buildDroneFrame(yOffset: number): PixelGrid {
  const grid: PixelGrid = Array(CANVAS_H).fill(null).map(() => Array(CANVAS_W).fill(null));

  const ART = [
    "......kkkkkkkk....",
    ".....kMmmmmmmMk...",
    "....kMmsmmmmmsmMk.",
    "....kmsCccccCsmmk.",
    "....kmsccccccsmmk.",
    "....kMmCccccCsmMk.",
    "....kMmmsmmsmmmMk.",
    ".....kMmmmmmmMk...",
    "......kkooookk....",
    ".......koOOok.....",
    "........kook......",
  ];

  const cx = 7;
  const baseY = 11 + yOffset;
  const baseX = 15 - cx;

  for (let r = 0; r < ART.length; r++) {
    const row = ART[r];
    for (let c = 0; c < row.length; c++) {
      const ch = row[c];
      const x = baseX + c;
      const y = baseY + r;
      if (y >= 0 && y < CANVAS_H && x >= 0 && x < CANVAS_W && MAP[ch]) {
        grid[y][x] = MAP[ch];
      }
    }
  }

  // tiny antenna spike up
  const ax = 15;
  const ay = baseY - 2;
  if (ay >= 0) grid[ay][ax] = '#1a1a1a';
  if (ay + 1 >= 0) grid[ay + 1][ax] = '#1a1a1a';

  return grid;
}

export function buildProposalFrame(): PixelGrid {
  const grid: PixelGrid = Array(CANVAS_H).fill(null).map(() => Array(CANVAS_W).fill(null));
  const ART = [
    "......kk..kkkk....",
    ".....kMm.mmmmMk...",
    "....kMm.gmmmmsmMk.",
    "....km.gggcccsmmk.",
    "....kmsg.gcccsmmk.",
    "....kMmCgg.cCsmMk.",
    "....kMmm.mm.mmmMk.",
    ".....kMmm.mmmMk...",
    "......kk.oook.k...",
    ".......k.OOk......",
    "........k.k.......",
  ];
  const cx = 7;
  const baseY = 11;
  const baseX = 15 - cx;
  for (let r = 0; r < ART.length; r++) {
    for (let c = 0; c < ART[r].length; c++) {
      const ch = ART[r][c];
      const x = baseX + c, y = baseY + r;
      if (y >= 0 && y < CANVAS_H && x >= 0 && x < CANVAS_W && MAP[ch]) {
        grid[y][x] = MAP[ch];
      }
    }
  }
  return grid;
}

// 4 frames of hover bob: offsets 0, -1, 0, +1
export const INITIAL_FRAMES: Frame[] = [0, -1, 0, 1].map((off, i) => ({
  id: `frame_${i}`,
  duration: 120,
  layers: [
    {
      id: `frame_${i}_layer_0`,
      name: 'drone',
      visible: true,
      opacity: 1,
      pixels: buildDroneFrame(off),
    },
  ],
}));

export const ZOOM_LEVELS = [4, 6, 8, 10, 14, 18, 24, 32];

// ── Seed lessons ─────────────────────────────────────────────────────────────

function makeCover(pattern: number[][]): PixelGrid {
  const grid: PixelGrid = Array(16).fill(null).map(() => Array(16).fill(null));
  const colors = ['#6dbcdb', '#9bb070', '#d4541e', '#a8a298', '#4a4642'];
  for (let y = 0; y < Math.min(pattern.length, 16); y++) {
    for (let x = 0; x < Math.min(pattern[y]?.length ?? 0, 16); x++) {
      const v = pattern[y][x];
      if (v > 0) grid[y][x] = colors[v - 1] ?? '#a8a298';
    }
  }
  return grid;
}

export const LESSONS: Lesson[] = [
  {
    id: 'l_outlines',
    title: 'Pixel outlines 101',
    description: 'Learn to draw clean closed outlines using the pencil tool.',
    tags: ['beginner', 'drawing'],
    difficulty: 'beginner',
    steps: 3,
    coverPixels: makeCover([
      [0,0,1,1,1,1,0,0],
      [0,1,0,0,0,0,1,0],
      [1,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,1],
      [0,1,0,0,0,0,1,0],
      [0,0,1,1,1,1,0,0],
    ]),
  },
  {
    id: 'l_fill',
    title: 'Flood fill & palette',
    description: 'Use the fill tool and manage your color palette.',
    tags: ['beginner', 'color'],
    difficulty: 'beginner',
    steps: 4,
    coverPixels: null,
  },
  {
    id: 'l_layers',
    title: 'Working with layers',
    description: 'Organize your artwork across multiple layers.',
    tags: ['intermediate', 'layers'],
    difficulty: 'intermediate',
    steps: 5,
    coverPixels: null,
  },
  {
    id: 'l_animation',
    title: 'Animation basics',
    description: 'Create a simple 4-frame loop with the timeline.',
    tags: ['intermediate', 'animation'],
    difficulty: 'intermediate',
    steps: 6,
    coverPixels: null,
  },
  {
    id: 'l_ai_compose',
    title: 'AI Compose with Sindri',
    description: 'Use the ✦ Compose flow to generate animation frames.',
    tags: ['advanced', 'ai'],
    difficulty: 'advanced',
    steps: 3,
    coverPixels: null,
  },
  {
    id: 'l_export',
    title: 'Exporting your sprite',
    description: 'Export PNG, GIF and sprite sheets from your project.',
    tags: ['beginner', 'export'],
    difficulty: 'beginner',
    steps: 3,
    coverPixels: null,
  },
];

// Demo lesson used in builder mode
export const DEMO_LESSON: Lesson = {
  id: 'demo_lesson',
  title: 'Draw a pixel cap',
  description: 'A short hands-on lesson: outline a helmet, flood-fill it.',
  tags: ['beginner', 'drawing'],
  difficulty: 'beginner',
  steps: [
    {
      id: 's0',
      kind: 'instruction',
      title: 'Select the pencil tool',
      goalSummary: 'Pick the pencil (P)',
      instruction: 'Find the pencil icon in the toolbar on the left. Click it or press P on your keyboard.',
      hint: 'The pencil is the first tool in the top-left of the tool grid.',
      spotlightTarget: 'toolbar',
      highlightRegion: null,
      validation: { type: 'tool_used', requiredTool: 'pencil' },
      allowedTools: ['pencil'],
      hasExampleArt: false,
    },
    {
      id: 's1',
      kind: 'task',
      title: 'Draw a closed outline',
      goalSummary: 'Draw a closed cap outline',
      instruction: 'Using the pencil, draw a closed helmet outline inside the highlighted canvas region. Make sure there are no gaps!',
      hint: 'Zoom in first with scroll wheel to draw more precisely.',
      spotlightTarget: 'canvas',
      highlightRegion: { x: 6, y: 4, w: 16, h: 10 },
      validation: { type: 'pixels_changed' },
      allowedTools: ['pencil', 'eraser'],
      hasExampleArt: true,
    },
    {
      id: 's2',
      kind: 'task',
      title: 'Flood-fill the outline',
      goalSummary: 'Fill the cap',
      instruction: 'Switch to the Fill tool (G), pick a color from the palette, then click inside your outline.',
      hint: 'Make sure your outline has no gaps — fill will leak out!',
      spotlightTarget: 'canvas',
      highlightRegion: null,
      validation: { type: 'tool_used', requiredTool: 'fill' },
      allowedTools: ['fill', 'pencil'],
      hasExampleArt: false,
    },
  ] as unknown as LessonStep[],
};
