import { render, act } from '@testing-library/react';
import { TimelineView } from './TimelineView';
import type { InstrumentData } from '../types';

const data: InstrumentData = {
  instrument: 'Piano',
  eras: [{ name: 'Baroque', startYear: 1600, endYear: 1750, color: '#E3F2FD' }],
  people: [
    {
      id: 'bach',
      name: 'J.S. Bach',
      born: 1685,
      died: 1750,
      role: 'composer',
      bio: '',
      photoUrl: null,
      wikiUrl: '',
      websiteUrl: null,
    },
  ],
  connections: [],
};

test('renders a scrollable container with the SVG', () => {
  const { container } = render(
    <TimelineView
      data={data}
      selectedPersonId={null}
      hoveredPersonId={null}
      onPersonClick={() => {}}
      onPersonMouseEnter={() => {}}
      onPersonMouseLeave={() => {}}
      onPersonFocus={() => {}}
      onPersonBlur={() => {}}
    />,
  );
  expect(container.querySelector('.timeline-view')).toBeInTheDocument();
  expect(container.querySelector('svg')).toBeInTheDocument();
});

test('stretches the SVG to match the container width reported by ResizeObserver', () => {
  let resizeCallback: ResizeObserverCallback | undefined;
  const originalResizeObserver = globalThis.ResizeObserver;
  class MockResizeObserver {
    constructor(callback: ResizeObserverCallback) {
      resizeCallback = callback;
    }
    observe = () => {};
    unobserve = () => {};
    disconnect = () => {};
  }
  globalThis.ResizeObserver =
    MockResizeObserver as unknown as typeof ResizeObserver;

  const { container } = render(
    <TimelineView
      data={data}
      selectedPersonId={null}
      hoveredPersonId={null}
      onPersonClick={() => {}}
      onPersonMouseEnter={() => {}}
      onPersonMouseLeave={() => {}}
      onPersonFocus={() => {}}
      onPersonBlur={() => {}}
    />,
  );

  act(() => {
    resizeCallback?.(
      [{ contentRect: { width: 900 } } as ResizeObserverEntry],
      {} as ResizeObserver,
    );
  });

  expect(container.querySelector('svg')).toHaveAttribute('width', '900');

  globalThis.ResizeObserver = originalResizeObserver;
});
