import { renderHook, waitFor } from '@testing-library/react';
import { useInstrumentData } from './useInstrumentData';
import type { InstrumentData } from '../types';

const mockData: InstrumentData = {
  instrument: 'Piano',
  eras: [],
  people: [
    {
      id: 'test',
      name: 'Test Person',
      born: 1900,
      died: 1980,
      role: 'composer',
      bio: 'Test bio.',
      photoUrl: null,
      wikiUrl: 'https://example.com',
      websiteUrl: null,
    },
  ],
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

test('loads instrument data', async () => {
  const { result } = renderHook(() => useInstrumentData('piano'));

  expect(result.current.loading).toBe(true);

  await waitFor(() => {
    expect(result.current.loading).toBe(false);
  });

  expect(result.current.data).toEqual(mockData);
  expect(result.current.error).toBeNull();
  expect(global.fetch).toHaveBeenCalledWith(
    expect.stringContaining('data/piano.json')
  );
});

test('returns error on fetch failure', async () => {
  (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
    ok: false,
    status: 404,
  });

  const { result } = renderHook(() => useInstrumentData('piano'));

  await waitFor(() => {
    expect(result.current.loading).toBe(false);
  });

  expect(result.current.data).toBeNull();
  expect(result.current.error).toBeTruthy();
});
