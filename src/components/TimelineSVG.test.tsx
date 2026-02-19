import { render } from '@testing-library/react';
import { TimelineSVG } from './TimelineSVG';
import type { InstrumentData } from '../types';

const data: InstrumentData = {
  instrument: 'Piano',
  eras: [{ name: 'Baroque', startYear: 1600, endYear: 1750, color: '#E3F2FD' }],
  people: [
    { id: 'bach', name: 'J.S. Bach', born: 1685, died: 1750, role: 'composer', bio: '', photoUrl: null, wikiUrl: '', websiteUrl: null },
    { id: 'cpe-bach', name: 'C.P.E. Bach', born: 1714, died: 1788, role: 'composer', bio: '', photoUrl: null, wikiUrl: '', websiteUrl: null },
  ],
  connections: [{ from: 'bach', to: 'cpe-bach', type: 'relative', label: 'father/son' }],
};

test('renders an SVG element', () => {
  const { container } = render(
    <TimelineSVG data={data} yearToPixel={(y) => (y - 1600) * 2} totalWidth={860}
      selectedPersonId={null} hoveredPersonId={null}
      onPersonClick={() => {}} onPersonMouseEnter={() => {}} onPersonMouseLeave={() => {}} />
  );
  expect(container.querySelector('svg')).toBeInTheDocument();
});

test('renders person bars', () => {
  const { container } = render(
    <TimelineSVG data={data} yearToPixel={(y) => (y - 1600) * 2} totalWidth={860}
      selectedPersonId={null} hoveredPersonId={null}
      onPersonClick={() => {}} onPersonMouseEnter={() => {}} onPersonMouseLeave={() => {}} />
  );
  const bars = container.querySelectorAll('.person-bar');
  expect(bars).toHaveLength(2);
});

test('renders connection lines', () => {
  const { container } = render(
    <TimelineSVG data={data} yearToPixel={(y) => (y - 1600) * 2} totalWidth={860}
      selectedPersonId={null} hoveredPersonId={null}
      onPersonClick={() => {}} onPersonMouseEnter={() => {}} onPersonMouseLeave={() => {}} />
  );
  const paths = container.querySelectorAll('path');
  expect(paths.length).toBeGreaterThanOrEqual(1);
});
