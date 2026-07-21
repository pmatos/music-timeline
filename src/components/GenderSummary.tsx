import type { Person } from '../types';

interface GenderSummaryProps {
  people: Person[];
}

const plural = (n: number, one: string, many: string) =>
  `${n} ${n === 1 ? one : many}`;

export function GenderSummary({ people }: GenderSummaryProps) {
  const total = people.length;
  const women = people.filter((p) => p.gender === 'female').length;
  const men = people.filter((p) => p.gender === 'male').length;
  const unrecorded = total - women - men;

  // Neutral counts; omit zero categories so the line reads as a plain tally.
  const parts = [
    plural(total, 'person', 'people'),
    women > 0 ? plural(women, 'woman', 'women') : null,
    men > 0 ? plural(men, 'man', 'men') : null,
    unrecorded > 0 ? `${unrecorded} unrecorded` : null,
  ].filter(Boolean);

  return <p className="gender-summary">{parts.join(' · ')}</p>;
}
