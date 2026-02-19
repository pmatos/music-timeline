import { renderHook, waitFor } from '@testing-library/react';
import { useInstrumentData } from './useInstrumentData';
import type { Person, Connection, InstrumentConfig } from '../types';

const mockPeople: Person[] = [
  {
    id: 'bach',
    name: 'J.S. Bach',
    born: 1685,
    died: 1750,
    role: 'both',
    bio: 'German composer.',
    photoUrl: null,
    wikiUrl: 'https://example.com/bach',
    websiteUrl: null,
  },
  {
    id: 'vivaldi',
    name: 'A. Vivaldi',
    born: 1678,
    died: 1741,
    role: 'both',
    bio: 'Italian composer.',
    photoUrl: null,
    wikiUrl: 'https://example.com/vivaldi',
    websiteUrl: null,
  },
  {
    id: 'beethoven',
    name: 'L.v. Beethoven',
    born: 1770,
    died: 1827,
    role: 'composer',
    bio: 'German composer.',
    photoUrl: null,
    wikiUrl: 'https://example.com/beethoven',
    websiteUrl: null,
  },
];

const mockConnections: Connection[] = [
  { from: 'bach', to: 'beethoven', type: 'student-teacher', label: 'influence' },
  { from: 'bach', to: 'vivaldi', type: 'student-teacher', label: 'influence' },
];

const mockPianoConfig: InstrumentConfig = {
  instrument: 'Piano',
  eras: [{ name: 'Baroque', startYear: 1600, endYear: 1750, color: '#E3F2FD' }],
  peopleIds: ['bach', 'beethoven'],
};

function mockFetchResponses(
  people: Person[],
  connections: Connection[],
  config: InstrumentConfig,
) {
  global.fetch = vi.fn().mockImplementation((url: string) => {
    if (url.includes('people.json')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(people) });
    }
    if (url.includes('connections.json')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(connections) });
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve(config) });
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

test('loads and merges instrument data', async () => {
  mockFetchResponses(mockPeople, mockConnections, mockPianoConfig);

  const { result } = renderHook(() => useInstrumentData('piano'));

  expect(result.current.loading).toBe(true);

  await waitFor(() => {
    expect(result.current.loading).toBe(false);
  });

  expect(result.current.error).toBeNull();
  expect(result.current.data).not.toBeNull();
  expect(result.current.data!.instrument).toBe('Piano');
  expect(result.current.data!.eras).toEqual(mockPianoConfig.eras);
  expect(result.current.data!.people).toHaveLength(2);
  expect(result.current.data!.people.map((p) => p.id)).toEqual(['bach', 'beethoven']);
});

test('filters connections to only include people in the instrument', async () => {
  mockFetchResponses(mockPeople, mockConnections, mockPianoConfig);

  const { result } = renderHook(() => useInstrumentData('piano'));

  await waitFor(() => {
    expect(result.current.loading).toBe(false);
  });

  // bach->beethoven should be included (both in piano)
  // bach->vivaldi should be excluded (vivaldi not in piano)
  expect(result.current.data!.connections).toHaveLength(1);
  expect(result.current.data!.connections[0]).toEqual(mockConnections[0]);
});

test('returns error when any fetch fails', async () => {
  global.fetch = vi.fn().mockImplementation((url: string) => {
    if (url.includes('people.json')) {
      return Promise.resolve({ ok: false, status: 404 });
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
  });

  const { result } = renderHook(() => useInstrumentData('piano'));

  await waitFor(() => {
    expect(result.current.loading).toBe(false);
  });

  expect(result.current.data).toBeNull();
  expect(result.current.error).toBeTruthy();
});

test('fetches three URLs: people.json, connections.json, and instrument config', async () => {
  mockFetchResponses(mockPeople, mockConnections, mockPianoConfig);

  const { result } = renderHook(() => useInstrumentData('piano'));

  await waitFor(() => {
    expect(result.current.loading).toBe(false);
  });

  expect(global.fetch).toHaveBeenCalledTimes(3);
  expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('data/people.json'));
  expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('data/connections.json'));
  expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('data/piano.json'));
});
