import type { Person, Role } from '../types';

const ROLE_COLORS: Record<Role, string> = {
  composer: '#4A90D9',
  player: '#E67E22',
  both: '#8E44AD',
};

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
}

export function PersonBar({
  person, x, width, y, height, highlighted, dimmed,
  onClick, onMouseEnter, onMouseLeave,
}: PersonBarProps) {
  const color = ROLE_COLORS[person.role];
  const opacity = dimmed ? 0.3 : 1;
  const strokeWidth = highlighted ? 2 : 0;

  return (
    <g className="person-bar" style={{ cursor: 'pointer', opacity }}
      onClick={() => onClick(person)}
      onMouseEnter={() => onMouseEnter(person)}
      onMouseLeave={onMouseLeave}>
      <rect x={x} y={y} width={width} height={height} rx={4}
        fill={color} stroke={highlighted ? '#333' : 'none'} strokeWidth={strokeWidth} />
      <text x={x + 6} y={y + height / 2 + 4} fontSize={11} fill="#fff" fontWeight={500}>
        {person.name}
      </text>
    </g>
  );
}
