import React from 'react';
import { LogoLockup } from './Logo';
import { IconChevron, IconSparkle, IconPlay, IconPause, IconStop } from './Icons';
import type { AIStatus } from '../types';

const tbStyles = {
  bar: {
    display: 'grid',
    gridTemplateColumns: '320px 1fr auto',
    borderBottom: '1px solid var(--rule-2)',
    background: 'var(--paper)',
    alignItems: 'stretch',
    height: 56,
    flex: 'none',
    WebkitAppRegion: 'drag',
    userSelect: 'none',
  } as React.CSSProperties,
  left: { display: 'flex', alignItems: 'center', padding: '0 18px', gap: 14, minWidth: 0 } as React.CSSProperties,
  center: { display: 'flex', alignItems: 'center', padding: '0 16px', gap: 12 } as React.CSSProperties,
  right: { display: 'flex', alignItems: 'stretch', justifyContent: 'flex-end' } as React.CSSProperties,
  rightInner: { display: 'flex', alignItems: 'center', padding: '0 16px 0 18px', gap: 12, WebkitAppRegion: 'no-drag' } as React.CSSProperties,
  rule: { width: 1, height: 22, background: 'var(--rule-2)', flex: 'none' } as React.CSSProperties,
  breadcrumb: {
    fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--ink-3)',
    display: 'flex', alignItems: 'baseline', gap: 6, whiteSpace: 'nowrap', minWidth: 0,
  } as React.CSSProperties,
  bcCurrent: { color: 'var(--ink)' } as React.CSSProperties,
  dirty: { color: 'var(--amber)', marginRight: 2 } as React.CSSProperties,
  cmdk: {
    display: 'flex', alignItems: 'center', gap: 10, height: 30, padding: '0 12px',
    background: 'var(--paper-2)', border: '1px solid var(--rule)',
    color: 'var(--ink-3)', fontSize: 13, fontFamily: 'var(--font-display)',
    width: '100%', maxWidth: 460, cursor: 'text',
    flex: 1, minWidth: 0,
    WebkitAppRegion: 'no-drag',
  } as React.CSSProperties,
  cmdkLeft: { display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } as React.CSSProperties,
  keys: { fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-4)', display: 'flex', gap: 3, flex: 'none' } as React.CSSProperties,
  kbd: { padding: '0 4px', border: '1px solid var(--rule-2)', background: 'var(--paper)' } as React.CSSProperties,
  run: { display: 'flex', alignItems: 'center', gap: 4, flex: 'none', WebkitAppRegion: 'no-drag' } as React.CSSProperties,
  runBtn: (variant?: string, active?: boolean): React.CSSProperties => ({
    width: 30, height: 26,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer',
    background: variant === 'primary' ? 'var(--ink)' : active ? 'var(--paper-3)' : 'transparent',
    color: variant === 'primary' ? 'var(--paper)' : 'var(--ink-2)',
    border: variant === 'primary' ? '1px solid var(--ink)' : '1px solid var(--rule-2)',
  }),
  frameRead: {
    fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)',
    padding: '0 8px', flex: 'none',
  } as React.CSSProperties,
  composeBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 7,
    fontFamily: 'var(--font-display)', fontSize: 15,
    color: 'var(--amber)', cursor: 'pointer',
    padding: '4px 8px',
    flex: 'none',
  } as React.CSSProperties,
  lessonsBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    fontFamily: 'var(--font-display)', fontSize: 13,
    color: 'var(--cyan)', cursor: 'pointer',
    padding: '5px 10px',
    border: '1px solid var(--rule-2)',
    background: 'var(--paper-2)',
    flex: 'none', whiteSpace: 'nowrap',
  } as React.CSSProperties,
  lessonsDot: { width: 6, height: 6, background: 'var(--cyan)', flex: 'none' } as React.CSSProperties,
  logoTrigger: {
    display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
    padding: '4px 6px 4px 0',
    WebkitAppRegion: 'no-drag',
  } as React.CSSProperties,
  logoChevron: { color: 'var(--ink-4)', marginTop: 2, transition: 'color 80ms linear, transform 80ms linear' } as React.CSSProperties,
  composeBadge: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    fontFamily: 'var(--font-mono)', fontSize: 10.5,
    color: 'var(--amber)', padding: '0 6px',
    border: '1px solid var(--amber)',
    height: 18, marginLeft: 6,
    letterSpacing: '0.04em',
  } as React.CSSProperties,
  controls: { display: 'flex', alignItems: 'stretch', borderLeft: '1px solid var(--rule-2)', WebkitAppRegion: 'no-drag' } as React.CSSProperties,
  ctrl: {
    width: 46, height: '100%',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', background: 'transparent', color: 'var(--ink-3)',
    transition: 'background 80ms linear, color 80ms linear',
  } as React.CSSProperties,
  ctrlBorder: { borderLeft: '1px solid var(--rule)' } as React.CSSProperties,
  ctrlHover: {
    minimize: { background: 'var(--paper-3)', color: 'var(--ink)' } as React.CSSProperties,
    maximize: { background: 'var(--paper-3)', color: 'var(--ink)' } as React.CSSProperties,
    close: { background: 'var(--red)', color: 'var(--paper)' } as React.CSSProperties,
  },
};

