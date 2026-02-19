import type { Era } from '../types';

interface EraBackgroundsProps {
  eras: Era[];
  yearToPixel: (year: number) => number;
  height: number;
}

export function EraBackgrounds({ eras, yearToPixel, height }: EraBackgroundsProps) {
  return (
    <g className="era-backgrounds">
      {eras.map((era) => {
        const x = yearToPixel(era.startYear);
        const width = yearToPixel(era.endYear) - x;
        return (
          <g key={era.name}>
            <rect x={x} y={0} width={width} height={height} fill={era.color} opacity={0.3} />
            <text x={x + width / 2} y={16} textAnchor="middle" fontSize={11} fill="#666" fontWeight={600}>{era.name}</text>
          </g>
        );
      })}
    </g>
  );
}
