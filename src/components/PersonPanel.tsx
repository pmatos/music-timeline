import { useEffect, useMemo } from 'react';
import type { Person, Connection } from '../types';

interface PersonPanelProps {
  person: Person | null;
  connections: Connection[];
  people: Person[];
  onPersonClick: (person: Person) => void;
  onClose: () => void;
}

interface ConnectionGroupProps {
  label: string;
  people: Person[];
  onPersonClick: (person: Person) => void;
}

function ConnectionGroup({ label, people, onPersonClick }: ConnectionGroupProps) {
  return (
    <div>
      <div className="person-panel__conn-label">{label}</div>
      <ul className="person-panel__conn-list">
        {people.map((p) => (
          <li key={p.id}>
            <button className="person-panel__conn-link" onClick={() => onPersonClick(p)}>
              {p.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PersonPanel({ person, connections, people, onPersonClick, onClose }: PersonPanelProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const groups = useMemo(() => {
    if (!person) return [];
    const personMap = new Map(people.map((p) => [p.id, p]));
    const result: { label: string; people: Person[] }[] = [];

    const taught: Person[] = [];
    const studentOf: Person[] = [];
    const influenced: Person[] = [];
    const influencedBy: Person[] = [];
    const relatedTo: Person[] = [];

    for (const c of connections) {
      const isFrom = c.from === person.id;
      const isTo = c.to === person.id;
      if (!isFrom && !isTo) continue;

      const otherId = isFrom ? c.to : c.from;
      const other = personMap.get(otherId);
      if (!other) continue;

      if (c.type === 'student-teacher') {
        if (c.label === 'teacher/student') {
          if (isFrom) taught.push(other);
          else studentOf.push(other);
        } else {
          // influence / predecessor
          if (isFrom) influenced.push(other);
          else influencedBy.push(other);
        }
      } else if (c.type === 'relative') {
        relatedTo.push(other);
      }
    }

    if (taught.length) result.push({ label: 'Taught', people: taught });
    if (studentOf.length) result.push({ label: 'Student of', people: studentOf });
    if (influenced.length) result.push({ label: 'Influenced', people: influenced });
    if (influencedBy.length) result.push({ label: 'Influenced by', people: influencedBy });
    if (relatedTo.length) result.push({ label: 'Related to', people: relatedTo });

    return result;
  }, [person, connections, people]);

  if (!person) return null;
  const bornLabel = person.bornEstimated ? `${person.born} (est.)` : `${person.born}`;
  const years = `${bornLabel}\u2013${person.died ?? 'present'}`;

  return (
    <div className="person-panel">
      <button className="person-panel__close" onClick={onClose} aria-label="Close">&times;</button>
      {person.photoUrl && (
        <img className="person-panel__photo" src={`${import.meta.env.BASE_URL}${person.photoUrl.replace(/^\//, '')}`} alt={person.name} />
      )}
      <h2>{person.name}</h2>
      <div className="person-panel__years">{years}</div>
      <span className="person-panel__role">{person.role}</span>
      <p className="person-panel__bio">{person.bio}</p>
      <div className="person-panel__links">
        {person.wikiUrl && (
          <a href={person.wikiUrl} target="_blank" rel="noopener noreferrer">Wikipedia</a>
        )}
        {person.websiteUrl && (
          <a href={person.websiteUrl} target="_blank" rel="noopener noreferrer">Website</a>
        )}
      </div>
      {groups.length > 0 && (
        <div className="person-panel__connections">
          {groups.map((g) => (
            <ConnectionGroup key={g.label} label={g.label} people={g.people} onPersonClick={onPersonClick} />
          ))}
        </div>
      )}
    </div>
  );
}
