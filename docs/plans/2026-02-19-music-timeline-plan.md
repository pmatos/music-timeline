# Music Timeline Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a static GitHub Pages site that displays an interactive SVG timeline of music composers and players per instrument, promoting rightkey.app.

**Architecture:** React SPA with custom SVG rendering. Per-instrument JSON data files are fetched at runtime. A lane-packing algorithm positions lifetime bars to avoid overlaps. Bezier curves connect related people. A slide-in panel shows details on click.

**Tech Stack:** React 19, TypeScript, Vite, custom SVG, GitHub Pages via GitHub Actions.

**Design doc:** `docs/plans/2026-02-19-music-timeline-design.md`

---

### Task 1: Scaffold the Vite + React + TypeScript project

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/index.css`, `src/vite-env.d.ts`

**Step 1: Initialize the project**

Run:
```bash
npm create vite@latest . -- --template react-ts
```

Accept defaults. This creates all the scaffolding files.

**Step 2: Install dependencies**

Run:
```bash
npm install
```

**Step 3: Verify it builds**

Run:
```bash
npm run build
```

Expected: Successful build, `dist/` directory created.

**Step 4: Clean up boilerplate**

- Delete `src/App.css`, `src/assets/` directory
- Replace `src/App.tsx` with a minimal placeholder:

```tsx
function App() {
  return <div>Music Timeline</div>;
}

export default App;
```

- Replace `src/index.css` with an empty file (we'll add styles later).

**Step 5: Set base path for GitHub Pages**

In `vite.config.ts`, set `base: '/music-timeline/'`:

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/music-timeline/',
});
```

**Step 6: Verify build still works**

Run:
```bash
npm run build
```

Expected: Successful build.

**Step 7: Commit**

```bash
git add -A
git commit -m "Scaffold Vite + React + TypeScript project"
```

---

### Task 2: Install Vitest and React Testing Library

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`, `src/setupTests.ts`

**Step 1: Install test dependencies**

Run:
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom @testing-library/user-event
```

**Step 2: Create vitest config**

Create `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    globals: true,
  },
});
```

**Step 3: Create test setup file**

Create `src/setupTests.ts`:

```ts
import '@testing-library/jest-dom/vitest';
```

**Step 4: Add test script to package.json**

Add to `"scripts"`:
```json
"test": "vitest run",
"test:watch": "vitest"
```

**Step 5: Write a smoke test**

Create `src/App.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app placeholder', () => {
  render(<App />);
  expect(screen.getByText('Music Timeline')).toBeInTheDocument();
});
```

**Step 6: Run tests**

Run:
```bash
npm test
```

Expected: 1 test passes.

**Step 7: Commit**

```bash
git add -A
git commit -m "Add Vitest and React Testing Library"
```

---

### Task 3: Define TypeScript types

**Files:**
- Create: `src/types.ts`
- Test: `src/types.test.ts`

**Step 1: Write a test that imports and uses the types**

Create `src/types.test.ts`:

```ts
import type { InstrumentData, Person, Connection, Era } from './types';

test('InstrumentData structure is valid', () => {
  const data: InstrumentData = {
    instrument: 'Piano',
    eras: [
      { name: 'Baroque', startYear: 1600, endYear: 1750, color: '#E3F2FD' },
    ],
    people: [
      {
        id: 'bach',
        name: 'J.S. Bach',
        born: 1685,
        died: 1750,
        role: 'composer',
        bio: 'A composer.',
        photoUrl: '/images/piano/bach.jpg',
        wikiUrl: 'https://en.wikipedia.org/wiki/Johann_Sebastian_Bach',
        websiteUrl: null,
      },
    ],
    connections: [
      { from: 'bach', to: 'cpe-bach', type: 'relative', label: 'father/son' },
    ],
  };

  expect(data.instrument).toBe('Piano');
  expect(data.people).toHaveLength(1);
  expect(data.eras).toHaveLength(1);
  expect(data.connections).toHaveLength(1);
});

test('Person with null died represents living person', () => {
  const person: Person = {
    id: 'lang-lang',
    name: 'Lang Lang',
    born: 1982,
    died: null,
    role: 'player',
    bio: 'A pianist.',
    photoUrl: 'https://upload.wikimedia.org/...',
    wikiUrl: 'https://en.wikipedia.org/wiki/Lang_Lang',
    websiteUrl: 'https://www.langlangofficial.com',
  };

  expect(person.died).toBeNull();
  expect(person.websiteUrl).not.toBeNull();
});
```

**Step 2: Run tests to verify they fail**

Run:
```bash
npm test
```

Expected: FAIL — cannot find module `./types`.

**Step 3: Create the types file**

Create `src/types.ts`:

```ts
export type Role = 'composer' | 'player' | 'both';

export type ConnectionType = 'relative' | 'student-teacher';

export interface Era {
  name: string;
  startYear: number;
  endYear: number;
  color: string;
}

export interface Person {
  id: string;
  name: string;
  born: number;
  died: number | null;
  role: Role;
  bio: string;
  photoUrl: string;
  wikiUrl: string;
  websiteUrl: string | null;
}

export interface Connection {
  from: string;
  to: string;
  type: ConnectionType;
  label?: string;
}

export interface InstrumentData {
  instrument: string;
  eras: Era[];
  people: Person[];
  connections: Connection[];
}
```

**Step 4: Run tests**

Run:
```bash
npm test
```

Expected: All tests pass.

**Step 5: Commit**

```bash
git add src/types.ts src/types.test.ts
git commit -m "Define TypeScript types for instrument data"
```

---

### Task 4: Create sample piano.json data file

**Files:**
- Create: `public/data/piano.json`

Note: This goes in `public/` so Vite serves it as a static asset and we can fetch it at runtime.

**Step 1: Create the data file**

Create `public/data/piano.json` with a representative sample of ~15 people across eras. Include:
- Baroque: J.S. Bach, G.F. Handel, D. Scarlatti
- Classical: C.P.E. Bach, W.A. Mozart, J. Haydn, L. van Beethoven
- Romantic: F. Chopin, F. Liszt, C. Czerny, R. Schumann, C. Debussy
- Modern/Contemporary: S. Rachmaninoff, L. Einaudi, Lang Lang

Include connections:
- Bach → C.P.E. Bach (relative, father/son)
- Beethoven → Czerny (student-teacher)
- Czerny → Liszt (student-teacher)
- Haydn → Beethoven (student-teacher)

Include eras:
- Baroque (1600–1750)
- Classical (1730–1820)
- Romantic (1800–1910)
- Modern (1890–1975)
- Contemporary (1950–present, use 2030 as endYear)

