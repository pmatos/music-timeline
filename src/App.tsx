import { useState, useCallback } from 'react';
import { useInstrumentData } from './hooks/useInstrumentData';
import { Header } from './components/Header';
import { TimelineView } from './components/TimelineView';
import { Legend } from './components/Legend';
import { PersonPanel } from './components/PersonPanel';
import { Tooltip } from './components/Tooltip';
import type { Person } from './types';

const INSTRUMENTS = ['piano', 'violin'];

function App() {
  const [instrument, setInstrument] = useState('piano');
  const { data, loading, error } = useInstrumentData(instrument);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [hoveredPerson, setHoveredPerson] = useState<Person | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const handlePersonClick = useCallback((person: Person) => {
    setSelectedPerson((prev) => (prev?.id === person.id ? null : person));
  }, []);

  const handlePersonMouseEnter = useCallback((person: Person) => {
    setHoveredPerson(person);
  }, []);

  const handlePersonMouseLeave = useCallback(() => {
    setHoveredPerson(null);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setTooltipPos({ x: e.clientX, y: e.clientY });
  }, []);

  if (loading) return <div className="loading">Loading...</div>;
  if (error || !data) return <div className="error">Failed to load data: {error}</div>;

  return (
    <div className="app" onMouseMove={handleMouseMove}>
      <Header instrument={data.instrument} instruments={INSTRUMENTS} onInstrumentChange={setInstrument} />
      <TimelineView data={data} selectedPersonId={selectedPerson?.id ?? null}
        hoveredPersonId={hoveredPerson?.id ?? null}
        onPersonClick={handlePersonClick} onPersonMouseEnter={handlePersonMouseEnter}
        onPersonMouseLeave={handlePersonMouseLeave} />
      <Legend />
      <footer className="footer">
        <span>To suggest edits or propose fixes, visit{' '}
          <a href="https://github.com/pmatos/music-timeline/issues" target="_blank" rel="noopener noreferrer">
            github.com/pmatos/music-timeline/issues
          </a>
        </span>
        <span className="footer__separator">|</span>
        <span>&copy; 2026 Linki Tools</span>
      </footer>
      <Tooltip person={hoveredPerson} x={tooltipPos.x} y={tooltipPos.y} />
      <PersonPanel person={selectedPerson} onClose={() => setSelectedPerson(null)} />
    </div>
  );
}

export default App;