const GlyphMin = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square">
    <path d="M1 8 H9" />
  </svg>
);

const GlyphMax = ({ maximized }: { maximized: boolean }) =>
  maximized ? (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square">
      <rect x="0.5" y="2.5" width="6" height="6" />
      <path d="M3 2.5 V0.5 H8.5 V6" />
    </svg>
  ) : (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square">
      <rect x="0.5" y="0.5" width="9" height="9" />
    </svg>
  );

const GlyphClose = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square">
    <path d="M1 1 L9 9 M9 1 L1 9" />
  </svg>
);

type WinCtrlKind = 'minimize' | 'maximize' | 'close';

interface WinCtrlProps {
  kind: WinCtrlKind;
  onClick: () => void;
  withBorder?: boolean;
  children: React.ReactNode;
}

function WinCtrl({ kind, onClick, withBorder, children }: WinCtrlProps) {
  const [h, setH] = React.useState(false);
  return (
    <span
      style={{ ...tbStyles.ctrl, ...(withBorder ? tbStyles.ctrlBorder : null), ...(h ? tbStyles.ctrlHover[kind] : null) }}
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      title={kind}
    >
      {children}
    </span>
  );
}

export interface TopbarProps {
  onCmdK: () => void;
  onCompose: () => void;
  aiStatus: AIStatus;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  frameIdx: number;
  frameCount: number;
  projectName: string;
  maximized: boolean;
  onMinimize: () => void;
  onToggleMax: () => void;
  onClose: () => void;
  onOpenLessons: () => void;
  onOpenMenu: (rect: DOMRect) => void;
  menuOpen: boolean;
}

export function Topbar({
  onCmdK, onCompose, aiStatus,
  isPlaying, onPlay, onPause, onStop,
  frameIdx, frameCount, projectName,
  maximized, onMinimize, onToggleMax, onClose,
  onOpenLessons, onOpenMenu, menuOpen,
}: TopbarProps) {
  const pending = aiStatus.kind === 'review';
  const logoRef = React.useRef<HTMLDivElement>(null);
  const handleLogoClick = () => {
    if (logoRef.current && onOpenMenu) onOpenMenu(logoRef.current.getBoundingClientRect());
  };
  return (
    <header style={tbStyles.bar}>
      <div style={tbStyles.left}>
        <div
          ref={logoRef}
          style={tbStyles.logoTrigger}
          onClick={handleLogoClick}
          title="Open menu"
        >
          <LogoLockup size={18} />
          <span style={{ ...tbStyles.logoChevron, transform: menuOpen ? 'rotate(180deg)' : 'rotate(0)', color: menuOpen ? 'var(--ink)' : 'var(--ink-4)' }}>
            <IconChevron size={11} />
          </span>
        </div>
        <span style={tbStyles.rule} />
        <div style={tbStyles.breadcrumb}>
          <span style={tbStyles.dirty}>●</span>
          <span>sprites</span>
          <span style={{ color: 'var(--ink-4)', margin: '0 4px' }}>/</span>
          <span style={tbStyles.bcCurrent}>{projectName}</span>
        </div>
      </div>
      <div style={{ ...tbStyles.center, justifyContent: 'center' }}>
        <div style={tbStyles.cmdk} onClick={onCmdK}>
          <div style={tbStyles.cmdkLeft}>
            <IconSparkle size={13} stroke="var(--amber)" />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>Ask Sindri to draw, animate, or refine…</span>
          </div>
          <span style={tbStyles.keys}>
            <span style={tbStyles.kbd}>⌘</span>
            <span style={tbStyles.kbd}>K</span>
          </span>
        </div>
        <div style={tbStyles.run}>
          {isPlaying ? (
            <span style={tbStyles.runBtn('primary')} onClick={onPause} title="Pause animation">
              <IconPause size={11} stroke="var(--paper)" />
            </span>
          ) : (
            <span style={tbStyles.runBtn('primary')} onClick={onPlay} title="Play animation">
              <IconPlay size={11} stroke="var(--paper)" />
            </span>
          )}
          <span style={tbStyles.runBtn()} onClick={onStop} title="Stop">
            <IconStop size={10} />
          </span>
        </div>
        <span style={tbStyles.frameRead}>
          frame {String(frameIdx + 1).padStart(2, '0')} / {String(frameCount).padStart(2, '0')}
        </span>
      </div>
      <div style={tbStyles.right}>
        <div style={tbStyles.rightInner}>
          <span style={tbStyles.lessonsBtn} onClick={onOpenLessons} title="Open lessons library">
            <span style={tbStyles.lessonsDot} />Lessons
          </span>
          <span style={tbStyles.composeBtn} onClick={onCompose}>
            <IconSparkle size={13} stroke="var(--amber)" /> Compose
            {pending && <span style={tbStyles.composeBadge}>{aiStatus.text}</span>}
          </span>
        </div>
        <div style={tbStyles.controls}>
          <WinCtrl kind="minimize" onClick={onMinimize}><GlyphMin /></WinCtrl>
          <WinCtrl kind="maximize" onClick={onToggleMax} withBorder><GlyphMax maximized={maximized} /></WinCtrl>
          <WinCtrl kind="close" onClick={onClose} withBorder><GlyphClose /></WinCtrl>
        </div>
      </div>
    </header>
  );
}
