import type { ConnectionType } from '../types';

const TYPE_STYLES: Record<ConnectionType, { color: string; dash?: string }> = {
  relative: { color: '#E74C3C' },
  'student-teacher': { color: '#3498DB', dash: '6 3' },
};

interface ConnectionLineProps {
  x1: number; y1: number; x2: number; y2: number;
  type: ConnectionType;
  highlighted: boolean;
  dimmed: boolean;
}

export function ConnectionLine({ x1, y1, x2, y2, type, highlighted, dimmed }: ConnectionLineProps) {
  const style = TYPE_STYLES[type];
  const midX = (x1 + x2) / 2;
  const d = `M ${x1} ${y1} Q ${midX} ${y1} ${midX} ${(y1 + y2) / 2} Q ${midX} ${y2} ${x2} ${y2}`;
  return (
    <path d={d} fill="none" stroke={style.color}
      strokeWidth={highlighted ? 2.5 : 1.5}
      strokeDasharray={style.dash}
      opacity={dimmed ? 0.15 : highlighted ? 1 : 0.5} />
  );
}
