import { render } from '@testing-library/react';
import { EraBackgrounds } from './EraBackgrounds';
import type { Era } from '../types';

const eras: Era[] = [
  { name: 'Baroque', startYear: 1600, endYear: 1750, color: '#E3F2FD' },
  { name: 'Classical', startYear: 1730, endYear: 1820, color: '#FFF3E0' },
];

test('renders a rect for each era', () => {
  const { container } = render(
    <svg><EraBackgrounds eras={eras} yearToPixel={(y) => (y - 1600) * 2} height={400} /></svg>
  );
  const rects = container.querySelectorAll('rect');
  expect(rects).toHaveLength(2);
});

test('renders era name labels', () => {
  const { container } = render(
    <svg><EraBackgrounds eras={eras} yearToPixel={(y) => (y - 1600) * 2} height={400} /></svg>
  );
  const texts = container.querySelectorAll('text');
  const labels = Array.from(texts).map((t) => t.textContent);
  expect(labels).toContain('Baroque');
  expect(labels).toContain('Classical');
});
