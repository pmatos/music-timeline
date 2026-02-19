interface TimeAxisProps {
  startYear: number;
  endYear: number;
  yearToPixel: (year: number) => number;
  y: number;
}

export function TimeAxis({ startYear, endYear, yearToPixel, y }: TimeAxisProps) {
  const interval = getInterval(endYear - startYear);
  const firstTick = Math.ceil(startYear / interval) * interval;
  const ticks: number[] = [];
  for (let year = firstTick; year <= endYear; year += interval) {
    ticks.push(year);
  }
  return (
    <g className="time-axis">
      <line x1={yearToPixel(startYear)} x2={yearToPixel(endYear)} y1={y} y2={y} stroke="#ccc" strokeWidth={1} />
      {ticks.map((year) => {
        const x = yearToPixel(year);
        return (
          <g key={year}>
            <line x1={x} x2={x} y1={y} y2={y + 8} stroke="#ccc" strokeWidth={1} />
            <text x={x} y={y + 22} textAnchor="middle" fontSize={12} fill="#888">{year}</text>
          </g>
        );
      })}
    </g>
  );
}

function getInterval(range: number): number {
  if (range > 300) return 100;
  if (range > 150) return 50;
  if (range > 60) return 25;
  return 10;
}
