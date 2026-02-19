# Multi-Instrument Data Split Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Split monolithic piano.json into shared people.json + connections.json + per-instrument config files, then add violin as a second instrument.

**Architecture:** The hook fetches three JSON files (people, connections, instrument config), caches the shared ones, and merges them into the existing `InstrumentData` shape so all downstream components remain unchanged.

**Tech Stack:** React 19, TypeScript, Vite, Vitest

---

### Task 1: Add InstrumentConfig type

**Files:**
- Modify: `src/types.ts`
- Modify: `src/types.test.ts`

**Step 1: Write the failing test**

Add to `src/types.test.ts`:

```typescript
import type { InstrumentConfig } from './types';

test('InstrumentConfig structure is valid', () => {
  const config: InstrumentConfig = {
    instrument: 'Piano',
    eras: [
      { name: 'Baroque', startYear: 1600, endYear: 1750, color: '#E3F2FD' },
    ],
    peopleIds: ['bach', 'beethoven'],
  };

  expect(config.instrument).toBe('Piano');
  expect(config.eras).toHaveLength(1);
  expect(config.peopleIds).toHaveLength(2);
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/types.test.ts`
Expected: FAIL — `InstrumentConfig` does not exist in `./types`

**Step 3: Write minimal implementation**

Add to `src/types.ts` after the `InstrumentData` interface:

```typescript
export interface InstrumentConfig {
  instrument: string;
  eras: Era[];
  peopleIds: string[];
}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/types.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/types.ts src/types.test.ts
git commit -m "feat: add InstrumentConfig type for split data model"
```

---

### Task 2: Split piano.json into people.json, connections.json, and slim piano.json

**Files:**
- Read: `public/data/piano.json` (current monolithic file)
- Create: `public/data/people.json`
- Create: `public/data/connections.json`
- Modify: `public/data/piano.json` (replace with slim version)

This task is a data migration — no tests needed since the data files are static JSON. We validate correctness by running existing tests after Task 3.

**Step 1: Extract people array to people.json**

Write a node script or use jq to extract the `people` array from `piano.json` into `public/data/people.json`. The output should be a flat JSON array (not wrapped in an object):

```bash
node -e "
const data = require('./public/data/piano.json');
const fs = require('fs');
fs.writeFileSync('./public/data/people.json', JSON.stringify(data.people, null, 2) + '\n');
"
```

**Step 2: Extract connections array to connections.json**

```bash
node -e "
const data = require('./public/data/piano.json');
const fs = require('fs');
fs.writeFileSync('./public/data/connections.json', JSON.stringify(data.connections, null, 2) + '\n');
"
```

**Step 3: Replace piano.json with slim config version**

```bash
node -e "
const data = require('./public/data/piano.json');
const fs = require('fs');
const config = {
  instrument: data.instrument,
  eras: data.eras,
  peopleIds: data.people.map(p => p.id)
};
fs.writeFileSync('./public/data/piano.json', JSON.stringify(config, null, 2) + '\n');
"
```

**Step 4: Verify file integrity**

```bash
node -e "
const people = require('./public/data/people.json');
const connections = require('./public/data/connections.json');
const piano = require('./public/data/piano.json');
console.log('People:', people.length);
console.log('Connections:', connections.length);
console.log('Piano peopleIds:', piano.peopleIds.length);
console.log('Has eras:', piano.eras.length > 0);
console.log('IDs match:', JSON.stringify(people.map(p => p.id)) === JSON.stringify(piano.peopleIds));
"
```

Expected output: People count matches peopleIds count, IDs match is true.

**Step 5: Commit**

```bash
git add public/data/people.json public/data/connections.json public/data/piano.json
git commit -m "refactor: split piano.json into people.json, connections.json, and slim piano config"
```

---

### Task 3: Update useInstrumentData hook

**Files:**
- Modify: `src/hooks/useInstrumentData.ts`
- Modify: `src/hooks/useInstrumentData.test.ts`

**Step 1: Write the failing tests**

Replace the entire contents of `src/hooks/useInstrumentData.test.ts` with:

```typescript
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
```

**Step 2: Run tests to verify they fail**

