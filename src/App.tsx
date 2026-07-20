import { useState, useCallback } from 'react';
import { useInstrumentData } from './hooks/useInstrumentData';
import { Header } from './components/Header';
import { TimelineView } from './components/TimelineView';
import { Legend } from './components/Legend';
import { PersonPanel } from './components/PersonPanel';
import { Tooltip } from './components/Tooltip';
import type { Person } from './types';

const INSTRUMENTS = ['piano', 'violin', 'trombone'];

function App() {
  const [instrument, setInstrument] = useState('piano');
  const { data, loading, error, reload } = useInstrumentData(instrument);
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

  const handlePersonFocus = useCallback((person: Person, rect: DOMRect) => {
    setHoveredPerson(person);
    setTooltipPos({ x: rect.left, y: rect.bottom });
  }, []);

  const handlePersonBlur = useCallback(() => {
    setHoveredPerson(null);
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      // Only track the cursor while a bar is hovered — the tooltip is the only
      // consumer, so this avoids re-rendering the tree on every idle mouse move.
      if (hoveredPerson) setTooltipPos({ x: e.clientX, y: e.clientY });
    },
    [hoveredPerson],
  );

  const handleClose = useCallback(() => {
    setSelectedPerson((prev) => {
      if (prev) {
        const id = prev.id;
        // Return focus to the bar that opened the panel (keyboard users).
        requestAnimationFrame(() => {
          document
            .querySelector<SVGGElement>(`[data-person-id="${id}"]`)
            ?.focus();
        });
      }
      return null;
    });
  }, []);

  if (loading)
    return (
      <div className="loading" role="status">
        Loading timeline…
      </div>
    );

  if (error || !data)
    return (
      <div className="error" role="alert">
        <p>We couldn’t load the timeline{error ? `: ${error}` : ''}.</p>
        <button className="error__retry" onClick={reload}>
          Try again
        </button>
      </div>
    );

  return (
    <div className="app" onMouseMove={handleMouseMove}>
      <Header
        instrument={data.instrument}
        instruments={INSTRUMENTS}
        onInstrumentChange={setInstrument}
      />
      <a className="skip-link" href="#timeline-legend">
        Skip timeline
      </a>
      <main className="app__main">
        <TimelineView
          data={data}
          selectedPersonId={selectedPerson?.id ?? null}
          hoveredPersonId={hoveredPerson?.id ?? null}
          onPersonClick={handlePersonClick}
          onPersonMouseEnter={handlePersonMouseEnter}
          onPersonMouseLeave={handlePersonMouseLeave}
          onPersonFocus={handlePersonFocus}
          onPersonBlur={handlePersonBlur}
        />
        <div id="timeline-legend" tabIndex={-1} aria-label="Timeline legend">
          <Legend />
        </div>
      </main>
      <footer className="footer">
        <span>&copy; 2026 Linki Tools</span>
      </footer>
      <Tooltip person={hoveredPerson} x={tooltipPos.x} y={tooltipPos.y} />
      <PersonPanel
        person={selectedPerson}
        connections={data.connections}
        people={data.people}
        onPersonClick={handlePersonClick}
        onClose={handleClose}
      />
    </div>
  );
}

export default App;
