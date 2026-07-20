import type { Role, ConnectionType } from '../types';
import {
  ROLE_COLORS,
  ROLE_LABELS,
  ROLE_GLYPHS,
  CONNECTION_STYLES,
  CONNECTION_LABELS,
} from '../theme';

const ROLES: Role[] = ['composer', 'player', 'both'];
const CONNECTIONS: ConnectionType[] = ['relative', 'student-teacher'];

export function Legend() {
  return (
    <div className="legend">
      <div className="legend-section">
        {CONNECTIONS.map((type) => (
          <span key={type} className="legend-item">
            <svg
              className="legend-line"
              width={24}
              height={4}
              aria-hidden="true"
            >
              <line
                x1={0}
                y1={2}
                x2={24}
                y2={2}
                stroke={CONNECTION_STYLES[type].color}
                strokeWidth={2}
                strokeDasharray={CONNECTION_STYLES[type].dash}
              />
            </svg>
            {CONNECTION_LABELS[type]}
          </span>
        ))}
      </div>
      <div className="legend-section">
        {ROLES.map((role) => (
          <span key={role} className="legend-item">
            <span
              className="legend-swatch"
              style={{ backgroundColor: ROLE_COLORS[role] }}
              aria-hidden="true"
            >
              {ROLE_GLYPHS[role]}
            </span>
            {ROLE_LABELS[role]}
          </span>
        ))}
      </div>
    </div>
  );
}