Use Wikipedia URLs for `wikiUrl`. Use `null` for `photoUrl` initially (we'll add images later). Use `null` for `websiteUrl` except for Einaudi and Lang Lang.

Use `null` for `died` for Einaudi and Lang Lang.

**Step 2: Validate JSON is valid**

Run:
```bash
node -e "JSON.parse(require('fs').readFileSync('public/data/piano.json', 'utf8')); console.log('Valid JSON')"
```

Expected: "Valid JSON"

**Step 3: Commit**

```bash
git add public/data/piano.json
git commit -m "Add sample piano data with composers, players, eras, and connections"
```

---

### Task 5: Data loading hook

**Files:**
- Create: `src/hooks/useInstrumentData.ts`
- Test: `src/hooks/useInstrumentData.test.ts`

**Step 1: Write the failing test**

Create `src/hooks/useInstrumentData.test.ts`:

```tsx
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
      photoUrl: '/test.jpg',
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
```

**Step 2: Run tests to verify failure**

Run: `npm test`

Expected: FAIL — cannot find module.

**Step 3: Implement the hook**

Create `src/hooks/useInstrumentData.ts`:

```ts
import { useState, useEffect } from 'react';
import type { InstrumentData } from '../types';

export function useInstrumentData(instrument: string) {
  const [data, setData] = useState<InstrumentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setData(null);

    fetch(`${import.meta.env.BASE_URL}data/${instrument}.json`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load ${instrument} data`);
        return res.json();
      })
      .then((json: InstrumentData) => {
        setData(json);
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

**Step 4: Run tests**

Run: `npm test`

Expected: All pass.

**Step 5: Commit**

```bash
git add src/hooks/useInstrumentData.ts src/hooks/useInstrumentData.test.ts
git commit -m "Add useInstrumentData hook for fetching instrument JSON"
```

---

### Task 6: Lane-packing algorithm

This is the core layout algorithm. Given a list of people sorted by birth year, assign each to the first available lane where they don't overlap with existing bars.

**Files:**
- Create: `src/layout/packLanes.ts`
- Test: `src/layout/packLanes.test.ts`

**Step 1: Write failing tests**

Create `src/layout/packLanes.test.ts`:

```ts
import { packLanes } from './packLanes';
import type { Person } from '../types';

function makePerson(id: string, born: number, died: number | null): Person {
  return {
    id,
    name: id,
    born,
    died,
    role: 'composer',
    bio: '',
    photoUrl: '',
    wikiUrl: '',
    websiteUrl: null,
  };
}

test('single person goes to lane 0', () => {
  const people = [makePerson('a', 1700, 1750)];
  const result = packLanes(people, 2026);
  expect(result).toEqual([{ person: people[0], lane: 0 }]);
});

test('non-overlapping people share lane 0', () => {
  const people = [
    makePerson('a', 1700, 1750),
    makePerson('b', 1760, 1810),
  ];
  const result = packLanes(people, 2026);
  expect(result[0].lane).toBe(0);
  expect(result[1].lane).toBe(0);
});

test('overlapping people get different lanes', () => {
  const people = [
    makePerson('a', 1700, 1780),
    makePerson('b', 1750, 1830),
  ];
  const result = packLanes(people, 2026);
  expect(result[0].lane).toBe(0);
  expect(result[1].lane).toBe(1);
});

test('living person (died=null) uses currentYear', () => {
  const people = [
    makePerson('a', 1980, null),
    makePerson('b', 1990, null),
  ];
  const result = packLanes(people, 2026);
  expect(result[0].lane).toBe(0);
  expect(result[1].lane).toBe(1);
});

test('three overlapping people get three lanes', () => {
  const people = [
    makePerson('a', 1700, 1800),
    makePerson('b', 1720, 1810),
    makePerson('c', 1740, 1790),
  ];
  const result = packLanes(people, 2026);
  const lanes = result.map((r) => r.lane);
  expect(lanes).toEqual([0, 1, 2]);
});

test('people are sorted by birth year in output', () => {
  const people = [
    makePerson('b', 1800, 1850),
    makePerson('a', 1700, 1750),
  ];
  const result = packLanes(people, 2026);
  expect(result[0].person.id).toBe('a');
  expect(result[1].person.id).toBe('b');
});

test('adds gap between bars in same lane', () => {
  const people = [
    makePerson('a', 1700, 1749),
    makePerson('b', 1750, 1800),
  ];
  const result = packLanes(people, 2026);
  // b starts exactly when a ends — should still fit lane 0 since a ends at 1749
  expect(result[0].lane).toBe(0);
  expect(result[1].lane).toBe(0);
});
```

**Step 2: Run tests to verify failure**

Run: `npm test`

Expected: FAIL.

**Step 3: Implement**

Create `src/layout/packLanes.ts`:

```ts
import type { Person } from '../types';

export interface LaneAssignment {
  person: Person;
  lane: number;
}

export function packLanes(
  people: Person[],
  currentYear: number
): LaneAssignment[] {
  const sorted = [...people].sort((a, b) => a.born - b.born);
  const laneEnds: number[] = []; // tracks the end year of the last person in each lane

  return sorted.map((person) => {
    const endYear = person.died ?? currentYear;

    // find the first lane where this person fits
    let lane = laneEnds.findIndex((end) => end <= person.born);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(endYear);
    } else {
      laneEnds[lane] = endYear;
    }

    return { person, lane };
  });
}
```

**Step 4: Run tests**

Run: `npm test`

Expected: All pass.

**Step 5: Commit**

```bash
git add src/layout/packLanes.ts src/layout/packLanes.test.ts
git commit -m "Implement lane-packing algorithm for timeline bar positioning"
```

---

### Task 7: useOrientation hook

**Files:**
- Create: `src/hooks/useOrientation.ts`
- Test: `src/hooks/useOrientation.test.ts`

**Step 1: Write failing test**

Create `src/hooks/useOrientation.test.ts`:

```ts
import { renderHook, act } from '@testing-library/react';
import { useOrientation } from './useOrientation';

let listeners: Array<(e: { matches: boolean }) => void> = [];
let currentMatches = true;

beforeEach(() => {
  listeners = [];
  currentMatches = true;

  window.matchMedia = vi.fn().mockImplementation(() => ({
    matches: currentMatches,
    addEventListener: (_: string, cb: (e: { matches: boolean }) => void) => {
      listeners.push(cb);
    },
    removeEventListener: (_: string, cb: (e: { matches: boolean }) => void) => {
      listeners = listeners.filter((l) => l !== cb);
    },
  }));
});

test('returns landscape when width > height', () => {
  currentMatches = true;
  window.matchMedia = vi.fn().mockReturnValue({
    matches: true,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  });

  const { result } = renderHook(() => useOrientation());
  expect(result.current).toBe('landscape');
});

test('returns portrait when height > width', () => {
  window.matchMedia = vi.fn().mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  });

  const { result } = renderHook(() => useOrientation());
  expect(result.current).toBe('portrait');
});
```

**Step 2: Run tests to verify failure**

Run: `npm test`

Expected: FAIL.

**Step 3: Implement**

Create `src/hooks/useOrientation.ts`:

```ts
import { useState, useEffect } from 'react';

export type Orientation = 'landscape' | 'portrait';

export function useOrientation(): Orientation {
  const [orientation, setOrientation] = useState<Orientation>(() => {
    if (typeof window === 'undefined') return 'landscape';
    return window.matchMedia('(min-aspect-ratio: 1/1)').matches
      ? 'landscape'
      : 'portrait';
  });

  useEffect(() => {
    const mql = window.matchMedia('(min-aspect-ratio: 1/1)');
    const handler = (e: MediaQueryListEvent) => {
      setOrientation(e.matches ? 'landscape' : 'portrait');
    };
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  return orientation;
}
```

**Step 4: Run tests**

Run: `npm test`

Expected: All pass.

**Step 5: Commit**

```bash
git add src/hooks/useOrientation.ts src/hooks/useOrientation.test.ts
git commit -m "Add useOrientation hook with matchMedia"
```

---

### Task 8: useTimelineScale hook

Manages pixels-per-year, viewport offset, and coordinate conversion.

**Files:**
- Create: `src/hooks/useTimelineScale.ts`
- Test: `src/hooks/useTimelineScale.test.ts`

**Step 1: Write failing tests**

Create `src/hooks/useTimelineScale.test.ts`:

```ts
import { renderHook, act } from '@testing-library/react';
import { useTimelineScale } from './useTimelineScale';

test('yearToPixel converts year to pixel position', () => {
  const { result } = renderHook(() =>
    useTimelineScale({ startYear: 1600, endYear: 2030, containerWidth: 1000 })
  );

  const px1600 = result.current.yearToPixel(1600);
  const px2030 = result.current.yearToPixel(2030);

  expect(px1600).toBe(0);
  expect(px2030).toBeCloseTo(1000, 0);
});

test('yearToPixel scales with zoom', () => {
  const { result } = renderHook(() =>
    useTimelineScale({ startYear: 1600, endYear: 2030, containerWidth: 1000 })
  );

  const before = result.current.yearToPixel(1800);

  act(() => {
    result.current.setZoom(2);
  });

  const after = result.current.yearToPixel(1800);
  expect(after).toBeCloseTo(before * 2, 0);
});

test('totalWidth scales with zoom', () => {
  const { result } = renderHook(() =>
    useTimelineScale({ startYear: 1600, endYear: 2030, containerWidth: 1000 })
  );

  expect(result.current.totalWidth).toBe(1000);

  act(() => {
    result.current.setZoom(3);
  });

  expect(result.current.totalWidth).toBe(3000);
});
```

**Step 2: Run tests to verify failure**

Run: `npm test`

Expected: FAIL.

**Step 3: Implement**

Create `src/hooks/useTimelineScale.ts`:

```ts
import { useState, useCallback, useMemo } from 'react';

interface UseTimelineScaleOptions {
  startYear: number;
  endYear: number;
  containerWidth: number;
}

export function useTimelineScale({
  startYear,
  endYear,
  containerWidth,
}: UseTimelineScaleOptions) {
  const [zoom, setZoom] = useState(1);

  const totalWidth = containerWidth * zoom;
  const pixelsPerYear = totalWidth / (endYear - startYear);

  const yearToPixel = useCallback(
    (year: number) => (year - startYear) * pixelsPerYear,
    [startYear, pixelsPerYear]
  );

  const pixelToYear = useCallback(
    (px: number) => px / pixelsPerYear + startYear,
    [startYear, pixelsPerYear]
  );

  return useMemo(
    () => ({
      zoom,
      setZoom,
      totalWidth,
      pixelsPerYear,
      yearToPixel,
      pixelToYear,
    }),
    [zoom, setZoom, totalWidth, pixelsPerYear, yearToPixel, pixelToYear]
  );
}
```

**Step 4: Run tests**

Run: `npm test`

Expected: All pass.

**Step 5: Commit**

```bash
git add src/hooks/useTimelineScale.ts src/hooks/useTimelineScale.test.ts
git commit -m "Add useTimelineScale hook for zoom and coordinate conversion"
```

---

### Task 9: TimeAxis component

Renders year markers along the bottom of the SVG.

**Files:**
- Create: `src/components/TimeAxis.tsx`
- Test: `src/components/TimeAxis.test.tsx`

**Step 1: Write failing test**

Create `src/components/TimeAxis.test.tsx`:

```tsx
import { render } from '@testing-library/react';
import { TimeAxis } from './TimeAxis';

test('renders year labels', () => {
  const { container } = render(
    <svg>
      <TimeAxis
        startYear={1600}
        endYear={1800}
        yearToPixel={(y) => (y - 1600) * 5}
        y={100}
      />
    </svg>
  );

  const texts = container.querySelectorAll('text');
  const labels = Array.from(texts).map((t) => t.textContent);

  expect(labels).toContain('1600');
  expect(labels).toContain('1700');
  expect(labels).toContain('1800');
});

test('renders tick marks', () => {
  const { container } = render(
    <svg>
      <TimeAxis
        startYear={1600}
        endYear={1800}
        yearToPixel={(y) => (y - 1600) * 5}
        y={100}
      />
    </svg>
  );

  const lines = container.querySelectorAll('line');
  expect(lines.length).toBeGreaterThan(0);
});
```

**Step 2: Run tests to verify failure**

Run: `npm test`

Expected: FAIL.

**Step 3: Implement**

Create `src/components/TimeAxis.tsx`:

```tsx
interface TimeAxisProps {
  startYear: number;
  endYear: number;
  yearToPixel: (year: number) => number;
  y: number;
}

export function TimeAxis({ startYear, endYear, yearToPixel, y }: TimeAxisProps) {
  const interval = getInterval(endYear - startYear);
  const firstTick = Math.ceil(startYear / interval) * interval;
  const ticks: number[] = [];

  for (let year = firstTick; year <= endYear; year += interval) {
    ticks.push(year);
  }

  return (
    <g className="time-axis">
      <line
        x1={yearToPixel(startYear)}
        x2={yearToPixel(endYear)}
        y1={y}
        y2={y}
        stroke="#ccc"
        strokeWidth={1}
      />
      {ticks.map((year) => {
        const x = yearToPixel(year);
        return (
          <g key={year}>
            <line x1={x} x2={x} y1={y} y2={y + 8} stroke="#ccc" strokeWidth={1} />
            <text
              x={x}
              y={y + 22}
              textAnchor="middle"
              fontSize={12}
              fill="#888"
            >
              {year}
            </text>
          </g>
        );
      })}
    </g>
  );
}

function getInterval(range: number): number {
  if (range > 300) return 100;
  if (range > 150) return 50;
  if (range > 60) return 25;
  return 10;
}
```

**Step 4: Run tests**

Run: `npm test`

Expected: All pass.

**Step 5: Commit**

```bash
git add src/components/TimeAxis.tsx src/components/TimeAxis.test.tsx
git commit -m "Add TimeAxis SVG component with year labels and ticks"
```

---

### Task 10: EraBackgrounds component

Renders semi-transparent colored bands for musical eras.

**Files:**
- Create: `src/components/EraBackgrounds.tsx`
- Test: `src/components/EraBackgrounds.test.tsx`

**Step 1: Write failing test**

Create `src/components/EraBackgrounds.test.tsx`:

```tsx
import { render } from '@testing-library/react';
import { EraBackgrounds } from './EraBackgrounds';
import type { Era } from '../types';

const eras: Era[] = [
  { name: 'Baroque', startYear: 1600, endYear: 1750, color: '#E3F2FD' },
  { name: 'Classical', startYear: 1730, endYear: 1820, color: '#FFF3E0' },
];

test('renders a rect for each era', () => {
  const { container } = render(
    <svg>
      <EraBackgrounds
        eras={eras}
        yearToPixel={(y) => (y - 1600) * 2}
        height={400}
      />
    </svg>
  );

  const rects = container.querySelectorAll('rect');
  expect(rects).toHaveLength(2);
});

test('renders era name labels', () => {
  const { container } = render(
    <svg>
      <EraBackgrounds
        eras={eras}
        yearToPixel={(y) => (y - 1600) * 2}
        height={400}
      />
    </svg>
  );

  const texts = container.querySelectorAll('text');
  const labels = Array.from(texts).map((t) => t.textContent);
  expect(labels).toContain('Baroque');
  expect(labels).toContain('Classical');
});
```

**Step 2: Run tests to verify failure**

Run: `npm test`

Expected: FAIL.

**Step 3: Implement**

Create `src/components/EraBackgrounds.tsx`:

```tsx
import type { Era } from '../types';

interface EraBackgroundsProps {
  eras: Era[];
  yearToPixel: (year: number) => number;
  height: number;
}

export function EraBackgrounds({ eras, yearToPixel, height }: EraBackgroundsProps) {
  return (
    <g className="era-backgrounds">
      {eras.map((era) => {
        const x = yearToPixel(era.startYear);
        const width = yearToPixel(era.endYear) - x;

        return (
          <g key={era.name}>
            <rect
              x={x}
              y={0}
              width={width}
              height={height}
              fill={era.color}
              opacity={0.3}
            />
            <text
              x={x + width / 2}
              y={16}
              textAnchor="middle"
              fontSize={11}
              fill="#666"
              fontWeight={600}
            >
              {era.name}
            </text>
          </g>
        );
      })}
    </g>
  );
}
```

**Step 4: Run tests**

Run: `npm test`

Expected: All pass.

**Step 5: Commit**

```bash
git add src/components/EraBackgrounds.tsx src/components/EraBackgrounds.test.tsx
git commit -m "Add EraBackgrounds component for era band rendering"
```

---

### Task 11: PersonBar component

Renders a single person's lifetime bar.

**Files:**
- Create: `src/components/PersonBar.tsx`
- Test: `src/components/PersonBar.test.tsx`

**Step 1: Write failing test**

Create `src/components/PersonBar.test.tsx`:

```tsx
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
  photoUrl: '',
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
      />
    </svg>
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
      />
    </svg>
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
      />
    </svg>
  );

  const group = container.querySelector('g');
  fireEvent.click(group!);
  expect(handleClick).toHaveBeenCalledWith(person);
});
```

**Step 2: Run tests to verify failure**

Run: `npm test`

Expected: FAIL.

**Step 3: Implement**

Create `src/components/PersonBar.tsx`:

```tsx
import type { Person, Role } from '../types';

const ROLE_COLORS: Record<Role, string> = {
  composer: '#4A90D9',
  player: '#E67E22',
  both: '#8E44AD',
};

interface PersonBarProps {
  person: Person;
  x: number;
  width: number;
  y: number;
  height: number;
  highlighted: boolean;
  dimmed: boolean;
  onClick: (person: Person) => void;
  onMouseEnter: (person: Person) => void;
  onMouseLeave: () => void;
}

export function PersonBar({
  person,
  x,
  width,
  y,
  height,
  highlighted,
  dimmed,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: PersonBarProps) {
  const color = ROLE_COLORS[person.role];
  const opacity = dimmed ? 0.3 : 1;
  const strokeWidth = highlighted ? 2 : 0;

  return (
    <g
      className="person-bar"
      style={{ cursor: 'pointer', opacity }}
      onClick={() => onClick(person)}
      onMouseEnter={() => onMouseEnter(person)}
      onMouseLeave={onMouseLeave}
    >
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={4}
        fill={color}
        stroke={highlighted ? '#333' : 'none'}
        strokeWidth={strokeWidth}
      />
      <text
        x={x + 6}
        y={y + height / 2 + 4}
        fontSize={11}
        fill="#fff"
        fontWeight={500}
        clipPath={`inset(0 ${Math.max(0, x + width - (x + 6))}px 0 0)`}
      >
        {person.name}
      </text>
    </g>
  );
}
```

**Step 4: Run tests**

Run: `npm test`

Expected: All pass.

**Step 5: Commit**

```bash
git add src/components/PersonBar.tsx src/components/PersonBar.test.tsx
git commit -m "Add PersonBar component for lifetime bar rendering"
```

---

### Task 12: ConnectionLine component

Renders bezier curves between connected people.

**Files:**
- Create: `src/components/ConnectionLine.tsx`
- Test: `src/components/ConnectionLine.test.tsx`

**Step 1: Write failing test**

Create `src/components/ConnectionLine.test.tsx`:

```tsx
import { render } from '@testing-library/react';
import { ConnectionLine } from './ConnectionLine';

test('renders an SVG path', () => {
  const { container } = render(
    <svg>
      <ConnectionLine
        x1={100}
        y1={50}
        x2={300}
        y2={80}
        type="relative"
        highlighted={false}
        dimmed={false}
      />
    </svg>
  );

  const path = container.querySelector('path');
  expect(path).toBeInTheDocument();
  expect(path?.getAttribute('d')).toContain('M');
  expect(path?.getAttribute('d')).toContain('Q');
});

test('relative connections are solid', () => {
  const { container } = render(
    <svg>
      <ConnectionLine
        x1={100}
        y1={50}
        x2={300}
        y2={80}
        type="relative"
        highlighted={false}
        dimmed={false}
      />
    </svg>
  );

  const path = container.querySelector('path');
  expect(path).not.toHaveAttribute('stroke-dasharray');
});

test('student-teacher connections are dashed', () => {
  const { container } = render(
    <svg>
      <ConnectionLine
        x1={100}
        y1={50}
        x2={300}
        y2={80}
        type="student-teacher"
        highlighted={false}
        dimmed={false}
      />
    </svg>
  );

  const path = container.querySelector('path');
  expect(path?.getAttribute('stroke-dasharray')).toBeTruthy();
});
```

**Step 2: Run tests to verify failure**

Run: `npm test`

Expected: FAIL.

**Step 3: Implement**

Create `src/components/ConnectionLine.tsx`:

```tsx
import type { ConnectionType } from '../types';

const TYPE_STYLES: Record<ConnectionType, { color: string; dash?: string }> = {
  relative: { color: '#E74C3C' },
  'student-teacher': { color: '#3498DB', dash: '6 3' },
};

interface ConnectionLineProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  type: ConnectionType;
  highlighted: boolean;
  dimmed: boolean;
}

export function ConnectionLine({
  x1,
  y1,
  x2,
  y2,
  type,
  highlighted,
  dimmed,
}: ConnectionLineProps) {
  const style = TYPE_STYLES[type];
  const midX = (x1 + x2) / 2;
  const d = `M ${x1} ${y1} Q ${midX} ${y1} ${midX} ${(y1 + y2) / 2} Q ${midX} ${y2} ${x2} ${y2}`;

  return (
    <path
      d={d}
      fill="none"
      stroke={style.color}
      strokeWidth={highlighted ? 2.5 : 1.5}
      strokeDasharray={style.dash}
      opacity={dimmed ? 0.15 : highlighted ? 1 : 0.5}
    />
  );
}
```

**Step 4: Run tests**

Run: `npm test`

Expected: All pass.

**Step 5: Commit**

```bash
git add src/components/ConnectionLine.tsx src/components/ConnectionLine.test.tsx
git commit -m "Add ConnectionLine component with bezier curves"
```

---

### Task 13: Legend component

**Files:**
- Create: `src/components/Legend.tsx`
- Test: `src/components/Legend.test.tsx`

**Step 1: Write failing test**

Create `src/components/Legend.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { Legend } from './Legend';

test('shows connection type labels', () => {
  render(<Legend />);
  expect(screen.getByText('Relative')).toBeInTheDocument();
  expect(screen.getByText('Student/Teacher')).toBeInTheDocument();
});

test('shows role labels', () => {
  render(<Legend />);
  expect(screen.getByText('Composer')).toBeInTheDocument();
  expect(screen.getByText('Player')).toBeInTheDocument();
  expect(screen.getByText('Both')).toBeInTheDocument();
});
```

**Step 2: Run tests to verify failure**

Run: `npm test`

Expected: FAIL.

**Step 3: Implement**

Create `src/components/Legend.tsx`:

```tsx
export function Legend() {
  return (
    <div className="legend">
      <div className="legend-section">
        <span className="legend-line legend-line--relative" />
        <span>Relative</span>
        <span className="legend-line legend-line--student-teacher" />
        <span>Student/Teacher</span>
      </div>
      <div className="legend-section">
        <span className="legend-dot" style={{ backgroundColor: '#4A90D9' }} />
        <span>Composer</span>
        <span className="legend-dot" style={{ backgroundColor: '#E67E22' }} />
        <span>Player</span>
        <span className="legend-dot" style={{ backgroundColor: '#8E44AD' }} />
        <span>Both</span>
      </div>
    </div>
  );
}
```

**Step 4: Run tests**

Run: `npm test`

Expected: All pass.

**Step 5: Commit**

```bash
git add src/components/Legend.tsx src/components/Legend.test.tsx
git commit -m "Add Legend component for connection and role indicators"
```

---

### Task 14: Tooltip component

**Files:**
- Create: `src/components/Tooltip.tsx`
- Test: `src/components/Tooltip.test.tsx`

**Step 1: Write failing test**

Create `src/components/Tooltip.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { Tooltip } from './Tooltip';
import type { Person } from '../types';

const person: Person = {
  id: 'bach',
  name: 'J.S. Bach',
  born: 1685,
  died: 1750,
  role: 'composer',
  bio: '',
  photoUrl: '',
  wikiUrl: '',
  websiteUrl: null,
};

test('renders nothing when person is null', () => {
  const { container } = render(<Tooltip person={null} x={0} y={0} />);
  expect(container.firstChild).toBeNull();
});

test('renders name and years when person is provided', () => {
  render(<Tooltip person={person} x={100} y={50} />);
  expect(screen.getByText('J.S. Bach')).toBeInTheDocument();
  expect(screen.getByText('1685–1750')).toBeInTheDocument();
});

test('shows present for living person', () => {
  const living = { ...person, id: 'll', name: 'Lang Lang', born: 1982, died: null };
  render(<Tooltip person={living} x={100} y={50} />);
  expect(screen.getByText('1982–present')).toBeInTheDocument();
});
```

**Step 2: Run tests to verify failure**

Run: `npm test`

Expected: FAIL.

**Step 3: Implement**

Create `src/components/Tooltip.tsx`:

```tsx
import type { Person } from '../types';

interface TooltipProps {
  person: Person | null;
  x: number;
  y: number;
}

export function Tooltip({ person, x, y }: TooltipProps) {
  if (!person) return null;

  const years = `${person.born}–${person.died ?? 'present'}`;

  return (
    <div
      className="tooltip"
      style={{
        position: 'fixed',
        left: x + 12,
        top: y - 10,
        pointerEvents: 'none',
      }}
    >
      <strong>{person.name}</strong>
      <div>{years}</div>
    </div>
  );
}
```

**Step 4: Run tests**

Run: `npm test`

Expected: All pass.

**Step 5: Commit**

```bash
git add src/components/Tooltip.tsx src/components/Tooltip.test.tsx
git commit -m "Add Tooltip component for hover info"
```

---

### Task 15: PersonPanel component

Slide-in side panel showing person details.

**Files:**
- Create: `src/components/PersonPanel.tsx`
- Test: `src/components/PersonPanel.test.tsx`

**Step 1: Write failing test**

Create `src/components/PersonPanel.test.tsx`:

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { PersonPanel } from './PersonPanel';
import type { Person } from '../types';

const person: Person = {
  id: 'bach',
  name: 'J.S. Bach',
  born: 1685,
  died: 1750,
  role: 'composer',
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
  expect(screen.getByText('1685–1750')).toBeInTheDocument();
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
```

**Step 2: Run tests to verify failure**

Run: `npm test`

Expected: FAIL.

**Step 3: Implement**

Create `src/components/PersonPanel.tsx`:

```tsx
import { useEffect } from 'react';
import type { Person } from '../types';

interface PersonPanelProps {
  person: Person | null;
  onClose: () => void;
}

export function PersonPanel({ person, onClose }: PersonPanelProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  if (!person) return null;

  const years = `${person.born}–${person.died ?? 'present'}`;

  return (
    <div className="person-panel">
      <button className="person-panel__close" onClick={onClose} aria-label="Close">
        &times;
      </button>
      {person.photoUrl && (
        <img
          className="person-panel__photo"
          src={person.photoUrl}
          alt={person.name}
        />
      )}
      <h2>{person.name}</h2>
      <div className="person-panel__years">{years}</div>
      <span className="person-panel__role">{person.role}</span>
      <p className="person-panel__bio">{person.bio}</p>
      <div className="person-panel__links">
        <a href={person.wikiUrl} target="_blank" rel="noopener noreferrer">
          Wikipedia
        </a>
        {person.websiteUrl && (
          <a href={person.websiteUrl} target="_blank" rel="noopener noreferrer">
            Website
          </a>
        )}
      </div>
    </div>
  );
}
```

**Step 4: Run tests**

Run: `npm test`

Expected: All pass.

**Step 5: Commit**

```bash
git add src/components/PersonPanel.tsx src/components/PersonPanel.test.tsx
git commit -m "Add PersonPanel slide-in component with bio and links"
```

---

### Task 16: Header component

**Files:**
- Create: `src/components/Header.tsx`
- Test: `src/components/Header.test.tsx`

**Step 1: Write failing test**

Create `src/components/Header.test.tsx`:

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from './Header';

test('displays instrument name in title', () => {
  render(
    <Header
      instrument="Piano"
      instruments={['piano', 'violin']}
      onInstrumentChange={() => {}}
    />
  );
  expect(screen.getByText('Piano Music Timeline')).toBeInTheDocument();
});

test('displays sponsor link', () => {
  render(
    <Header
      instrument="Piano"
      instruments={['piano']}
      onInstrumentChange={() => {}}
    />
  );
  const link = screen.getByText('Rightkey.app');
  expect(link).toHaveAttribute('href', 'https://rightkey.app');
});

test('renders instrument selector', () => {
  render(
    <Header
      instrument="Piano"
      instruments={['piano', 'violin']}
      onInstrumentChange={() => {}}
    />
  );
  const select = screen.getByRole('combobox');
  expect(select).toBeInTheDocument();
});

test('calls onInstrumentChange when selection changes', () => {
  const onChange = vi.fn();
  render(
    <Header
      instrument="Piano"
      instruments={['piano', 'violin']}
      onInstrumentChange={onChange}
    />
  );
  fireEvent.change(screen.getByRole('combobox'), { target: { value: 'violin' } });
  expect(onChange).toHaveBeenCalledWith('violin');
});
```

**Step 2: Run tests to verify failure**

Run: `npm test`

Expected: FAIL.

**Step 3: Implement**

Create `src/components/Header.tsx`:

```tsx
interface HeaderProps {
  instrument: string;
  instruments: string[];
  onInstrumentChange: (instrument: string) => void;
}

export function Header({ instrument, instruments, onInstrumentChange }: HeaderProps) {
  return (
    <header className="header">
      <div className="header__left">
        <h1 className="header__title">{instrument} Music Timeline</h1>
        <select
          className="header__select"
          value={instrument.toLowerCase()}
          onChange={(e) => onInstrumentChange(e.target.value)}
        >
          {instruments.map((inst) => (
            <option key={inst} value={inst}>
              {inst.charAt(0).toUpperCase() + inst.slice(1)}
            </option>
          ))}
        </select>
      </div>
      <div className="header__right">
        <span>Sponsored by </span>
        <a href="https://rightkey.app" target="_blank" rel="noopener noreferrer">
          Rightkey.app
        </a>
      </div>
    </header>
  );
}
```

**Step 4: Run tests**

Run: `npm test`

Expected: All pass.

**Step 5: Commit**

```bash
git add src/components/Header.tsx src/components/Header.test.tsx
git commit -m "Add Header component with instrument selector and sponsor link"
```

---

### Task 17: TimelineSVG — compose all SVG elements

Assembles EraBackgrounds, TimeAxis, PersonBars, and ConnectionLines into a single SVG.

**Files:**
- Create: `src/components/TimelineSVG.tsx`
- Test: `src/components/TimelineSVG.test.tsx`

**Step 1: Write failing test**

Create `src/components/TimelineSVG.test.tsx`:

```tsx
import { render } from '@testing-library/react';
import { TimelineSVG } from './TimelineSVG';
import type { InstrumentData } from '../types';

const data: InstrumentData = {
  instrument: 'Piano',
  eras: [{ name: 'Baroque', startYear: 1600, endYear: 1750, color: '#E3F2FD' }],
  people: [
    {
      id: 'bach',
      name: 'J.S. Bach',
      born: 1685,
      died: 1750,
      role: 'composer',
      bio: '',
      photoUrl: '',
      wikiUrl: '',
      websiteUrl: null,
    },
    {
      id: 'cpe-bach',
      name: 'C.P.E. Bach',
      born: 1714,
      died: 1788,
      role: 'composer',
      bio: '',
      photoUrl: '',
      wikiUrl: '',
      websiteUrl: null,
    },
  ],
  connections: [{ from: 'bach', to: 'cpe-bach', type: 'relative', label: 'father/son' }],
};

test('renders an SVG element', () => {
  const { container } = render(
    <TimelineSVG
      data={data}
      yearToPixel={(y) => (y - 1600) * 2}
      totalWidth={860}
      selectedPersonId={null}
      hoveredPersonId={null}
      onPersonClick={() => {}}
      onPersonMouseEnter={() => {}}
      onPersonMouseLeave={() => {}}
    />
  );

  expect(container.querySelector('svg')).toBeInTheDocument();
});

test('renders person bars', () => {
  const { container } = render(
    <TimelineSVG
      data={data}
      yearToPixel={(y) => (y - 1600) * 2}
      totalWidth={860}
      selectedPersonId={null}
      hoveredPersonId={null}
      onPersonClick={() => {}}
      onPersonMouseEnter={() => {}}
      onPersonMouseLeave={() => {}}
    />
  );

  const bars = container.querySelectorAll('.person-bar');
  expect(bars).toHaveLength(2);
});

test('renders connection lines', () => {
  const { container } = render(
    <TimelineSVG
      data={data}
      yearToPixel={(y) => (y - 1600) * 2}
      totalWidth={860}
      selectedPersonId={null}
      hoveredPersonId={null}
      onPersonClick={() => {}}
      onPersonMouseEnter={() => {}}
      onPersonMouseLeave={() => {}}
    />
  );

  const paths = container.querySelectorAll('path');
  expect(paths.length).toBeGreaterThanOrEqual(1);
});
```

**Step 2: Run tests to verify failure**

Run: `npm test`

Expected: FAIL.

**Step 3: Implement**

Create `src/components/TimelineSVG.tsx`:

```tsx
import { useMemo } from 'react';
import type { InstrumentData, Person } from '../types';
import { packLanes } from '../layout/packLanes';
import { EraBackgrounds } from './EraBackgrounds';
import { TimeAxis } from './TimeAxis';
import { PersonBar } from './PersonBar';
import { ConnectionLine } from './ConnectionLine';

const BAR_HEIGHT = 24;
const LANE_GAP = 6;
const TOP_PADDING = 30;
const BOTTOM_PADDING = 40;
const CURRENT_YEAR = new Date().getFullYear();

interface TimelineSVGProps {
  data: InstrumentData;
  yearToPixel: (year: number) => number;
  totalWidth: number;
  selectedPersonId: string | null;
  hoveredPersonId: string | null;
  onPersonClick: (person: Person) => void;
  onPersonMouseEnter: (person: Person) => void;
  onPersonMouseLeave: () => void;
}

export function TimelineSVG({
  data,
  yearToPixel,
  totalWidth,
  selectedPersonId,
  hoveredPersonId,
  onPersonClick,
  onPersonMouseEnter,
  onPersonMouseLeave,
}: TimelineSVGProps) {
  const laneAssignments = useMemo(
    () => packLanes(data.people, CURRENT_YEAR),
    [data.people]
  );

  const laneCount = Math.max(0, ...laneAssignments.map((a) => a.lane)) + 1;
  const contentHeight = laneCount * (BAR_HEIGHT + LANE_GAP);
  const svgHeight = TOP_PADDING + contentHeight + BOTTOM_PADDING;

  const personPositions = useMemo(() => {
    const map = new Map<string, { x: number; width: number; y: number }>();
    for (const { person, lane } of laneAssignments) {
      const x = yearToPixel(person.born);
      const endX = yearToPixel(person.died ?? CURRENT_YEAR);
      const y = TOP_PADDING + lane * (BAR_HEIGHT + LANE_GAP);
      map.set(person.id, { x, width: endX - x, y });
    }
    return map;
  }, [laneAssignments, yearToPixel]);

  const connectedIds = useMemo(() => {
    const active = selectedPersonId ?? hoveredPersonId;
    if (!active) return new Set<string>();
    const ids = new Set<string>([active]);
    for (const conn of data.connections) {
      if (conn.from === active || conn.to === active) {
        ids.add(conn.from);
        ids.add(conn.to);
      }
    }
    return ids;
  }, [selectedPersonId, hoveredPersonId, data.connections]);

  const hasActive = connectedIds.size > 0;
  const startYear = Math.min(...data.eras.map((e) => e.startYear), ...data.people.map((p) => p.born));
  const endYear = Math.max(...data.eras.map((e) => e.endYear), CURRENT_YEAR);

  return (
    <svg width={totalWidth} height={svgHeight}>
      <EraBackgrounds
        eras={data.eras}
        yearToPixel={yearToPixel}
        height={TOP_PADDING + contentHeight}
      />

      {data.connections.map((conn, i) => {
        const fromPos = personPositions.get(conn.from);
        const toPos = personPositions.get(conn.to);
        if (!fromPos || !toPos) return null;

        const isHighlighted =
          hasActive && connectedIds.has(conn.from) && connectedIds.has(conn.to);

        return (
          <ConnectionLine
            key={i}
            x1={fromPos.x + fromPos.width / 2}
            y1={fromPos.y + BAR_HEIGHT / 2}
            x2={toPos.x + toPos.width / 2}
            y2={toPos.y + BAR_HEIGHT / 2}
            type={conn.type}
            highlighted={isHighlighted}
            dimmed={hasActive && !isHighlighted}
          />
        );
      })}

      {laneAssignments.map(({ person }) => {
        const pos = personPositions.get(person.id)!;
        return (
          <PersonBar
            key={person.id}
            person={person}
            x={pos.x}
            width={pos.width}
            y={pos.y}
            height={BAR_HEIGHT}
            highlighted={connectedIds.has(person.id)}
            dimmed={hasActive && !connectedIds.has(person.id)}
            onClick={onPersonClick}
            onMouseEnter={onPersonMouseEnter}
            onMouseLeave={onPersonMouseLeave}
          />
        );
      })}

      <TimeAxis
        startYear={startYear}
        endYear={endYear}
        yearToPixel={yearToPixel}
        y={TOP_PADDING + contentHeight + 4}
      />
    </svg>
  );
}
```

**Step 4: Run tests**

Run: `npm test`

Expected: All pass.

**Step 5: Commit**

```bash
git add src/components/TimelineSVG.tsx src/components/TimelineSVG.test.tsx
git commit -m "Add TimelineSVG composing eras, bars, connections, and axis"
```

---

### Task 18: TimelineView — scrollable container with zoom

**Files:**
- Create: `src/components/TimelineView.tsx`
- Test: `src/components/TimelineView.test.tsx`

**Step 1: Write failing test**

Create `src/components/TimelineView.test.tsx`:

```tsx
import { render } from '@testing-library/react';
import { TimelineView } from './TimelineView';
import type { InstrumentData } from '../types';

const data: InstrumentData = {
  instrument: 'Piano',
  eras: [{ name: 'Baroque', startYear: 1600, endYear: 1750, color: '#E3F2FD' }],
  people: [
    {
      id: 'bach',
      name: 'J.S. Bach',
      born: 1685,
      died: 1750,
      role: 'composer',
      bio: '',
      photoUrl: '',
      wikiUrl: '',
      websiteUrl: null,
    },
  ],
  connections: [],
};

test('renders a scrollable container with the SVG', () => {
  const { container } = render(
    <TimelineView
      data={data}
      selectedPersonId={null}
      hoveredPersonId={null}
      onPersonClick={() => {}}
      onPersonMouseEnter={() => {}}
      onPersonMouseLeave={() => {}}
    />
  );

  expect(container.querySelector('.timeline-view')).toBeInTheDocument();
  expect(container.querySelector('svg')).toBeInTheDocument();
});
```

**Step 2: Run tests to verify failure**

Run: `npm test`

Expected: FAIL.

**Step 3: Implement**

Create `src/components/TimelineView.tsx`:

```tsx
import { useRef, useCallback } from 'react';
import type { InstrumentData, Person } from '../types';
import { useTimelineScale } from '../hooks/useTimelineScale';
import { TimelineSVG } from './TimelineSVG';

interface TimelineViewProps {
  data: InstrumentData;
  selectedPersonId: string | null;
  hoveredPersonId: string | null;
  onPersonClick: (person: Person) => void;
  onPersonMouseEnter: (person: Person) => void;
  onPersonMouseLeave: () => void;
}

export function TimelineView({
  data,
  selectedPersonId,
  hoveredPersonId,
  onPersonClick,
  onPersonMouseEnter,
  onPersonMouseLeave,
}: TimelineViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const startYear = Math.min(
    ...data.eras.map((e) => e.startYear),
    ...data.people.map((p) => p.born)
  );
  const endYear = Math.max(
    ...data.eras.map((e) => e.endYear),
    new Date().getFullYear()
  );

  const containerWidth = 1200;

  const { yearToPixel, totalWidth, zoom, setZoom } = useTimelineScale({
    startYear,
    endYear,
    containerWidth,
  });

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        setZoom((z: number) => Math.max(0.5, Math.min(10, z * delta)));
      }
    },
    [setZoom]
  );

  return (
    <div
      className="timeline-view"
      ref={containerRef}
      onWheel={handleWheel}
    >
      <TimelineSVG
        data={data}
        yearToPixel={yearToPixel}
        totalWidth={totalWidth}
        selectedPersonId={selectedPersonId}
        hoveredPersonId={hoveredPersonId}
        onPersonClick={onPersonClick}
        onPersonMouseEnter={onPersonMouseEnter}
        onPersonMouseLeave={onPersonMouseLeave}
      />
    </div>
  );
}
```

**Step 4: Run tests**

Run: `npm test`

Expected: All pass.

**Step 5: Commit**

```bash
git add src/components/TimelineView.tsx src/components/TimelineView.test.tsx
git commit -m "Add TimelineView scrollable container with zoom"
```

---

### Task 19: Wire up App with all components

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/App.test.tsx`

**Step 1: Update App test**

Replace `src/App.test.tsx`:

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import App from './App';
import type { InstrumentData } from './types';

const mockData: InstrumentData = {
  instrument: 'Piano',
  eras: [{ name: 'Baroque', startYear: 1600, endYear: 1750, color: '#E3F2FD' }],
  people: [
    {
      id: 'bach',
      name: 'J.S. Bach',
      born: 1685,
      died: 1750,
      role: 'composer',
      bio: 'A composer.',
      photoUrl: '',
      wikiUrl: '',
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

**Step 2: Run tests to verify failure**

Run: `npm test`

Expected: FAIL (App still renders placeholder).

**Step 3: Implement App**

Replace `src/App.tsx`:

```tsx
import { useState, useCallback } from 'react';
import { useInstrumentData } from './hooks/useInstrumentData';
import { Header } from './components/Header';
import { TimelineView } from './components/TimelineView';
import { Legend } from './components/Legend';
import { PersonPanel } from './components/PersonPanel';
import { Tooltip } from './components/Tooltip';
import type { Person } from './types';

const INSTRUMENTS = ['piano'];

function App() {
  const [instrument, setInstrument] = useState('piano');
  const { data, loading, error } = useInstrumentData(instrument);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [hoveredPerson, setHoveredPerson] = useState<Person | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const handlePersonClick = useCallback((person: Person) => {
    setSelectedPerson((prev) => (prev?.id === person.id ? null : person));
  }, []);

  const handlePersonMouseEnter = useCallback((person: Person) => {
    setHoveredPerson(person);
  }, []);

  const handlePersonMouseLeave = useCallback(() => {
    setHoveredPerson(null);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setTooltipPos({ x: e.clientX, y: e.clientY });
  }, []);

  if (loading) return <div className="loading">Loading...</div>;
  if (error || !data) return <div className="error">Failed to load data: {error}</div>;

  return (
    <div className="app" onMouseMove={handleMouseMove}>
      <Header
        instrument={data.instrument}
        instruments={INSTRUMENTS}
        onInstrumentChange={setInstrument}
      />
      <TimelineView
        data={data}
        selectedPersonId={selectedPerson?.id ?? null}
        hoveredPersonId={hoveredPerson?.id ?? null}
        onPersonClick={handlePersonClick}
        onPersonMouseEnter={handlePersonMouseEnter}
        onPersonMouseLeave={handlePersonMouseLeave}
      />
      <Legend />
      <footer className="footer">
        To suggest edits or propose fixes, visit{' '}
        <a
          href="https://github.com/pmatos/music-timeline/issues"
          target="_blank"
          rel="noopener noreferrer"
        >
          github.com/pmatos/music-timeline/issues
        </a>
      </footer>
      <Tooltip person={hoveredPerson} x={tooltipPos.x} y={tooltipPos.y} />
      <PersonPanel person={selectedPerson} onClose={() => setSelectedPerson(null)} />
    </div>
  );
}

export default App;
```

**Step 4: Run tests**

Run: `npm test`

Expected: All pass.

**Step 5: Commit**

```bash
git add src/App.tsx src/App.test.tsx
git commit -m "Wire up App with all components, footer, and interactivity"
```

---

### Task 20: Styling — modern minimal theme

**Files:**
- Modify: `src/index.css`

**Step 1: Implement all styles**

Replace `src/index.css` with the full stylesheet. This is a single CSS file covering:

- Base reset and font (system sans-serif, `Inter` if available)
- `.app` layout: flex column, full viewport
- `.header`: flex row, justify-between, border-bottom
- `.header__title`: bold, large
- `.header__select`: styled native select
- `.timeline-view`: overflow-x auto, flex-grow
- `.legend`: flex row, small text, gap spacing
- `.legend-line`, `.legend-dot`: small colored indicators
- `.person-panel`: fixed right, slide-in with CSS transition, white background, box-shadow, max-width 360px
- `.person-panel__photo`: rounded, max-width 100%
- `.person-panel__role`: pill badge
- `.tooltip`: small card, background white, box-shadow, border-radius, z-index
- `.footer`: text-center, small muted text, padding, border-top
- `.loading`, `.error`: centered messages

Key colors:
- Background: `#ffffff`
- Text: `#333`
- Muted text: `#888`
- Composer bars: `#4A90D9`
- Player bars: `#E67E22`
- Both bars: `#8E44AD`
- Relative connection: `#E74C3C`
- Student/teacher connection: `#3498DB`

**Step 2: Verify build**

Run:
```bash
npm run build
```

Expected: Successful build.

**Step 3: Visual check**

Run:
```bash
npm run dev
```

Open in browser, verify the layout looks correct with the piano data.

**Step 4: Commit**

```bash
git add src/index.css
git commit -m "Add modern minimal theme styles"
```

---

### Task 21: GitHub Actions deployment workflow

**Files:**
- Create: `.github/workflows/deploy.yml`

**Step 1: Create the workflow**

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - run: npm ci
      - run: npm run build

      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

      - id: deployment
        uses: actions/deploy-pages@v4
```

**Step 2: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "Add GitHub Actions workflow for Pages deployment"
```

---

### Task 22: Create GitHub repository and push

**Step 1: Create the repository on GitHub**

Use the GitHub MCP `create_repository` tool to create `pmatos/music-timeline` as a public repository with description "Interactive music timeline of composers and players — rightkey.app".

**Step 2: Add remote and push**

```bash
git remote add origin git@github.com:pmatos/music-timeline.git
git push -u origin main
```

**Step 3: Enable GitHub Pages**

In the GitHub repository settings, set Pages source to "GitHub Actions".

**Step 4: Verify deployment**

After the action completes, verify the site loads at `https://pmatos.github.io/music-timeline/`.

---

### Task 23: Final integration test

**Step 1: Run full test suite**

Run:
```bash
npm test
```

Expected: All tests pass.

**Step 2: Run build**

Run:
```bash
npm run build
```

Expected: Clean build, no errors.

**Step 3: Manual browser check**

Run:
```bash
npm run dev
```

Verify:
- [ ] Header shows "Piano Music Timeline" and sponsor link
- [ ] Instrument selector dropdown works
- [ ] Era bands render with labels
- [ ] Person bars render with correct colors
- [ ] Connection curves visible with color coding
- [ ] Hovering a bar shows tooltip
- [ ] Clicking a bar opens side panel with bio
- [ ] Escape closes the panel
- [ ] Ctrl+wheel zooms
- [ ] Horizontal scroll works
- [ ] Legend shows role and connection types
- [ ] Footer shows GitHub issues link