Run: `npx vitest run src/hooks/useInstrumentData.test.ts`
Expected: FAIL — the current hook only fetches one file

**Step 3: Implement the updated hook**

Replace `src/hooks/useInstrumentData.ts` with:

```typescript
import { useState, useEffect, useRef } from 'react';
import type { InstrumentData, InstrumentConfig, Person, Connection } from '../types';

export function useInstrumentData(instrument: string) {
  const [data, setData] = useState<InstrumentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cacheRef = useRef<{ people: Person[]; connections: Connection[] } | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setData(null);

    const base = import.meta.env.BASE_URL;

    const fetchShared = cacheRef.current
      ? Promise.resolve(cacheRef.current)
      : Promise.all([
          fetch(`${base}data/people.json`).then((res) => {
            if (!res.ok) throw new Error('Failed to load people data');
            return res.json() as Promise<Person[]>;
          }),
          fetch(`${base}data/connections.json`).then((res) => {
            if (!res.ok) throw new Error('Failed to load connections data');
            return res.json() as Promise<Connection[]>;
          }),
        ]).then(([people, connections]) => {
          const shared = { people, connections };
          cacheRef.current = shared;
          return shared;
        });

    const fetchConfig = fetch(`${base}data/${instrument}.json`).then((res) => {
      if (!res.ok) throw new Error(`Failed to load ${instrument} data`);
      return res.json() as Promise<InstrumentConfig>;
    });

    Promise.all([fetchShared, fetchConfig])
      .then(([shared, config]) => {
        const idSet = new Set(config.peopleIds);
        const people = shared.people.filter((p) => idSet.has(p.id));
        const connections = shared.connections.filter(
          (c) => idSet.has(c.from) && idSet.has(c.to),
        );

        setData({
          instrument: config.instrument,
          eras: config.eras,
          people,
          connections,
        });
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, [instrument]);

  return { data, loading, error };
}
```

**Step 4: Run tests to verify they pass**

Run: `npx vitest run src/hooks/useInstrumentData.test.ts`
Expected: PASS (all 4 tests)

**Step 5: Run all tests to verify nothing is broken**

Run: `npx vitest run`
Expected: Some tests in `App.test.ts` may fail because they mock a single fetch — we fix those in Task 4.

**Step 6: Commit**

```bash
git add src/hooks/useInstrumentData.ts src/hooks/useInstrumentData.test.ts
git commit -m "feat: update useInstrumentData to fetch split data files and merge"
```

---

### Task 4: Fix App.test.tsx for new fetch pattern

**Files:**
- Modify: `src/App.test.tsx`

**Step 1: Update the mock to serve three files**

Replace `src/App.test.tsx` with:

```typescript
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
```

**Step 2: Run all tests**

Run: `npx vitest run`
Expected: ALL PASS

**Step 3: Commit**

```bash
git add src/App.test.tsx
git commit -m "fix: update App tests for split data fetch pattern"
```

---

### Task 5: Create violin.json and add to instruments list

**Files:**
- Create: `public/data/violin.json`
- Modify: `src/App.tsx` (line 10: update INSTRUMENTS array)

**Step 1: Create violin.json**

Write `public/data/violin.json` with violin-specific eras and a starter set of people IDs. Only include IDs that already exist in `people.json` (from the piano migration). For people not yet in `people.json`, we add them in Task 6.

```json
{
  "instrument": "Violin",
  "eras": [
    {
      "name": "Baroque",
      "startYear": 1600,
      "endYear": 1750,
      "color": "#E3F2FD"
    },
    {
      "name": "Classical",
      "startYear": 1730,
      "endYear": 1820,
      "color": "#FFF3E0"
    },
    {
      "name": "Romantic",
      "startYear": 1800,
      "endYear": 1910,
      "color": "#FCE4EC"
    },
    {
      "name": "Modern",
      "startYear": 1890,
      "endYear": 1975,
      "color": "#E8F5E9"
    },
    {
      "name": "Contemporary",
      "startYear": 1950,
      "endYear": 2030,
      "color": "#F3E5F5"
    }
  ],
  "peopleIds": []
}
```

