import { render, fireEvent } from '@testing-library/react';
import { PersonBar } from './PersonBar';
import type { Person } from '../types';

const person: Person = {
  id: 'bach', name: 'J.S. Bach', born: 1685, died: 1750, role: 'composer',
  bio: 'A composer.', photoUrl: null, wikiUrl: '', websiteUrl: null,
};

test('renders a rect for the person', () => {
  const { container } = render(
    <svg><PersonBar person={person} x={100} width={200} y={30} height={24}
      highlighted={false} dimmed={false} onClick={() => {}} onMouseEnter={() => {}} onMouseLeave={() => {}} /></svg>
  );
  const rect = container.querySelector('rect');
  expect(rect).toBeInTheDocument();
  expect(rect).toHaveAttribute('x', '100');
  expect(rect).toHaveAttribute('width', '200');
});

test('displays person name', () => {
  const { container } = render(
    <svg><PersonBar person={person} x={100} width={200} y={30} height={24}
      highlighted={false} dimmed={false} onClick={() => {}} onMouseEnter={() => {}} onMouseLeave={() => {}} /></svg>
  );
  const text = container.querySelector('text');
  expect(text?.textContent).toBe('J.S. Bach');
});

test('calls onClick when clicked', () => {
  const handleClick = vi.fn();
  const { container } = render(
    <svg><PersonBar person={person} x={100} width={200} y={30} height={24}
      highlighted={false} dimmed={false} onClick={handleClick} onMouseEnter={() => {}} onMouseLeave={() => {}} /></svg>
  );
  const group = container.querySelector('g');
  fireEvent.click(group!);
  expect(handleClick).toHaveBeenCalledWith(person);
});
