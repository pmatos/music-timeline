import { memo } from 'react';
import type { ConnectionType } from '../types';
import { CONNECTION_STYLES } from '../theme';

interface ConnectionLineProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  type: ConnectionType;
  highlighted: boolean;
  dimmed: boolean;
}

export const ConnectionLine = memo(function ConnectionLine({
  x1,
  y1,
  x2,
  y2,
  type,
  highlighted,
  dimmed,
}: ConnectionLineProps) {
  const style = CONNECTION_STYLES[type];
  const midX = (x1 + x2) / 2;
  const d = `M ${x1} ${y1} Q ${midX} ${y1} ${midX} ${(y1 + y2) / 2} Q ${midX} ${y2} ${x2} ${y2}`;
  return (
    <path
      d={d}
      fill="none"
      stroke={style.color}
      strokeWidth={highlighted ? 2.5 : 1.5}
      strokeDasharray={style.dash}
      opacity={dimmed ? 0.15 : highlighted ? 1 : 0.5}
    />
  );
});
