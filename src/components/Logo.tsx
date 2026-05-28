import React from 'react';

interface ForgeMarkPixelProps {
  size?: number;
}

export const ForgeMarkPixel: React.FC<ForgeMarkPixelProps> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={{ display: 'block' }}>
    {/* outer hex */}
    <polygon
      points="16,3 27.26,9.5 27.26,22.5 16,29 4.74,22.5 4.74,9.5"
      stroke="var(--ink)"
      strokeWidth="1.6"
      fill="none"
    />
    {/* inner hex */}
    <polygon
      points="16,9 22.06,12.5 22.06,19.5 16,23 9.94,19.5 9.94,12.5"
      stroke="var(--ink)"
      strokeWidth="1.2"
      fill="none"
    />
    {/* pixel cluster — 2×2 grid, top-left amber, others dim outline */}
    <rect x="13" y="13" width="3" height="3" fill="var(--amber)" />
    <rect x="16.1" y="13" width="3" height="3" fill="none" stroke="var(--ink-3)" strokeWidth="0.6" />
    <rect x="13" y="16.1" width="3" height="3" fill="none" stroke="var(--ink-3)" strokeWidth="0.6" />
    <rect x="16.1" y="16.1" width="3" height="3" fill="none" stroke="var(--ink-3)" strokeWidth="0.6" />
  </svg>
);

interface WordmarkProps {
  size?: number;
}

export const Wordmark: React.FC<WordmarkProps> = ({ size = 18 }) => (
  <span
    style={{
      fontFamily: 'Pixelify Sans, monospace',
      fontWeight: 700,
      fontSize: size,
      letterSpacing: '0.14em',
      color: 'var(--ink)',
      lineHeight: 1,
      display: 'inline-flex',
      alignItems: 'center',
      textTransform: 'uppercase',
    } as React.CSSProperties}
  >
    <span>S</span>
    <span style={{ color: 'var(--amber)' }}>I</span>
    <span>NDRI</span>
  </span>
);

interface SubMarkProps {
  size?: number;
}

export const SubMark: React.FC<SubMarkProps> = ({ size = 9.5 }) => (
  <span
    style={{
      fontFamily: 'JetBrains Mono, monospace',
      fontWeight: 500,
      fontSize: size,
      letterSpacing: '0.22em',
      color: 'var(--ink-3)',
      lineHeight: 1,
      textTransform: 'uppercase',
    } as React.CSSProperties}
  >
    PIXEL
  </span>
);

interface LogoLockupProps {
  size?: number;
}

export const LogoLockup: React.FC<LogoLockupProps> = ({ size = 18 }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
    <ForgeMarkPixel size={size + 12} />
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'flex-start' }}>
      <Wordmark size={size} />
      <SubMark size={size * 0.55} />
    </div>
  </div>
);
