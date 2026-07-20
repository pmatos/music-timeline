import type { Person, Role } from '../types';

const ROLE_LABELS: Record<Role, string> = {
  composer: 'Composer',
  player: 'Player',
  both: 'Composer & player',
};

interface TooltipProps {
  person: Person | null;
  x: number;
  y: number;
}

export function Tooltip({ person, x, y }: TooltipProps) {
  if (!person) return null;
  const bornLabel = person.bornEstimated
    ? `${person.born} (est.)`
    : `${person.born}`;
  const years = `${bornLabel}\u2013${person.died ?? 'present'}`;
  return (
    <div
      className="tooltip"
      aria-hidden="true"
      style={{
        position: 'fixed',
        left: x + 12,
        top: y - 10,
        pointerEvents: 'none',
      }}
    >
      <strong>{person.fullName ?? person.name}</strong>
      <div className="tooltip__years">{years}</div>
      <div className="tooltip__role">{ROLE_LABELS[person.role]}</div>
    </div>
  );
}
