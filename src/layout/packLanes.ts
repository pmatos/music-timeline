import type { Person } from '../types';

export interface LaneAssignment {
  person: Person;
  lane: number;
}

export function packLanes(
  people: Person[],
  currentYear: number
): LaneAssignment[] {
  const sorted = [...people].sort((a, b) => a.born - b.born);
  const laneEnds: number[] = [];

  return sorted.map((person) => {
    const endYear = person.died ?? currentYear;

    let lane = laneEnds.findIndex((end) => end <= person.born);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(endYear);
    } else {
      laneEnds[lane] = endYear;
    }

    return { person, lane };
  });
}
