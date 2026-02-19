import { render } from '@testing-library/react';
import { ConnectionLine } from './ConnectionLine';

test('renders an SVG path', () => {
  const { container } = render(
    <svg><ConnectionLine x1={100} y1={50} x2={300} y2={80} type="relative" highlighted={false} dimmed={false} /></svg>
  );
  const path = container.querySelector('path');
  expect(path).toBeInTheDocument();
  expect(path?.getAttribute('d')).toContain('M');
  expect(path?.getAttribute('d')).toContain('Q');
});

test('relative connections are solid', () => {
  const { container } = render(
    <svg><ConnectionLine x1={100} y1={50} x2={300} y2={80} type="relative" highlighted={false} dimmed={false} /></svg>
  );
  const path = container.querySelector('path');
  expect(path).not.toHaveAttribute('stroke-dasharray');
});

test('student-teacher connections are dashed', () => {
  const { container } = render(
    <svg><ConnectionLine x1={100} y1={50} x2={300} y2={80} type="student-teacher" highlighted={false} dimmed={false} /></svg>
  );
  const path = container.querySelector('path');
  expect(path?.getAttribute('stroke-dasharray')).toBeTruthy();
});
