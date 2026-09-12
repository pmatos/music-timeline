import { memo, useRef, useEffect, useLayoutEffect, useState } from 'react';
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
  onPersonFocus: (person: Person, rect: DOMRect) => void;
  onPersonBlur: () => void;
}

export const TimelineView = memo(function TimelineView({
  data,
  selectedPersonId,
  hoveredPersonId,
  onPersonClick,
  onPersonMouseEnter,
  onPersonMouseLeave,
  onPersonFocus,
  onPersonBlur,
}: TimelineViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const startYear = Math.min(
    ...data.eras.map((e) => e.startYear),
    ...data.people.map((p) => p.born),
  );
  const endYear = Math.max(
    ...data.eras.map((e) => e.endYear),
    new Date().getFullYear(),
  );
  const [containerWidth, setContainerWidth] = useState(1200);

  const { yearToPixel, totalWidth, setZoom } = useTimelineScale({
    startYear,
    endYear,
    containerWidth,
  });

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const style = getComputedStyle(el);
    const paddingX =
      parseFloat(style.paddingLeft || '0') + parseFloat(style.paddingRight || '0');
    const initialWidth = el.clientWidth - paddingX;
    if (initialWidth > 0) setContainerWidth(initialWidth);

    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width;
      if (width && width > 0) setContainerWidth(width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setZoom((z: number) => Math.max(1, Math.min(10, z * delta)));
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [setZoom]);

  return (
    <div className="timeline-view" ref={containerRef}>
      <TimelineSVG
        data={data}
        yearToPixel={yearToPixel}
        totalWidth={totalWidth}
        selectedPersonId={selectedPersonId}
        hoveredPersonId={hoveredPersonId}
        onPersonClick={onPersonClick}
        onPersonMouseEnter={onPersonMouseEnter}
        onPersonMouseLeave={onPersonMouseLeave}
        onPersonFocus={onPersonFocus}
        onPersonBlur={onPersonBlur}
      />
    </div>
  );
});
