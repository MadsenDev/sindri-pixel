import React, { useState, useEffect } from 'react';

interface PixelSliderProps {
  min?: number;
  max?: number;
  step?: number;
  value: number;
  onChange: (v: number) => void;
  snap?: number;
}

const rowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'stretch',
  gap: 1,
  height: 16,
  padding: 0,
  userSelect: 'none',
};

const cellStyle = (filled: boolean, hovered: boolean): React.CSSProperties => ({
  flex: 1,
  background: filled ? 'var(--ink)' : hovered ? 'var(--paper-3)' : 'var(--paper-2)',
  cursor: 'pointer',
  minWidth: 4,
  transition: 'background 50ms linear',
});

const cellLastStyle = (filled: boolean, hovered: boolean): React.CSSProperties => ({
  flex: 1,
  background: filled ? 'var(--ink)' : hovered ? 'var(--paper-3)' : 'var(--paper-2)',
  cursor: 'pointer',
  minWidth: 4,
  boxShadow: 'inset 0 -1px 0 var(--ink)',
  transition: 'background 50ms linear',
});

export const PixelSlider: React.FC<PixelSliderProps> = ({
  min = 0,
  max = 100,
  step = 1,
  value,
  onChange,
  snap,
}) => {
  const cellCount = snap ?? (max - min + 1 > 24 ? 20 : (max - min) / step + 1);
  const stepSize = (max - min) / (cellCount - 1);
  const currentCell = Math.round((value - min) / stepSize);
  const [hover, setHover] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);

  const cellToValue = (cellIdx: number): number => {
    const v = min + cellIdx * stepSize;
    return Math.round(v / step) * step;
  };

  const handleDown = (idx: number) => {
    setDragging(true);
    onChange(cellToValue(idx));
  };

  const handleEnter = (idx: number) => {
    setHover(idx);
    if (dragging) onChange(cellToValue(idx));
  };

  useEffect(() => {
    const up = () => setDragging(false);
    window.addEventListener('mouseup', up);
    return () => window.removeEventListener('mouseup', up);
  }, []);

  return (
    <div style={rowStyle} onMouseLeave={() => setHover(null)}>
      {Array.from({ length: cellCount }, (_, i) => {
        const filled = i <= currentCell;
        const isLast = i === currentCell;
        const styleFn = isLast ? cellLastStyle : cellStyle;
        return (
          <div
            key={i}
            style={styleFn(filled, hover === i)}
            onMouseDown={() => handleDown(i)}
            onMouseEnter={() => handleEnter(i)}
          />
        );
      })}
    </div>
  );
};
