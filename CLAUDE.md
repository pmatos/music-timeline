# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start Vite dev server
npm run build        # TypeScript check + Vite production build
npm run lint         # ESLint
npm test             # Run all tests (vitest run)
npm run test:watch   # Watch mode
npx vitest run src/hooks/useInstrumentData.test.ts  # Single test file
```

Tests use vitest with jsdom environment and `globals: true` (no need to import `describe`/`test`/`expect`). Setup file at `src/setupTests.ts` loads `@testing-library/jest-dom/vitest`.

## Architecture

Static site deployed to **musiker.page** via GitHub Actions on push to `main`. Displays an interactive SVG timeline of composers/players per instrument.

### Split Data Model

Data lives in `public/data/` as three concerns:

- **`people.json`** — flat array of all `Person` objects (shared across instruments)
- **`connections.json`** — flat array of all `Connection` objects (shared across instruments)
- **`<instrument>.json`** (e.g. `piano.json`, `violin.json`) — `InstrumentConfig` with `instrument` name, `eras` array, and `peopleIds` string array referencing people by ID

The `useInstrumentData` hook fetches all three, caches people/connections in a `useRef`, filters people and connections by the instrument's `peopleIds` set, and returns a merged `InstrumentData` object. Downstream components only see `InstrumentData` — they don't know about the split.

To add a new instrument: create `public/data/<name>.json` with eras and peopleIds, add new people to `people.json` if needed, and add `'<name>'` to the `INSTRUMENTS` array in `App.tsx`.

### Rendering Pipeline

`App` → `TimelineView` (scrollable container with zoom) → `TimelineSVG` (the SVG):
1. `packLanes()` assigns each person to the first non-overlapping lane (greedy, sorted by birth year)
2. `EraBackgrounds` renders semi-transparent colored bands
3. `ConnectionLine` renders bezier curves between connected people
4. `PersonBar` renders lifetime bars color-coded by role (`composer`/`player`/`both`)
5. `TimeAxis` renders year markers at the bottom

Selection/hover state flows down from `App`. Clicking a person opens `PersonPanel` (slide-in detail panel); hovering shows `Tooltip`.

### Responsive Behavior

`useOrientation` hook checks `matchMedia('(min-aspect-ratio: 1/1)')` — landscape uses horizontal time axis, portrait uses vertical. `useTimelineScale` converts between years and pixels with zoom support.

### Styling

Plain CSS with BEM naming (e.g. `.person-panel__close`, `.header__title`). CSS custom properties defined in `src/index.css` for colors (`--ink`, `--accent`, `--bg`, etc.) and fonts (`--font-display`: Cormorant Garamond, `--font-body`: Karla).

## Data Integrity

Every ID in an instrument's `peopleIds` must exist in `people.json`. Every `from`/`to` in `connections.json` must reference a valid person ID. The download script at `scripts/download-portraits.mjs` fetches Wikipedia thumbnail portraits for people whose `photoUrl` points to a local path but the file doesn't exist on disk.

## Vite Base Path

`vite.config.ts` sets `base: '/'` for the custom domain (musiker.page). The `useInstrumentData` hook uses `import.meta.env.BASE_URL` to prefix data fetch URLs.
