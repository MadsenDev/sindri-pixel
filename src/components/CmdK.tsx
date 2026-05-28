import React from 'react';
import { IconSparkle, IconPlus, IconDownload, IconOnion, IconGrid } from './Icons';

const cmdkStyles: {
  scrim: React.CSSProperties;
  dialog: React.CSSProperties;
  inputRow: React.CSSProperties;
  input: React.CSSProperties;
  kbd: React.CSSProperties;
  kbdKey: React.CSSProperties;
  section: React.CSSProperties;
  sectionLabel: React.CSSProperties;
  row: (active: boolean) => React.CSSProperties;
  rowLabel: React.CSSProperties;
  rowMeta: React.CSSProperties;
  footer: React.CSSProperties;
} = {
  scrim: {
    position: 'fixed', inset: 0, background: 'rgba(13,17,23,0.6)',
    backdropFilter: 'blur(2px)', zIndex: 100,
    display: 'flex', justifyContent: 'center', alignItems: 'flex-start',
    paddingTop: 110,
  },
  dialog: {
    width: 'min(620px, 92vw)',
    background: 'var(--paper-2)', border: '1px solid var(--amber)',
    color: 'var(--ink)', fontFamily: 'var(--font-sans)',
    boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
  },
  inputRow: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '14px 18px', borderBottom: '1px solid var(--rule-2)',
  },
  input: {
    flex: 1, background: 'transparent', border: 'none', outline: 'none',
    color: 'var(--ink)', fontFamily: 'var(--font-display)', fontSize: 16,
  },
  kbd: { fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--ink-4)', display: 'flex', gap: 3 },
  kbdKey: { padding: '0 4px', border: '1px solid var(--rule-2)', background: 'var(--paper)' },
  section: { padding: '8px 0' },
  sectionLabel: {
    padding: '8px 18px 6px',
    color: 'var(--ink-4)', fontSize: 10.5,
    textTransform: 'uppercase', letterSpacing: '0.14em',
    fontFamily: 'var(--font-display)',
  },
  row: (active: boolean): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '8px 18px', cursor: 'pointer',
    background: active ? 'var(--paper-3)' : 'transparent',
    fontSize: 13, color: active ? 'var(--ink)' : 'var(--ink-2)',
    whiteSpace: 'nowrap', overflow: 'hidden',
  }),
  rowLabel: { flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  rowMeta: { fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--ink-4)', flex: 'none', marginLeft: 'auto' },
  footer: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '8px 18px', borderTop: '1px solid var(--rule-2)',
    fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--ink-4)',
    letterSpacing: '0.06em',
  },
};

type IconComponent = React.FC<{ size?: number; stroke?: string }>;

interface AiSuggestion {
  label: string;
  meta: string;
  ai: true;
}

interface CmdSuggestion {
  label: string;
  meta: string;
  icon: IconComponent;
  ai: false;
}

type SuggestionRow = AiSuggestion | CmdSuggestion;

const SUGGESTIONS_AI: Omit<AiSuggestion, 'ai'>[] = [
  { label: 'Generate 4 walk-cycle frames', meta: 'compose · 4 frames' },
  { label: 'Propose a death animation',    meta: 'compose · 3 frames' },
  { label: 'Outline sprite with 1px border', meta: 'refine · 1 frame' },
  { label: 'Snap palette to NES (54)',     meta: 'refine · palette' },
  { label: 'Mirror frame horizontally',    meta: 'transform' },
];

const SUGGESTIONS_CMD: Omit<CmdSuggestion, 'ai'>[] = [
  { label: 'New sprite',         meta: '⌘N',   icon: IconPlus },
  { label: 'Export as PNG',      meta: '⌘E',   icon: IconDownload },
  { label: 'Export as GIF',      meta: '⇧⌘E', icon: IconDownload },
  { label: 'Toggle onion skin',  meta: '⇧O',   icon: IconOnion },
  { label: 'Toggle grid',        meta: '⇧G',   icon: IconGrid },
];

