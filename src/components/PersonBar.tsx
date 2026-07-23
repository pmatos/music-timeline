import { memo } from 'react';
import type { Person } from '../types';
import {
  ROLE_COLORS,
  ROLE_ARIA,
  ROLE_GLYPHS,
  BAR_TEXT,
  BAR_HIGHLIGHT_STROKE,
  FOCUS_RING,
} from '../theme';

interface PersonBarProps {
  person: Person;
  x: number;
  width: number;
  y: number;
  height: number;
  highlighted: boolean;
  dimmed: boolean;
  onClick: (person: Person) => void;
  onMouseEnter: (person: Person) => void;
  onMouseLeave: () => void;
  onFocus: (person: Person, rect: DOMRect) => void;
  onBlur: () => void;
}

export const PersonBar = memo(function PersonBar({
  person,
  x,
  width,
  y,
  height,
  highlighted,
  dimmed,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
}: PersonBarProps) {
  const color = ROLE_COLORS[person.role];
  const opacity = dimmed ? 0.3 : 1;
  const strokeWidth = highlighted ? 2 : 0;

  const bornLabel = person.bornEstimated
    ? `${person.born} (estimated)`
    : `${person.born}`;
  const years = `${bornLabel} to ${person.died ?? 'present'}`;
  const ariaLabel = `${person.fullName ?? person.name}, ${ROLE_ARIA[person.role]}, ${years}`;

  const handleKeyDown = (e: React.KeyboardEvent<SVGGElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(person);
    }
  };

  const handleFocus = (e: React.FocusEvent<SVGGElement>) => {
    e.currentTarget.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    onFocus(person, e.currentTarget.getBoundingClientRect());
  };

  return (
    <g
      className="person-bar"
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      data-person-id={person.id}
      style={{ cursor: 'pointer', opacity }}
      onClick={() => onClick(person)}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => onMouseEnter(person)}
      onMouseLeave={onMouseLeave}
      onFocus={handleFocus}
      onBlur={onBlur}
    >
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={4}
        fill={color}
        stroke={highlighted ? BAR_HIGHLIGHT_STROKE : 'none'}
        strokeWidth={strokeWidth}
      />
      <text
        x={x + 6}
        y={y + height / 2 + 4}
        fontSize={11}
        fill={BAR_TEXT}
        fontWeight={500}
      >
        {`${ROLE_GLYPHS[person.role]} ${person.name}`}
      </text>
      <rect
        className="person-bar__focus-ring"
        x={x - 2}
        y={y - 2}
        width={width + 4}
        height={height + 4}
        rx={6}
        fill="none"
        stroke={FOCUS_RING}
        strokeWidth={2}
        pointerEvents="none"
      />
    </g>
  );
});
