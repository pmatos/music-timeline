import { render, fireEvent } from '@testing-library/react';
import { PersonBar } from './PersonBar';
import type { Person } from '../types';

const person: Person = {
  id: 'bach',
  name: 'J.S. Bach',
  born: 1685,
  died: 1750,
  role: 'composer',
  bio: 'A composer.',
  photoUrl: null,
  wikiUrl: '',
  websiteUrl: null,
};

test('renders a rect for the person', () => {
  const { container } = render(
    <svg>
      <PersonBar
        person={person}
        x={100}
        width={200}
        y={30}
        height={24}
        highlighted={false}
        dimmed={false}
        onClick={() => {}}
        onMouseEnter={() => {}}
        onMouseLeave={() => {}}
        onFocus={() => {}}
        onBlur={() => {}}
      />
    </svg>,
  );
  const rect = container.querySelector('rect');
  expect(rect).toBeInTheDocument();
  expect(rect).toHaveAttribute('x', '100');
  expect(rect).toHaveAttribute('width', '200');
});

test('displays person name', () => {
  const { container } = render(
    <svg>
      <PersonBar
        person={person}
        x={100}
        width={200}
        y={30}
        height={24}
        highlighted={false}
        dimmed={false}
        onClick={() => {}}
        onMouseEnter={() => {}}
        onMouseLeave={() => {}}
        onFocus={() => {}}
        onBlur={() => {}}
      />
    </svg>,
  );
  const text = container.querySelector('text');
  expect(text?.textContent).toBe('J.S. Bach');
});

test('calls onClick when clicked', () => {
  const handleClick = vi.fn();
  const { container } = render(
    <svg>
      <PersonBar
        person={person}
        x={100}
        width={200}
        y={30}
        height={24}
        highlighted={false}
        dimmed={false}
        onClick={handleClick}
        onMouseEnter={() => {}}
        onMouseLeave={() => {}}
        onFocus={() => {}}
        onBlur={() => {}}
      />
    </svg>,
  );
  const group = container.querySelector('g');
  fireEvent.click(group!);
  expect(handleClick).toHaveBeenCalledWith(person);
});

function renderBar(overrides: Partial<Parameters<typeof PersonBar>[0]> = {}) {
  const props = {
    person,
    x: 100,
    width: 200,
    y: 30,
    height: 24,
    highlighted: false,
    dimmed: false,
    onClick: () => {},
    onMouseEnter: () => {},
    onMouseLeave: () => {},
    onFocus: () => {},
    onBlur: () => {},
    ...overrides,
  };
  const { container } = render(
    <svg>
      <PersonBar {...props} />
    </svg>,
  );
  return container.querySelector('g')!;
}

test('exposes button semantics and an accessible label', () => {
  const group = renderBar();
  expect(group).toHaveAttribute('role', 'button');
  expect(group).toHaveAttribute('tabindex', '0');
  const label = group.getAttribute('aria-label') ?? '';
  expect(label).toContain('J.S. Bach');
  expect(label).toContain('Composer');
  expect(label).toContain('1685');
});

test('activates with Enter and Space keys', () => {
  const handleClick = vi.fn();
  const group = renderBar({ onClick: handleClick });
  fireEvent.keyDown(group, { key: 'Enter' });
  fireEvent.keyDown(group, { key: ' ' });
  expect(handleClick).toHaveBeenCalledTimes(2);
  expect(handleClick).toHaveBeenCalledWith(person);
});

test('does not activate on other keys', () => {
  const handleClick = vi.fn();
  const group = renderBar({ onClick: handleClick });
  fireEvent.keyDown(group, { key: 'Tab' });
  expect(handleClick).not.toHaveBeenCalled();
});

test('reports the person and its rect on focus', () => {
  const handleFocus = vi.fn();
  const group = renderBar({ onFocus: handleFocus });
  group.scrollIntoView = vi.fn();
  fireEvent.focus(group);
  expect(group.scrollIntoView).toHaveBeenCalled();
  expect(handleFocus.mock.calls[0][0]).toEqual(person);
});
