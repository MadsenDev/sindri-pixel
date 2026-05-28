import React from 'react';
import type { SpotlightRect } from '../types';
import { IconX, IconSearch, IconSparkle, IconPlus, IconCheck } from './Icons';

// ---------------------------------------------------------------------------
// Local types
// ---------------------------------------------------------------------------

interface CoverData {
  w: number;
  h: number;
  pixels: (string | null)[][];
}

export interface TutorialLesson {
  id: string;
  title: string;
  author: string;
  difficulty: string;
  time: string;
  steps: number;
  summary: string;
  intro: string;
  cover: CoverData;
  completed: boolean;
}

// ---------------------------------------------------------------------------
// Prop interfaces
// ---------------------------------------------------------------------------

export interface TutorialLibraryProps {
  open: boolean;
  onClose: () => void;
  onStart: (lesson: TutorialLesson) => void;
  onAuthor?: () => void;
}

export interface TutorialPlayerLaneProps {
  lesson: TutorialLesson;
  stepIdx: number;
  onPrev: () => void;
  onNext: () => void;
  onExit: () => void;
  onShowHint: () => void;
  onAskAI: () => void;
  hintVisible: boolean;
  aiHintVisible: boolean;
}

export interface SpotlightCallout {
  stepIdx: number;
  text: string;
}

export interface TutorialSpotlightProps {
  targetRect: SpotlightRect | null;
  callout?: SpotlightCallout | null;
}

export interface TutorialBuilderRibbonProps {
  onExit: () => void;
  onPreview: () => void;
}

// ---------------------------------------------------------------------------
// Cover decode helpers
// ---------------------------------------------------------------------------

const __coverMap: Record<string, string | null> = {
  '.': null, 'k': '#1a1a1a', 'i': '#e6e1d4', 's': '#a8a298', 'm': '#6e6960',
  'M': '#4a4642', 'c': '#6dbcdb', 'C': '#3a6e8a', 'o': '#d4541e', 'g': '#9bb070',
  'r': '#e05555', 'y': '#f0c050',
};

function decodeCover(rows: string[]): CoverData {
  return {
    w: rows[0].length,
    h: rows.length,
    pixels: rows.map((r) => [...r].map((ch) => __coverMap[ch] ?? null)),
  };
}

// ---------------------------------------------------------------------------
// Lesson data
// ---------------------------------------------------------------------------

