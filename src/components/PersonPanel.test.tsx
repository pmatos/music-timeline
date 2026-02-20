import { render, screen, fireEvent } from '@testing-library/react';
import { PersonPanel } from './PersonPanel';
import type { Person, Connection } from '../types';

const person: Person = {
  id: 'bach', name: 'J.S. Bach', born: 1685, died: 1750, role: 'composer',
  bio: 'German composer of the Baroque period.',
  photoUrl: '/images/piano/bach.jpg',
  wikiUrl: 'https://en.wikipedia.org/wiki/Johann_Sebastian_Bach',
  websiteUrl: null,
};

const defaultProps = {
  connections: [] as Connection[],
  people: [] as Person[],
  onPersonClick: vi.fn(),
  onClose: vi.fn(),
};

test('renders nothing when person is null', () => {
  const { container } = render(<PersonPanel person={null} {...defaultProps} />);
  expect(container.querySelector('.person-panel')).not.toBeInTheDocument();
});

test('renders person details', () => {
  render(<PersonPanel person={person} {...defaultProps} />);
  expect(screen.getByText('J.S. Bach')).toBeInTheDocument();
  expect(screen.getByText('1685\u20131750')).toBeInTheDocument();
  expect(screen.getByText('composer')).toBeInTheDocument();
  expect(screen.getByText('German composer of the Baroque period.')).toBeInTheDocument();
});

test('renders wiki link', () => {
  render(<PersonPanel person={person} {...defaultProps} />);
  const link = screen.getByText('Wikipedia');
  expect(link).toHaveAttribute('href', person.wikiUrl);
});

test('renders website link when available', () => {
  const withSite = { ...person, websiteUrl: 'https://example.com' };
  render(<PersonPanel person={withSite} {...defaultProps} />);
  expect(screen.getByText('Website')).toHaveAttribute('href', 'https://example.com');
});

test('calls onClose when close button clicked', () => {
  const onClose = vi.fn();
  render(<PersonPanel person={person} {...defaultProps} onClose={onClose} />);
  fireEvent.click(screen.getByLabelText('Close'));
  expect(onClose).toHaveBeenCalled();
});

// --- Connection tests ---

const beethoven: Person = {
  id: 'beethoven', name: 'L.v. Beethoven', born: 1770, died: 1827, role: 'composer',
  bio: 'German composer.', photoUrl: null, wikiUrl: null, websiteUrl: null,
};

const haydn: Person = {
  id: 'haydn', name: 'Joseph Haydn', born: 1732, died: 1809, role: 'composer',
  bio: 'Austrian composer.', photoUrl: null, wikiUrl: null, websiteUrl: null,
};

const cpebach: Person = {
  id: 'cpe-bach', name: 'C.P.E. Bach', born: 1714, died: 1788, role: 'composer',
  bio: 'German composer.', photoUrl: null, wikiUrl: null, websiteUrl: null,
};

test('renders Taught group when person is teacher', () => {
  const connections: Connection[] = [
    { from: 'haydn', to: 'beethoven', type: 'student-teacher', label: 'teacher/student' },
  ];
  render(
    <PersonPanel person={haydn} connections={connections}
      people={[haydn, beethoven]} onPersonClick={vi.fn()} onClose={vi.fn()} />
  );
  expect(screen.getByText('Taught')).toBeInTheDocument();
  expect(screen.getByText('L.v. Beethoven')).toBeInTheDocument();
});

test('renders Student of group when person is student', () => {
  const connections: Connection[] = [
    { from: 'haydn', to: 'beethoven', type: 'student-teacher', label: 'teacher/student' },
  ];
  render(
    <PersonPanel person={beethoven} connections={connections}
      people={[haydn, beethoven]} onPersonClick={vi.fn()} onClose={vi.fn()} />
  );
  expect(screen.getByText('Student of')).toBeInTheDocument();
  expect(screen.getByText('Joseph Haydn')).toBeInTheDocument();
});

test('renders Related to group for relatives', () => {
  const connections: Connection[] = [
    { from: 'bach', to: 'cpe-bach', type: 'relative', label: 'father/son' },
  ];
  render(
    <PersonPanel person={person} connections={connections}
      people={[person, cpebach]} onPersonClick={vi.fn()} onClose={vi.fn()} />
  );
  expect(screen.getByText('Related to')).toBeInTheDocument();
  expect(screen.getByText('C.P.E. Bach')).toBeInTheDocument();
});

test('clicking a connection name calls onPersonClick', () => {
  const onPersonClick = vi.fn();
  const connections: Connection[] = [
    { from: 'haydn', to: 'beethoven', type: 'student-teacher', label: 'teacher/student' },
  ];
  render(
    <PersonPanel person={haydn} connections={connections}
      people={[haydn, beethoven]} onPersonClick={onPersonClick} onClose={vi.fn()} />
  );
  fireEvent.click(screen.getByText('L.v. Beethoven'));
  expect(onPersonClick).toHaveBeenCalledWith(beethoven);
});

test('does not render connections section when no connections', () => {
  const { container } = render(
    <PersonPanel person={person} {...defaultProps} />
  );
  expect(container.querySelector('.person-panel__connections')).not.toBeInTheDocument();
});
