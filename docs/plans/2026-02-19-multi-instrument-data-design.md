# Multi-Instrument Data Design

## Problem

Adding violin (and future instruments) to the timeline would duplicate person data (name, born, died, bio, photo, URLs) and connections across per-instrument JSON files. This causes data drift risk and maintenance burden.

## Decision

Split the monolithic per-instrument JSON into three concerns:

1. **`people.json`** — global person data (shared across instruments)
2. **`connections.json`** — global connections between people
3. **`<instrument>.json`** — per-instrument curation: eras + list of people IDs

## Constraints

- Person data (id, name, born, died, role, bio, photoUrl, wikiUrl, websiteUrl) is identical across instruments
- Connections are global facts (relative, student-teacher) — not instrument-specific
- Only the selection of people and eras varies per instrument

## Data File Structure

### `public/data/people.json`

Flat array of all people:

```json
[
  {
    "id": "bach",
    "name": "J.S. Bach",
    "born": 1685,
    "died": 1750,
    "role": "both",
    "bio": "German composer and musician...",
    "photoUrl": "/images/portraits/bach.jpg",
    "wikiUrl": "https://en.wikipedia.org/wiki/Johann_Sebastian_Bach",
    "websiteUrl": null
  }
]
```

### `public/data/connections.json`

Flat array of all connections:

```json
[
  { "from": "bach", "to": "cpe-bach", "type": "relative", "label": "father/son" }
]
```

### `public/data/piano.json` (per-instrument)

```json
{
  "instrument": "Piano",
  "eras": [
    { "name": "Baroque", "startYear": 1600, "endYear": 1750, "color": "#E3F2FD" }
  ],
  "peopleIds": ["bach", "beethoven", "chopin"]
}
```

### `public/data/violin.json` (new)

Same structure with violin-specific eras and people IDs.

## Type Changes

New type for per-instrument config files:

```typescript
export interface InstrumentConfig {
  instrument: string;
  eras: Era[];
  peopleIds: string[];
}
```

`InstrumentData` (the merged result) remains unchanged — components don't need modification.

## Hook Changes

`useInstrumentData` updated to:

1. Fetch `people.json`, `connections.json`, and `<instrument>.json` in parallel
2. Cache people and connections (they're shared across instruments)
3. Build a `Set` from the instrument's `peopleIds`
4. Filter people to only those in the set
5. Filter connections to only those where both `from` and `to` are in the set
6. Return merged `InstrumentData`

Switching instruments only requires fetching the new instrument config — people and connections are already cached.

## Migration

1. Extract people array from current `piano.json` → `people.json`
2. Extract connections array from current `piano.json` → `connections.json`
3. Replace `piano.json` with `{ instrument, eras, peopleIds }`
4. Create `violin.json` with violin-specific eras and people IDs
5. Update `INSTRUMENTS` in `App.tsx` to include `'violin'`
6. Update tests
