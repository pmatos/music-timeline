import { render } from '@testing-library/react';
import { TimelineView } from './TimelineView';
import type { InstrumentData } from '../types';

const data: InstrumentData = {
  instrument: 'Piano',
  eras: [{ name: 'Baroque', startYear: 1600, endYear: 1750, color: '#E3F2FD' }],
  people: [{ id: 'bach', name: 'J.S. Bach', born: 1685, died: 1750, role: 'composer', bio: '', photoUrl: null, wikiUrl: '', websiteUrl: null }],
  connections: [],
};

test('renders a scrollable container with the SVG', () => {
  const { container } = render(
    <TimelineView data={data} selectedPersonId={null} hoveredPersonId={null}
      onPersonClick={() => {}} onPersonMouseEnter={() => {}} onPersonMouseLeave={() => {}} />
  );
  expect(container.querySelector('.timeline-view')).toBeInTheDocument();
  expect(container.querySelector('svg')).toBeInTheDocument();
});