export interface CmdKProps {
  onClose: () => void;
  onCompose: (prompt: string) => void;
}

export function CmdK({ onClose, onCompose }: CmdKProps) {
  const [query, setQuery] = React.useState('');
  const [hover, setHover] = React.useState(0);

  const allRows: SuggestionRow[] = [
    ...SUGGESTIONS_AI.map((s): AiSuggestion => ({ ...s, ai: true })),
    ...SUGGESTIONS_CMD.map((s): CmdSuggestion => ({ ...s, ai: false })),
  ];
  const filtered = query
    ? allRows.filter((r) => r.label.toLowerCase().includes(query.toLowerCase()))
    : allRows;

  const handleKey: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'Enter') {
      const pick = filtered[hover] || filtered[0];
      if (query && (!pick || pick.ai)) {
        onCompose(query);
      } else if (pick?.ai) {
        onCompose(pick.label);
      } else {
        onClose();
      }
    }
    if (e.key === 'ArrowDown') { e.preventDefault(); setHover((h) => Math.min(filtered.length - 1, h + 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setHover((h) => Math.max(0, h - 1)); }
  };

  React.useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const aiRows = filtered.filter((r): r is AiSuggestion => r.ai);
  const cmdRows = filtered.filter((r): r is CmdSuggestion => !r.ai);

  return (
    <div style={cmdkStyles.scrim} onClick={onClose}>
      <div style={cmdkStyles.dialog} onClick={(e) => e.stopPropagation()}>
        <div style={cmdkStyles.inputRow}>
          <IconSparkle size={14} stroke="var(--amber)"/>
          <input
            autoFocus
            placeholder="Ask Sindri to draw, animate, or refine…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKey}
            style={cmdkStyles.input}
          />
          <span style={cmdkStyles.kbd}>
            <span style={cmdkStyles.kbdKey}>esc</span>
          </span>
        </div>

        {query && (
          <div style={cmdkStyles.section}>
            <div style={cmdkStyles.sectionLabel}>compose</div>
            <div style={cmdkStyles.row(true)} onClick={() => onCompose(query)}>
              <IconSparkle size={13} stroke="var(--amber)"/>
              <span style={{ color: 'var(--amber)' }}>Ask Sindri to: </span>
              <span style={{ color: 'var(--ink)' }}>{query}</span>
              <span style={cmdkStyles.rowMeta}>⏎ compose</span>
            </div>
          </div>
        )}

        {aiRows.length > 0 && (
          <div style={cmdkStyles.section}>
            <div style={cmdkStyles.sectionLabel}>ai suggestions</div>
            {aiRows.map((s, i) => (
              <div key={i} style={cmdkStyles.row(false)} onClick={() => onCompose(s.label)}>
                <IconSparkle size={12} stroke="var(--amber)"/>
                <span style={cmdkStyles.rowLabel}>{s.label}</span>
                <span style={cmdkStyles.rowMeta}>{s.meta}</span>
              </div>
            ))}
          </div>
        )}

        {cmdRows.length > 0 && (
          <div style={cmdkStyles.section}>
            <div style={cmdkStyles.sectionLabel}>commands</div>
            {cmdRows.map((s, i) => {
              const Ico = s.icon;
              return (
                <div key={i} style={cmdkStyles.row(false)} onClick={onClose}>
                  <Ico size={12} stroke="var(--ink-3)"/>
                  <span style={cmdkStyles.rowLabel}>{s.label}</span>
                  <span style={cmdkStyles.rowMeta}>{s.meta}</span>
                </div>
              );
            })}
          </div>
        )}

        <div style={cmdkStyles.footer}>
          <span>qwen3:14b · ollama · localhost:11434 · ready</span>
          <span><span style={cmdkStyles.kbdKey}>⏎</span> to compose</span>
        </div>
      </div>
    </div>
  );
}