const LESSONS: TutorialLesson[] = [
  {
    id: 'outlines_101', title: 'Pixel outlines 101', author: 'sindri team', difficulty: 'beginner', time: '4 min', steps: 3,
    summary: 'A clean, readable outline is the spine of every pixel sprite. Learn the two-pixel rule.',
    intro: "Pick a 1-px brush, pick a contrasting ink, and we'll walk you through outlining a 12×12 mushroom.",
    cover: decodeCover([
      '..kkkkkk....', '.kssssssk...', 'krsrssrrsk..', 'krrssssrsk..', 'kssrrrrsk...',
      '.kkksskkk...', '..kssssk....', '..kssssk....', '.kssssssk...', '.kssssssk...',
      'kssssssssk..', '.kkkkkkkk...',
    ]), completed: false,
  },
  {
    id: 'dithering', title: 'Dithering basics', author: 'sindri team', difficulty: 'intermediate', time: '12 min', steps: 5,
    summary: 'Use checker, bayer, and noise dithers to blend two colors without a third.',
    intro: "You'll learn three dither patterns and where each one reads cleanly at sprite sizes.",
    cover: decodeCover([
      'mmsmsmsmsmsm', 'msmsmsmsmsms', 'mmmsmsmsmmsm', 'mmsmmmsmmmsm', 'mmmmsmmmsmmm',
      'msmmmmsmmmmm', 'mmmmmsmmmmmm', 'mmsmmmmmmmsm', 'mmmmsmmmmmmm', 'mmmmmmmmsmmm',
      'mmmmsmmmmmmm', 'mmmmmmmmmmmm',
    ]), completed: true,
  },
  {
    id: 'drone_walk', title: 'Drone walk cycle', author: 'you', difficulty: 'intermediate', time: '18 min', steps: 7,
    summary: 'Take the demo drone from a 4-frame hover to a 6-frame walk with overshoot and squash.',
    intro: "Reuse the drone_idle frames. You'll add 2 frames, shift the antenna and underglow on each.",
    cover: decodeCover([
      '............', '...kkkkkk...', '..kMmmmmMk..', '.kmsCccsmmk.',
      '.kmsccccsmk.', '.kMmCccsmMk.', '..kmmmmmMk..', '...kooook...',
      '....kook....', '............', '............', '............',
    ]), completed: false,
  },
  {
    id: 'onion_skin', title: 'Onion skin workflow', author: 'sindri team', difficulty: 'beginner', time: '6 min', steps: 3,
    summary: 'Stop guessing — line up walk frames using the previous-frame overlay.',
    intro: 'Toggle onion skin in the timeline, then build a 3-frame bounce ball with consistent contact points.',
    cover: decodeCover([
      '............', '....cccc....', '...ccccc....', '...ccccc....', '....cccc....',
      '............', '....ssss....', '...sssss....', '...sssss....', '....ssss....',
      '............', '............',
    ]), completed: true,
  },
  {
    id: 'palette_theory', title: 'Color palette theory', author: 'mira · community', difficulty: 'intermediate', time: '10 min', steps: 4,
    summary: 'Build a 6-color sprite palette from a single base hue. Hue-shift highlights and shadows.',
    intro: "Pick a base color, then we'll add light and dark variants by shifting hue, not just lightness.",
    cover: decodeCover([
      '............', '..oooooooo..', '..oyyyyyyo..', '..oyyyyyyo..', '..ooooooro..',
      '..orrrrrro..', '..orrrrrco..', '..oCCCCCco..', '..occccccg..', '..ogggggcg..',
      '..oooooogg..', '............',
    ]), completed: false,
  },
  {
    id: 'magic_wand', title: 'Cleanup with magic wand', author: 'jaiden · community', difficulty: 'beginner', time: '5 min', steps: 3,
    summary: 'Use the wand + fill to recolor large regions without redrawing.',
    intro: 'Bring in any sprite, wand-select the silhouette, and try four different fill colors.',
    cover: decodeCover([
      '............', '.ssssssss...', '.scccccss...', '.sccccccs...', '.scccccss...',
      '.sssssss....', '....s.......', '...sss......', '..sssss.....', '.sssssss....',
      '............', '............',
    ]), completed: false,
  },
];

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const tutStyles = {
  scrim: { position: 'fixed', inset: 0, background: 'rgba(13,17,23,0.66)', backdropFilter: 'blur(2px)', zIndex: 110, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: 64, paddingBottom: 64 } as React.CSSProperties,
  dialog: { width: 'min(1040px, 94vw)', maxHeight: 'calc(100vh - 128px)', background: 'var(--paper-2)', border: '1px solid var(--rule-2)', color: 'var(--ink)', fontFamily: 'var(--font-sans)', boxShadow: '0 24px 48px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', overflow: 'hidden' } as React.CSSProperties,
  dialogHead: { padding: '20px 24px 14px', borderBottom: '1px solid var(--rule-2)', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 } as React.CSSProperties,
  dialogTitle: { fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--ink)' } as React.CSSProperties,
  dialogSub: { fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-4)', letterSpacing: '0.06em', marginTop: 4 } as React.CSSProperties,
  dialogClose: { width: 32, height: 32, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--rule-2)', color: 'var(--ink-3)', cursor: 'pointer' } as React.CSSProperties,
  tabs: { display: 'flex', padding: '0 24px', borderBottom: '1px solid var(--rule)', alignItems: 'flex-end', gap: 22 } as React.CSSProperties,
  tab: (active: boolean): React.CSSProperties => ({ paddingBottom: 10, paddingTop: 14, fontSize: 12.5, color: active ? 'var(--ink)' : 'var(--ink-3)', fontWeight: active ? 500 : 400, borderBottom: active ? '2px solid var(--ink)' : '2px solid transparent', marginBottom: -1, cursor: 'pointer' }),
  tabBadge: { fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-4)', border: '1px solid var(--rule-2)', padding: '0 5px', marginLeft: 6 } as React.CSSProperties,
  searchRow: { display: 'flex', alignItems: 'center', gap: 10, padding: '14px 24px', borderBottom: '1px solid var(--rule)' } as React.CSSProperties,
  searchInput: { flex: 1, background: 'var(--paper)', border: '1px solid var(--rule-2)', color: 'var(--ink)', fontFamily: 'var(--font-display)', fontSize: 13, padding: '8px 12px', outline: 'none' } as React.CSSProperties,
  composeBtn: { display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: 'var(--font-display)', fontSize: 12, color: 'var(--amber)', cursor: 'pointer', padding: '7px 12px', border: '1px solid var(--amber)', whiteSpace: 'nowrap' } as React.CSSProperties,
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: 'var(--rule)', flex: 1, minHeight: 0, overflowY: 'auto' } as React.CSSProperties,
  card: { background: 'var(--paper-2)', padding: 14, display: 'grid', gridTemplateColumns: '88px 1fr', gap: 12, alignItems: 'start', cursor: 'pointer', position: 'relative', minHeight: 132 } as React.CSSProperties,
  cardHover: { background: 'var(--paper-3)' } as React.CSSProperties,
  cardCoverWrap: { position: 'relative', width: 88, height: 88, flex: 'none' } as React.CSSProperties,
  cardCover: { width: 88, height: 88, background: '#0a0e14', border: '1px solid var(--rule-2)', imageRendering: 'pixelated', display: 'block' } as React.CSSProperties,
  cardBody: { display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0, height: '100%' } as React.CSSProperties,
  cardTitleBlock: { display: 'flex', flexDirection: 'column', gap: 4 } as React.CSSProperties,
  cardTitle: { fontFamily: 'var(--font-display)', fontSize: 14, color: 'var(--ink)', lineHeight: 1.25, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } as React.CSSProperties,
  cardSummary: { fontSize: 11.5, color: 'var(--ink-3)', lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as React.CSSProperties,
  cardMeta: { fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--ink-4)', letterSpacing: '0.06em', display: 'flex', gap: 8, alignItems: 'center', whiteSpace: 'nowrap' } as React.CSSProperties,
  cardMetaDot: { width: 3, height: 3, background: 'var(--ink-4)', flex: 'none' } as React.CSSProperties,
  completedBadge: { position: 'absolute', bottom: 4, right: 4, fontFamily: 'var(--font-mono)', fontSize: 9, padding: '1px 5px', color: 'var(--paper)', background: 'var(--moss)', letterSpacing: '0.1em', textTransform: 'uppercase' } as React.CSSProperties,
  difficulty: (_level: string): React.CSSProperties => ({ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-4)', border: '1px solid var(--rule-2)', padding: '0 5px', textTransform: 'uppercase', letterSpacing: '0.08em' }),
  laneRoot: { display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', fontFamily: 'var(--font-sans)', color: 'var(--ink)' } as React.CSSProperties,
  laneHead: { padding: '16px 22px 14px', borderBottom: '1px solid var(--rule-2)', background: 'var(--paper-2)' } as React.CSSProperties,
  laneKicker: { fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--cyan)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8 } as React.CSSProperties,
  laneTitle: { fontFamily: 'var(--font-display)', fontSize: 17, color: 'var(--ink)', lineHeight: 1.25 } as React.CSSProperties,
  laneSub: { fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--ink-4)', letterSpacing: '0.06em', marginTop: 6 } as React.CSSProperties,
  progressRow: { display: 'flex', gap: 3, padding: '14px 22px 10px' } as React.CSSProperties,
  progDot: (state: string): React.CSSProperties => ({ flex: 1, height: 4, background: state === 'done' ? 'var(--moss)' : state === 'current' ? 'var(--cyan)' : 'var(--paper-4)' }),
  stepList: { flex: 1, overflowY: 'auto' } as React.CSSProperties,
  stepRow: (state: string): React.CSSProperties => ({ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 22px', borderBottom: '1px solid var(--rule)', background: state === 'current' ? 'var(--paper-3)' : 'transparent', borderLeft: state === 'current' ? '2px solid var(--cyan)' : '2px solid transparent', cursor: 'pointer' }),
  stepIdx: (state: string): React.CSSProperties => ({ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: state === 'done' ? 'var(--moss)' : state === 'current' ? 'var(--cyan)' : 'var(--ink-4)', width: 18, flex: 'none', marginTop: 2 }),
  stepText: { flex: 1, minWidth: 0 } as React.CSSProperties,
  stepTitle: (state: string): React.CSSProperties => ({ fontSize: 12.5, color: state === 'current' ? 'var(--ink)' : 'var(--ink-3)', fontWeight: state === 'current' ? 500 : 400, lineHeight: 1.35, textDecoration: state === 'done' ? 'line-through' : 'none', textDecorationColor: 'var(--ink-4)' }),
  stepKind: { fontFamily: 'var(--font-mono)', fontSize: 9.5, color: 'var(--ink-4)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 3 } as React.CSSProperties,
  currentCard: { padding: '14px 22px', borderTop: '1px solid var(--rule-2)', background: 'var(--paper)' } as React.CSSProperties,
  goalRow: { display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10, color: 'var(--cyan)', fontSize: 12, fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' } as React.CSSProperties,
  goalDot: { width: 7, height: 7, background: 'var(--cyan)', flex: 'none', marginTop: 5 } as React.CSSProperties,
  instruction: { color: 'var(--ink)', fontSize: 13.5, lineHeight: 1.5, marginBottom: 14 } as React.CSSProperties,
  criteria: { display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 } as React.CSSProperties,
  critRow: (met: boolean): React.CSSProperties => ({ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-mono)', fontSize: 11, color: met ? 'var(--moss)' : 'var(--ink-3)' }),
  critGlyph: { width: 12, height: 12, flex: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' } as React.CSSProperties,
  hint: { marginTop: 8, padding: '10px 12px', background: 'var(--paper-2)', border: '1px solid var(--rule-2)', fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.5 } as React.CSSProperties,
  hintLabel: { fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-4)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 } as React.CSSProperties,
  aiHint: { marginTop: 8, padding: '10px 12px', background: 'rgba(240,192,80,0.06)', border: '1px solid var(--amber)', fontSize: 12, color: 'var(--ink)', lineHeight: 1.5 } as React.CSSProperties,
  aiHintHead: { display: 'flex', alignItems: 'center', gap: 7, color: 'var(--amber)', fontFamily: 'var(--font-display)', fontSize: 12, marginBottom: 6 } as React.CSSProperties,
  aiHintRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 } as React.CSSProperties,
  laneFooter: { padding: '12px 14px', borderTop: '1px solid var(--rule-2)', background: 'var(--paper-2)', display: 'flex', gap: 5 } as React.CSSProperties,
  laneBtn: (variant: string): React.CSSProperties => ({ fontFamily: 'var(--font-display)', fontSize: 11.5, padding: '8px 8px', cursor: 'pointer', flex: variant === 'primary' ? 1.3 : 1, textAlign: 'center', background: variant === 'primary' ? 'var(--cyan)' : 'transparent', color: variant === 'primary' ? 'var(--paper)' : variant === 'exit' ? 'var(--ink-3)' : 'var(--cyan)', border: variant === 'exit' ? '1px solid var(--rule-2)' : '1px solid var(--cyan)', whiteSpace: 'nowrap' }),
  laneBtnAi: { fontFamily: 'var(--font-display)', fontSize: 11.5, padding: '8px 8px', cursor: 'pointer', flex: 1.3, textAlign: 'center', background: 'transparent', color: 'var(--amber)', border: '1px solid var(--amber)', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5 } as React.CSSProperties,
  spotRoot: { position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 30 } as React.CSSProperties,
  spotDim: { position: 'absolute', background: 'rgba(13,17,23,0.62)' } as React.CSSProperties,
  spotHole: { position: 'absolute', border: '2px solid var(--cyan)', boxShadow: '0 0 0 1px rgba(13,17,23,0.6), inset 0 0 0 1px rgba(13,17,23,0.6)', pointerEvents: 'none' } as React.CSSProperties,
  callout: { position: 'absolute', background: 'var(--paper-2)', border: '1px solid var(--cyan)', padding: '8px 12px', maxWidth: 240, color: 'var(--ink)', fontFamily: 'var(--font-display)', fontSize: 12, pointerEvents: 'auto' } as React.CSSProperties,
  calloutKicker: { fontFamily: 'var(--font-mono)', fontSize: 9.5, color: 'var(--cyan)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 } as React.CSSProperties,
  calloutTail: { position: 'absolute', width: 8, height: 8, background: 'var(--paper-2)', border: '1px solid var(--cyan)', borderTop: 'none', borderLeft: 'none', transform: 'rotate(45deg)' } as React.CSSProperties,
  ribbon: { height: 24, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(224,85,85,0.10)', borderBottom: '1px solid var(--red)', color: 'var(--red)', fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '0.14em', textTransform: 'uppercase', gap: 14 } as React.CSSProperties,
  ribbonBtn: { fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--red)', border: '1px solid var(--red)', padding: '1px 8px', cursor: 'pointer', letterSpacing: '0.06em' } as React.CSSProperties,
};

// ---------------------------------------------------------------------------
// CoverPreview (local, not exported)
// ---------------------------------------------------------------------------

interface CoverPreviewProps {
  cover: CoverData;
  size?: number;
}

function CoverPreview({ cover, size = 160 }: CoverPreviewProps) {
  const ref = React.useRef<HTMLCanvasElement>(null);
  React.useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    const s = c.width / cover.w;
    for (let y = 0; y < cover.h; y++) for (let x = 0; x < cover.w; x++) {
      ctx.fillStyle = ((Math.floor(x / 4) + Math.floor(y / 4)) % 2) ? '#0a0e14' : '#11161d';
      ctx.fillRect(x * s, y * s, s, s);
    }
    for (let y = 0; y < cover.h; y++) for (let x = 0; x < cover.w; x++) {
      const col = cover.pixels[y][x];
      if (!col) continue;
      ctx.fillStyle = col;
      ctx.fillRect(x * s, y * s, s, s);
    }
  }, [cover, size]);
  return <canvas ref={ref} width={size} height={size} style={tutStyles.cardCover} />;
}

// ---------------------------------------------------------------------------
// TutorialLibrary
// ---------------------------------------------------------------------------

export function TutorialLibrary({ open, onClose, onStart, onAuthor }: TutorialLibraryProps) {
  const [tab, setTab] = React.useState<string>('library');
  const [query, setQuery] = React.useState('');
  const [hover, setHover] = React.useState<string | null>(null);

  if (!open) return null;

  const filtered = LESSONS.filter((l) => {
    if (tab === 'community' && !l.author.includes('community')) return false;
    if (tab === 'mine' && l.author !== 'you') return false;
    if (query && !l.title.toLowerCase().includes(query.toLowerCase()) && !l.summary.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={tutStyles.scrim} onClick={onClose}>
      <div style={tutStyles.dialog} onClick={(e) => e.stopPropagation()}>
        <div style={tutStyles.dialogHead}>
          <div>
            <div style={tutStyles.dialogTitle}>Lessons</div>
            <div style={tutStyles.dialogSub}>guided pixel-art tutorials · runs live inside the editor</div>
          </div>
          <span style={tutStyles.dialogClose} onClick={onClose} title="Close"><IconX size={11} /></span>
        </div>
        <div style={tutStyles.tabs}>
          <div style={tutStyles.tab(tab === 'library')} onClick={() => setTab('library')}>All<span style={tutStyles.tabBadge}>{LESSONS.length}</span></div>
          <div style={tutStyles.tab(tab === 'community')} onClick={() => setTab('community')}>Community<span style={tutStyles.tabBadge}>{LESSONS.filter((l) => l.author.includes('community')).length}</span></div>
          <div style={tutStyles.tab(tab === 'mine')} onClick={() => setTab('mine')}>Mine<span style={tutStyles.tabBadge}>{LESSONS.filter((l) => l.author === 'you').length}</span></div>
        </div>
        <div style={tutStyles.searchRow}>
          <span style={{ color: 'var(--ink-4)' }}><IconSearch size={13} /></span>
          <input style={tutStyles.searchInput} placeholder="Search lessons…" value={query} onChange={(e) => setQuery(e.target.value)} />
          <span style={tutStyles.composeBtn} onClick={() => { onClose(); onAuthor?.(); }} title="Sindri-drafted lesson">
            <IconSparkle size={11} stroke="var(--amber)" /> Draft with Sindri
          </span>
          <span style={{ ...tutStyles.composeBtn, color: 'var(--ink)', border: '1px solid var(--rule-2)' }} onClick={() => { onClose(); onAuthor?.(); }}>
            <IconPlus size={11} /> New lesson
          </span>
        </div>
        <div style={tutStyles.grid}>
          {filtered.map((l) => (
            <div
              key={l.id}
              style={{ ...tutStyles.card, ...(hover === l.id ? tutStyles.cardHover : null) }}
              onMouseEnter={() => setHover(l.id)}
              onMouseLeave={() => setHover(null)}
              onClick={() => onStart(l)}
            >
              <div style={tutStyles.cardCoverWrap}>
                <CoverPreview cover={l.cover} size={96} />
                {l.completed && <span style={tutStyles.completedBadge}>done</span>}
              </div>
              <div style={tutStyles.cardBody}>
                <div style={tutStyles.cardTitleBlock}>
                  <div style={tutStyles.cardTitle}>{l.title}</div>
                  <div style={tutStyles.cardSummary}>{l.summary}</div>
                </div>
                <div style={{ flex: 1 }} />
                <div style={tutStyles.cardMeta}>
                  <span style={tutStyles.difficulty(l.difficulty)}>{l.difficulty}</span>
                  <span>{l.steps} steps</span>
                  <span style={tutStyles.cardMetaDot} />
                  <span>{l.time}</span>
                </div>
                <div style={{ ...tutStyles.cardMeta, color: 'var(--ink-3)' }}>
                  <span>{l.author}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// TutorialPlayerLane
// ---------------------------------------------------------------------------

interface PlayerStep {
  title: string;
  kind: string;
  criteria: { label: string; met: boolean }[];
}

export function TutorialPlayerLane({ lesson, stepIdx, onNext, onExit, onShowHint, onAskAI, hintVisible, aiHintVisible }: TutorialPlayerLaneProps) {
  const steps = React.useMemo<PlayerStep[]>(() => {
    const stepArr: PlayerStep[] = [
      {
        title: 'Pick the pencil and pick a dark ink', kind: 'use_tool',
        criteria: [{ label: 'tool: pencil', met: stepIdx > 0 }, { label: 'color: any dark', met: stepIdx > 0 }],
      },
      {
        title: 'Outline the mushroom cap', kind: 'draw_closed_shape',
        criteria: [{ label: '≥ 18 pixels placed', met: stepIdx > 1 }, { label: 'shape is closed', met: stepIdx > 1 }],
      },
      {
        title: 'Fill the cap with red', kind: 'use_fill',
        criteria: [{ label: 'fill in cap region', met: false }, { label: 'color: red family', met: false }],
      },
    ];
    return stepArr.slice(0, lesson.steps);
  }, [lesson.steps, stepIdx]);

  const current = steps[stepIdx];
  const goals = ['Switch to the pencil with any dark ink', 'Draw a closed outline of the cap', 'Bucket-fill the cap interior with red'];
  const goal = goals[stepIdx] ?? '';

  return (
    <div style={tutStyles.laneRoot}>
      <div style={tutStyles.laneHead}>
        <div style={tutStyles.laneKicker}>● lesson · in progress</div>
        <div style={tutStyles.laneTitle}>{lesson.title}</div>
        <div style={tutStyles.laneSub}>{lesson.difficulty} · {lesson.author} · step {stepIdx + 1} of {steps.length}</div>
      </div>
      <div style={tutStyles.progressRow}>
        {steps.map((_, i) => (
          <span key={i} style={tutStyles.progDot(i < stepIdx ? 'done' : i === stepIdx ? 'current' : 'pending')} />
        ))}
      </div>
      <div style={tutStyles.stepList}>
        {steps.map((s, i) => {
          const state = i < stepIdx ? 'done' : i === stepIdx ? 'current' : 'pending';
          return (
            <div key={i} style={tutStyles.stepRow(state)}>
              <span style={tutStyles.stepIdx(state)}>
                {state === 'done' ? <IconCheck size={11} stroke="var(--moss)" /> : String(i + 1).padStart(2, '0')}
              </span>
              <div style={tutStyles.stepText}>
                <div style={tutStyles.stepTitle(state)}>{s.title}</div>
                <div style={tutStyles.stepKind}>{s.kind}</div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={tutStyles.currentCard}>
        <div style={tutStyles.goalRow}><span style={tutStyles.goalDot} /><span>goal · {goal}</span></div>
        <div style={tutStyles.instruction}>{current?.title}.</div>
        <div style={tutStyles.criteria}>
          {current?.criteria.map((c, i) => (
            <div key={i} style={tutStyles.critRow(c.met)}>
              <span style={tutStyles.critGlyph}>
                {c.met
                  ? <IconCheck size={10} stroke="var(--moss)" />
                  : <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square"><rect x="0.5" y="0.5" width="9" height="9" /></svg>}
              </span>
              <span>{c.label}</span>
            </div>
          ))}
        </div>
        {hintVisible && (
          <div style={tutStyles.hint}>
            <div style={tutStyles.hintLabel}>hint</div>
            <div>Pick the pencil from the toolbar (P) and pick any dark ink from the palette. Don't worry about the exact hex — the lesson checks the family.</div>
          </div>
        )}
        {aiHintVisible && (
          <div style={tutStyles.aiHint}>
            <div style={tutStyles.aiHintHead}><IconSparkle size={11} stroke="var(--amber)" />Sindri suggests</div>
            <div>You've placed 12 pixels — 6 short of the closed-shape goal. The opening on the bottom-right corner of the cap leaves a 3px gap; close it with the pencil to satisfy the validator.</div>
            <div style={tutStyles.aiHintRow}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-4)' }}>qwen3:14b · 1.2s</span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 11, color: 'var(--amber)', cursor: 'pointer' }}>Show me how →</span>
            </div>
          </div>
        )}
      </div>
      <div style={tutStyles.laneFooter}>
        <span style={tutStyles.laneBtn('exit')} onClick={onExit}>Exit</span>
        <span style={tutStyles.laneBtn('exit')} onClick={onShowHint}>Hint</span>
        <span style={tutStyles.laneBtnAi} onClick={onAskAI} title="Ask Sindri for a contextual hint">
          <IconSparkle size={10} stroke="var(--amber)" />Sindri
        </span>
        <span style={tutStyles.laneBtn('primary')} onClick={onNext}>{stepIdx >= lesson.steps - 1 ? 'Finish' : 'Next →'}</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// TutorialSpotlight
// ---------------------------------------------------------------------------

export function TutorialSpotlight({ targetRect, callout }: TutorialSpotlightProps) {
  if (!targetRect) return null;

  const pad = 6;
  const r = { x: targetRect.x - pad, y: targetRect.y - pad, w: targetRect.w + pad * 2, h: targetRect.h + pad * 2 };

  const baseStyle: React.CSSProperties = targetRect.scope === 'viewport'
    ? { position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 50 }
    : tutStyles.spotRoot;

  const calloutLeft = targetRect.calloutSide === 'left' ? r.x - 260 : r.x + r.w + 16;
  const tailLeft: number | 'auto' = targetRect.calloutSide === 'left' ? 'auto' : -5;
  const tailRight: number | 'auto' = targetRect.calloutSide === 'left' ? -5 : 'auto';
  const tailRot = targetRect.calloutSide === 'left' ? 'rotate(-135deg)' : 'rotate(45deg)';

  return (
    <div style={baseStyle}>
      <div style={{ ...tutStyles.spotDim, left: 0, right: 0, top: 0, height: r.y }} />
      <div style={{ ...tutStyles.spotDim, left: 0, top: r.y, width: r.x, height: r.h }} />
      <div style={{ ...tutStyles.spotDim, left: r.x + r.w, top: r.y, right: 0, height: r.h }} />
      <div style={{ ...tutStyles.spotDim, left: 0, right: 0, top: r.y + r.h, bottom: 0 }} />
      <div style={{ ...tutStyles.spotHole, left: r.x, top: r.y, width: r.w, height: r.h }} />
      {callout && (
        <div style={{ ...tutStyles.callout, left: calloutLeft, top: r.y, width: 240 }}>
          <div style={tutStyles.calloutKicker}>step {callout.stepIdx + 1}</div>
          <div>{callout.text}</div>
          <span style={{ ...tutStyles.calloutTail, left: tailLeft, right: tailRight, top: 14, transform: tailRot }} />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// TutorialBuilderRibbon
// ---------------------------------------------------------------------------

export function TutorialBuilderRibbon({ onExit, onPreview }: TutorialBuilderRibbonProps) {
  return (
    <div style={tutStyles.ribbon}>
      <span>builder mode · authoring lesson</span>
      <span style={tutStyles.ribbonBtn} onClick={onPreview}>play test</span>
      <span style={tutStyles.ribbonBtn} onClick={onExit}>exit builder</span>
    </div>
  );
}
