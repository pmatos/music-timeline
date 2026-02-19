import type { Person } from '../types';

interface TooltipProps {
  person: Person | null;
  x: number;
  y: number;
}

export function Tooltip({ person, x, y }: TooltipProps) {
  if (!person) return null;
  const bornLabel = person.bornEstimated ? `${person.born} (est.)` : `${person.born}`;
  const years = `${bornLabel}\u2013${person.died ?? 'present'}`;
  return (
    <div className="tooltip" style={{ position: 'fixed', left: x + 12, top: y - 10, pointerEvents: 'none' }}>
      <strong>{person.name}</strong>
      <div>{years}</div>
    </div>
  );
}
