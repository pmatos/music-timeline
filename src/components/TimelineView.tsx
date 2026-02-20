import { useRef, useEffect } from 'react';
import type { InstrumentData, Person } from '../types';
import { useTimelineScale } from '../hooks/useTimelineScale';
import { TimelineSVG } from './TimelineSVG';

interface TimelineViewProps {
  data: InstrumentData;
  selectedPersonId: string | null;
  hoveredPersonId: string | null;
  onPersonClick: (person: Person) => void;
  onPersonMouseEnter: (person: Person) => void;
  onPersonMouseLeave: () => void;
}

export function TimelineView({
  data, selectedPersonId, hoveredPersonId,
  onPersonClick, onPersonMouseEnter, onPersonMouseLeave,
}: TimelineViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const startYear = Math.min(...data.eras.map((e) => e.startYear), ...data.people.map((p) => p.born));
  const endYear = Math.max(...data.eras.map((e) => e.endYear), new Date().getFullYear());
  const containerWidth = 1200;

  const { yearToPixel, totalWidth, setZoom } = useTimelineScale({ startYear, endYear, containerWidth });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setZoom((z: number) => Math.max(0.5, Math.min(10, z * delta)));
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [setZoom]);

  return (
    <div className="timeline-view" ref={containerRef}>
      <TimelineSVG data={data} yearToPixel={yearToPixel} totalWidth={totalWidth}
        selectedPersonId={selectedPersonId} hoveredPersonId={hoveredPersonId}
        onPersonClick={onPersonClick} onPersonMouseEnter={onPersonMouseEnter}
        onPersonMouseLeave={onPersonMouseLeave} />
    </div>
  );
}
