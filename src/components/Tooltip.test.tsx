import { render, screen } from '@testing-library/react';
import { Tooltip } from './Tooltip';
import type { Person } from '../types';

const person: Person = {
  id: 'bach', name: 'J.S. Bach', born: 1685, died: 1750, role: 'composer',
  bio: '', photoUrl: null, wikiUrl: '', websiteUrl: null,
};

test('renders nothing when person is null', () => {
  const { container } = render(<Tooltip person={null} x={0} y={0} />);
  expect(container.firstChild).toBeNull();
});

test('renders name and years when person is provided', () => {
  render(<Tooltip person={person} x={100} y={50} />);
  expect(screen.getByText('J.S. Bach')).toBeInTheDocument();
  expect(screen.getByText('1685\u20131750')).toBeInTheDocument();
});

test('shows present for living person', () => {
  const living = { ...person, id: 'll', name: 'Lang Lang', born: 1982, died: null };
  render(<Tooltip person={living} x={100} y={50} />);
  expect(screen.getByText('1982\u2013present')).toBeInTheDocument();
});
