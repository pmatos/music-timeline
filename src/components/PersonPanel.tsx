import { useEffect } from 'react';
import type { Person } from '../types';

interface PersonPanelProps {
  person: Person | null;
  onClose: () => void;
}

export function PersonPanel({ person, onClose }: PersonPanelProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  if (!person) return null;
  const years = `${person.born}\u2013${person.died ?? 'present'}`;

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
        <a href={person.wikiUrl} target="_blank" rel="noopener noreferrer">Wikipedia</a>
        {person.websiteUrl && (
          <a href={person.websiteUrl} target="_blank" rel="noopener noreferrer">Website</a>
        )}
      </div>
    </div>
  );
}
