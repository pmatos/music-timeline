import { render, screen, fireEvent } from '@testing-library/react';
import { PersonPanel } from './PersonPanel';
import type { Person } from '../types';

const person: Person = {
  id: 'bach', name: 'J.S. Bach', born: 1685, died: 1750, role: 'composer',
  bio: 'German composer of the Baroque period.',
  photoUrl: '/images/piano/bach.jpg',
  wikiUrl: 'https://en.wikipedia.org/wiki/Johann_Sebastian_Bach',
  websiteUrl: null,
};

test('renders nothing when person is null', () => {
  const { container } = render(<PersonPanel person={null} onClose={() => {}} />);
  expect(container.querySelector('.person-panel')).not.toBeInTheDocument();
});

test('renders person details', () => {
  render(<PersonPanel person={person} onClose={() => {}} />);
  expect(screen.getByText('J.S. Bach')).toBeInTheDocument();
  expect(screen.getByText('1685\u20131750')).toBeInTheDocument();
  expect(screen.getByText('composer')).toBeInTheDocument();
  expect(screen.getByText('German composer of the Baroque period.')).toBeInTheDocument();
});

test('renders wiki link', () => {
  render(<PersonPanel person={person} onClose={() => {}} />);
  const link = screen.getByText('Wikipedia');
  expect(link).toHaveAttribute('href', person.wikiUrl);
});

test('renders website link when available', () => {
  const withSite = { ...person, websiteUrl: 'https://example.com' };
  render(<PersonPanel person={withSite} onClose={() => {}} />);
  expect(screen.getByText('Website')).toHaveAttribute('href', 'https://example.com');
});

test('calls onClose when close button clicked', () => {
  const onClose = vi.fn();
  render(<PersonPanel person={person} onClose={onClose} />);
  fireEvent.click(screen.getByLabelText('Close'));
  expect(onClose).toHaveBeenCalled();
});
