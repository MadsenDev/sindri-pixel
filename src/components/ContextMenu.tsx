import { useRef, useLayoutEffect, useState, useEffect } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────

export type ContextItem =
  | { type: 'action'; id: string; label: string; shortcut?: string; disabled?: boolean; danger?: boolean }
  | { type: 'separator' };

export interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextItem[];
  onAction: (id: string) => void;
  onClose: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

const MENU_W = 218;

export function ContextMenu({ x, y, items, onAction, onClose }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos]         = useState({ x, y });
  const [visible, setVisible] = useState(false);
  const [hoverId, setHoverId] = useState<string | null>(null);

  // Measure after first paint and clamp to viewport
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const h = el.offsetHeight;
    const adjX = x + MENU_W > window.innerWidth  - 6 ? x - MENU_W : x;
    const adjY = y + h       > window.innerHeight - 6 ? y - h      : y;
    setPos({ x: Math.max(6, adjX), y: Math.max(6, adjY) });
    setVisible(true);
  }, [x, y]);

  // Close on Escape
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  return (
    <>
      {/* Full-screen scrim catches outside clicks */}
      <div
        style={{ position: 'fixed', inset: 0, zIndex: 499 }}
        onMouseDown={onClose}
        onContextMenu={e => { e.preventDefault(); onClose(); }}
      />

      <div
        ref={ref}
        style={{
          position: 'fixed',
          left: pos.x,
          top: pos.y,
          width: MENU_W,
          zIndex: 500,
          background: 'var(--paper-2)',
          border: '1px solid var(--rule-2)',
          boxShadow: '0 10px 28px rgba(0,0,0,0.55), 0 2px 8px rgba(0,0,0,0.3)',
          padding: '4px 0',
          visibility: visible ? 'visible' : 'hidden',
          fontFamily: 'var(--font-sans)',
        }}
        onContextMenu={e => e.preventDefault()}
      >
        {items.map((item, i) => {
          if (item.type === 'separator') {
            return (
              <div
                key={i}
                style={{ height: 1, background: 'var(--rule)', margin: '3px 0' }}
              />
            );
          }

          const hovered = hoverId === item.id && !item.disabled;
          return (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '5px 14px 5px 14px',
                cursor: item.disabled ? 'default' : 'pointer',
                background: hovered ? 'var(--paper-3)' : 'transparent',
                color: item.disabled
                  ? 'var(--ink-4)'
                  : item.danger
                    ? '#e05c5c'
                    : hovered ? 'var(--ink)' : 'var(--ink-2)',
                fontSize: 12.5,
                userSelect: 'none',
                gap: 12,
              }}
              onMouseEnter={() => setHoverId(item.id)}
              onMouseLeave={() => setHoverId(null)}
              onMouseDown={e => {
                e.stopPropagation();
                if (!item.disabled) { onAction(item.id); onClose(); }
              }}
            >
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.shortcut && (
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  color: 'var(--ink-4)',
                  letterSpacing: '0.04em',
                  flex: 'none',
                }}>
                  {item.shortcut}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
