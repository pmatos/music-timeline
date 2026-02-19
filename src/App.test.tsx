import { render, screen, waitFor } from '@testing-library/react';
import App from './App';
import type { Person, Connection, InstrumentConfig } from './types';

const mockPeople: Person[] = [
  { id: 'bach', name: 'J.S. Bach', born: 1685, died: 1750, role: 'composer', bio: 'A composer.', photoUrl: null, wikiUrl: '', websiteUrl: null },
];

const mockConnections: Connection[] = [];

const mockPianoConfig: InstrumentConfig = {
  instrument: 'Piano',
  eras: [{ name: 'Baroque', startYear: 1600, endYear: 1750, color: '#E3F2FD' }],
  peopleIds: ['bach'],
};

beforeEach(() => {
  global.fetch = vi.fn().mockImplementation((url: string) => {
    if (url.includes('people.json')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(mockPeople) });
    }
    if (url.includes('connections.json')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(mockConnections) });
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve(mockPianoConfig) });
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

test('renders header with instrument name after loading', async () => {
  render(<App />);
  await waitFor(() => {
    expect(screen.getByText('Piano Music Timeline')).toBeInTheDocument();
  });
});

test('renders footer with github link', async () => {
  render(<App />);
  await waitFor(() => {
    expect(screen.getByText(/suggest edits/i)).toBeInTheDocument();
  });
});
