import { render, screen, waitFor } from '@testing-library/react';
import App from './App';
import type { InstrumentData } from './types';

const mockData: InstrumentData = {
  instrument: 'Piano',
  eras: [{ name: 'Baroque', startYear: 1600, endYear: 1750, color: '#E3F2FD' }],
  people: [{ id: 'bach', name: 'J.S. Bach', born: 1685, died: 1750, role: 'composer', bio: 'A composer.', photoUrl: null, wikiUrl: '', websiteUrl: null }],
  connections: [],
};

beforeEach(() => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(mockData),
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
