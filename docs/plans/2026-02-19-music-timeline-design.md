# Music Timeline — Design Document

A static GitHub Pages site promoting rightkey.app. Displays an interactive SVG timeline of composers and players per instrument.

## Data Model

Per-instrument JSON files (`data/piano.json`, `data/violin.json`, etc.) with this structure:

```json
{
  "instrument": "Piano",
  "eras": [
    { "name": "Baroque", "startYear": 1600, "endYear": 1750, "color": "#E3F2FD" }
  ],
  "people": [
    {
      "id": "bach",
      "name": "J.S. Bach",
      "born": 1685,
      "died": 1750,
      "role": "composer",
      "bio": "German composer and musician of the late Baroque period...",
      "photoUrl": "/images/piano/bach.jpg",
      "wikiUrl": "https://en.wikipedia.org/wiki/Johann_Sebastian_Bach",
      "websiteUrl": null
    }
  ],
  "connections": [
    { "from": "bach", "to": "cpe-bach", "type": "relative", "label": "father/son" },
    { "from": "beethoven", "to": "czerny", "type": "student-teacher" }
  ]
}
```

- `role`: `"composer"`, `"player"`, or `"both"` — determines bar color.
- `died`: `null` for living people (bar extends to current year).
- `websiteUrl`: for modern artists' personal/streaming pages.
- `photoUrl`: local paths (`/images/...`) or full Wikimedia URLs.
- Eras can overlap — they render as background bands, not strict categories.

## Tech Stack

- React 19 + TypeScript
- Vite for build/dev
- Custom CSS (no UI library)
- Custom SVG rendering (no chart libraries)
- GitHub Actions deploys `dist/` to GitHub Pages on push to `main`

## Project Structure

```
music-timeline/
├── public/
│   └── images/
│       └── piano/
├── data/
│   └── piano.json
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── TimelineView.tsx
│   │   ├── TimelineSVG.tsx
│   │   ├── EraBackgrounds.tsx
│   │   ├── TimeAxis.tsx
│   │   ├── PersonBar.tsx
│   │   ├── ConnectionLine.tsx
│   │   ├── Legend.tsx
│   │   ├── PersonPanel.tsx
│   │   └── Tooltip.tsx
│   ├── hooks/
│   │   ├── useTimelineScale.ts
│   │   └── useOrientation.ts
│   ├── types.ts
│   └── index.css
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## UI Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Piano Music Timeline              Sponsored by Rightkey.app │
│  [Piano ▾]                                                   │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────┬──────────┬───────────┬──────────┬────────────┐ │
│  │ Baroque │ Classical│ Romantic  │ Modern   │Contemporary│ │
│  ├─────────┴──────────┴───────────┴──────────┴────────────┤ │
│  │  ██ Bach ██████████                                     │ │
│  │          ██ C.P.E. Bach ███████                         │ │
│  │              ╰─── relative ───╯                         │ │
│  │                  ██ Mozart ██████                        │ │
│  │                     ██ Beethoven █████████               │ │
│  │  ...                                                    │ │
│  ├─────────────────────────────────────────────────────────┤ │
│  │  1600    1700    1800    1900    2000          ──► year  │ │
│  └─────────────────────────────────────────────────────────┘ │
│  Legend: ── relative  ╌╌ student/teacher                     │
│          ■ composer  ■ player  ■ both                        │
├─────────────────────────────────────────────────────────────┤
│  To suggest edits or propose fixes, visit                    │
│  github.com/pmatos/music-timeline/issues                     │
└─────────────────────────────────────────────────────────────┘
```

### Header

- Left: "[Instrument] Music Timeline"
- Below: instrument selector dropdown
- Top right: "Sponsored by Rightkey.app" linking to https://rightkey.app

### Timeline

- Scrollable container with zoom (ctrl+wheel / pinch) and pan (drag / wheel)
- SVG-rendered: era bands, person bars, connection curves, time axis
- Mini-map or scroll indicator showing viewport position

### Era Bands

- Semi-transparent colored vertical bands behind person bars
- Era name labels at the top of each band
- Overlapping eras blend colors

### Person Bars

- Horizontal bars (landscape) or vertical bars (portrait) representing lifetimes
- Color-coded by role: composer, player, both
- Lane-packing algorithm assigns each person to the first lane without overlap

### Connection Lines

- SVG quadratic bezier curves between midpoints of connected bars
- Color-coded: solid for relatives, dashed for student/teacher
- Legend in corner explains the coding

### Person Panel

- Slides in from the right on click
- Shows: photo, full name, birth-death years, role badge, bio, Wikipedia link, optional website link
- Closes on outside click or Escape
- Selected person's connections highlight (brighter/thicker), others dim

### Tooltip

- On hover: lightweight tooltip with name + years

### Footer

- "To suggest edits or propose fixes, visit github.com/pmatos/music-timeline/issues"
- Subtle styling: small font, muted gray

## Responsive Behavior

- Landscape: timeline scrolls horizontally (time = x-axis), people stacked vertically
- Portrait: timeline scrolls vertically (time = y-axis), people stacked horizontally
- Switched via `matchMedia` aspect-ratio check in `useOrientation` hook

## Theme

Modern minimal: white background, bold flat colors for bars (categorized by era or role), clean sans-serif typography.

## Images

- Key figures: stored in `public/images/<instrument>/` in the repo
- Others: Wikimedia Commons URLs referenced in JSON

## Deployment

GitHub Actions workflow: on push to `main`, run `vite build`, deploy `dist/` to GitHub Pages.
