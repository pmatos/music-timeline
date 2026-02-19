import { render } from '@testing-library/react';
import { TimeAxis } from './TimeAxis';

test('renders year labels', () => {
  const { container } = render(
    <svg>
      <TimeAxis startYear={1600} endYear={1800} yearToPixel={(y) => (y - 1600) * 5} y={100} />
    </svg>
  );
  const texts = container.querySelectorAll('text');
  const labels = Array.from(texts).map((t) => t.textContent);
  expect(labels).toContain('1600');
  expect(labels).toContain('1700');
  expect(labels).toContain('1800');
});

test('renders tick marks', () => {
  const { container } = render(
    <svg>
      <TimeAxis startYear={1600} endYear={1800} yearToPixel={(y) => (y - 1600) * 5} y={100} />
    </svg>
  );
  const lines = container.querySelectorAll('line');
  expect(lines.length).toBeGreaterThan(0);
});