Note: `peopleIds` starts empty. Task 6 populates it with violin-specific people added to `people.json`.

**Step 2: Update INSTRUMENTS in App.tsx**

Change line 10 of `src/App.tsx` from:

```typescript
const INSTRUMENTS = ['piano'];
```

to:

```typescript
const INSTRUMENTS = ['piano', 'violin'];
```

**Step 3: Run all tests**

Run: `npx vitest run`
Expected: ALL PASS (violin.json doesn't affect tests since default instrument is piano)

**Step 4: Manually verify in dev server**

Run: `npx vite dev` and check that:
- Piano still loads correctly
- Switching to Violin shows an empty timeline (no people yet)

**Step 5: Commit**

```bash
git add public/data/violin.json src/App.tsx
git commit -m "feat: add violin instrument config and enable in UI"
```

---

### Task 6: Populate violin data

**Files:**
- Modify: `public/data/people.json` (add new violin-specific people)
- Modify: `public/data/connections.json` (add violin-specific connections)
- Modify: `public/data/violin.json` (populate peopleIds)

This is a data-authoring task. The person adding violin data needs to:

1. Identify key violinists and violin composers across all eras
2. For people already in `people.json` (e.g. Bach, Beethoven), just add their IDs to `violin.json`'s `peopleIds`
3. For new people (e.g. Vivaldi, Paganini, Heifetz), add them to `people.json` and their IDs to `violin.json`
4. Add violin-relevant connections to `connections.json`

**Step 1: Add violin people to people.json and IDs to violin.json**

This is a large data entry step. Add people like: Corelli, Vivaldi, Tartini, Viotti, Paganini, Spohr, Wieniawski, Sarasate, Joachim, Ysaye, Kreisler, Heifetz, Oistrakh, Menuhin, Stern, Szeryng, Grumiaux, Milstein, Perlman, Zukerman, Mutter, Vengerov, Hilary Hahn, etc.

For each person already in `people.json` who is also relevant for violin (e.g. `bach`, `beethoven`, `brahms`, `tchaikovsky`, `bartok`, `stravinsky`, `prokofiev`, `shostakovich`, `britten`, `glass`, `part`, `adams`, `ades`), add their ID to `violin.json`'s `peopleIds` array.

**Step 2: Add violin connections to connections.json**

Add connections like:
- `corelli` → `vivaldi` (influence)
- `vivaldi` → `tartini` (influence)
- `viotti` → `spohr` (teacher/student)
- `joachim` → `ysaye` (influence)
- `auer` → `heifetz` (teacher/student)
- `auer` → `milstein` (teacher/student)
- etc.

**Step 3: Verify integrity**

```bash
node -e "
const people = require('./public/data/people.json');
const violin = require('./public/data/violin.json');
const ids = new Set(people.map(p => p.id));
const missing = violin.peopleIds.filter(id => !ids.has(id));
console.log('Missing from people.json:', missing.length === 0 ? 'none' : missing);
"
```

Expected: No missing IDs.

**Step 4: Manual test in dev server**

Run: `npx vite dev` and verify:
- Violin timeline shows the new people
- Connections render correctly
- Switching between Piano and Violin works

**Step 5: Commit**

```bash
git add public/data/people.json public/data/connections.json public/data/violin.json
git commit -m "feat: populate violin instrument with people and connections"
```

---

### Task 7: Add violin portrait images

**Files:**
- Create: `public/images/portraits/` (new violin-specific portrait files)
- Modify: `public/data/people.json` (update photoUrl for new people who have local portraits)

**Step 1: Source portrait images**

For each new person in `people.json` that needs a portrait:
- Use Wikimedia Commons public domain images where available
- Save to `public/images/portraits/<id>.jpg` (or `.png`)
- Update the person's `photoUrl` in `people.json` to `/images/portraits/<id>.jpg`

For people where no good public domain image exists, set `photoUrl` to `null`.

**Step 2: Verify images load**

Run: `npx vite dev` and click on violin people to verify portraits display in the PersonPanel.

**Step 3: Commit**

```bash
git add public/images/portraits/ public/data/people.json
git commit -m "feat: add portrait images for violin people"
```
