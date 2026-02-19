import { useMemo } from 'react';
import type { InstrumentData, Person } from '../types';
import { packLanes } from '../layout/packLanes';
import { EraBackgrounds } from './EraBackgrounds';
import { TimeAxis } from './TimeAxis';
import { PersonBar } from './PersonBar';
import { ConnectionLine } from './ConnectionLine';

const BAR_HEIGHT = 24;
const LANE_GAP = 6;
const TOP_PADDING = 30;
const BOTTOM_PADDING = 40;
const CURRENT_YEAR = new Date().getFullYear();

interface TimelineSVGProps {
  data: InstrumentData;
  yearToPixel: (year: number) => number;
  totalWidth: number;
  selectedPersonId: string | null;
  hoveredPersonId: string | null;
  onPersonClick: (person: Person) => void;
  onPersonMouseEnter: (person: Person) => void;
  onPersonMouseLeave: () => void;
}

export function TimelineSVG({
  data, yearToPixel, totalWidth, selectedPersonId, hoveredPersonId,
  onPersonClick, onPersonMouseEnter, onPersonMouseLeave,
}: TimelineSVGProps) {
  const laneAssignments = useMemo(() => packLanes(data.people, CURRENT_YEAR), [data.people]);
  const laneCount = Math.max(0, ...laneAssignments.map((a) => a.lane)) + 1;
  const contentHeight = laneCount * (BAR_HEIGHT + LANE_GAP);
  const svgHeight = TOP_PADDING + contentHeight + BOTTOM_PADDING;

  const personPositions = useMemo(() => {
    const map = new Map<string, { x: number; width: number; y: number }>();
    for (const { person, lane } of laneAssignments) {
      const x = yearToPixel(person.born);
      const endX = yearToPixel(person.died ?? CURRENT_YEAR);
      const y = TOP_PADDING + lane * (BAR_HEIGHT + LANE_GAP);
      map.set(person.id, { x, width: endX - x, y });
    }
    return map;
  }, [laneAssignments, yearToPixel]);

  const connectedIds = useMemo(() => {
    const active = selectedPersonId ?? hoveredPersonId;
    if (!active) return new Set<string>();
    const ids = new Set<string>([active]);
    for (const conn of data.connections) {
      if (conn.from === active || conn.to === active) {
        ids.add(conn.from);
        ids.add(conn.to);
      }
    }
    return ids;
  }, [selectedPersonId, hoveredPersonId, data.connections]);

  const hasActive = connectedIds.size > 0;
  const startYear = Math.min(...data.eras.map((e) => e.startYear), ...data.people.map((p) => p.born));
  const endYear = Math.max(...data.eras.map((e) => e.endYear), CURRENT_YEAR);

  return (
    <svg width={totalWidth} height={svgHeight}>
      <EraBackgrounds eras={data.eras} yearToPixel={yearToPixel} height={TOP_PADDING + contentHeight} />
      {data.connections.map((conn, i) => {
        const fromPos = personPositions.get(conn.from);
        const toPos = personPositions.get(conn.to);
        if (!fromPos || !toPos) return null;
        const isHighlighted = hasActive && connectedIds.has(conn.from) && connectedIds.has(conn.to);
        return (
          <ConnectionLine key={i} x1={fromPos.x + fromPos.width / 2} y1={fromPos.y + BAR_HEIGHT / 2}
            x2={toPos.x + toPos.width / 2} y2={toPos.y + BAR_HEIGHT / 2}
            type={conn.type} highlighted={isHighlighted} dimmed={hasActive && !isHighlighted} />
        );
      })}
      {laneAssignments.map(({ person }) => {
        const pos = personPositions.get(person.id)!;
        return (
          <PersonBar key={person.id} person={person} x={pos.x} width={pos.width} y={pos.y} height={BAR_HEIGHT}
            highlighted={connectedIds.has(person.id)} dimmed={hasActive && !connectedIds.has(person.id)}
            onClick={onPersonClick} onMouseEnter={onPersonMouseEnter} onMouseLeave={onPersonMouseLeave} />
        );
      })}
      <TimeAxis startYear={startYear} endYear={endYear} yearToPixel={yearToPixel} y={TOP_PADDING + contentHeight + 4} />
    </svg>
  );
}
