# Marketing Video Design — musiker.page

## Overview

A 30-60 second marketing video for social media (X/Twitter, YouTube) showcasing musiker.page. Built with Remotion using real app screenshots captured via browser automation, composed with Ken Burns pan/zoom animations and bold text overlays.

**Tone:** Energetic & modern
**Approach:** Static screenshot montage with animated motion and text

## Scene Breakdown (~45s at 30fps)

| # | Scene | Duration | Screenshot | Text Overlay | Motion |
|---|-------|----------|------------|--------------|--------|
| 1 | Hook | 3s | Full piano timeline, zoomed out | "500 years of music." | Quick zoom-in |
| 2 | The Timeline | 5s | Piano at medium zoom, Baroque→Classical | "Every composer. Every performer. One timeline." | Slow pan L→R |
| 3 | Connections | 6s | Bach selected, connections highlighted | "Trace who taught whom." | Pan following connection |
| 4 | Person Panel | 5s | Bach PersonPanel open | "Dive into the details." | Zoom into panel |
| 5 | Color Coding | 4s | Mix of blue/orange/purple bars | "Composers. Performers. Both." | Quick pan across bars |
| 6 | Switch Instrument | 5s | Violin timeline | "Switch instruments. New stories." | Slide transition |
| 7 | Trombone | 4s | Trombone timeline | "Piano. Violin. Trombone." | Ken Burns slow zoom |
| 8 | Eras | 4s | Colored era bands with labels | "From Baroque to Contemporary." | Slow pan across eras |
| 9 | CTA | 5s | Clean app shot + logo | "Explore the history of music." + musiker.page | Fade to centered URL |

## Audio

Backing track generated via ElevenLabs with prompt:

> Upbeat modern electronic track with classical music influences. Driving tempo around 120 BPM, energetic but sophisticated. Blend of clean synth pads, light piano arpeggios, and a punchy rhythmic backbone. Bright, optimistic, and polished — suitable for a tech product showcase or app demo video. 45 seconds. No vocals.

## Technical Specs

- **Resolution:** 1920x1080 (landscape)
- **FPS:** 30
- **Duration:** ~45s (1350 frames)
- **Fonts:** Cormorant Garamond (display) + Karla (body) — matching the app

## Project Structure

```
video/
├── package.json
├── src/
│   ├── Root.tsx              # Registers composition
│   ├── MarketingVideo.tsx    # Main composition (sequences all scenes)
│   ├── scenes/
│   │   ├── HookScene.tsx
│   │   ├── TimelineScene.tsx
│   │   ├── ConnectionsScene.tsx
│   │   ├── PersonPanelScene.tsx
│   │   ├── ColorCodingScene.tsx
│   │   ├── InstrumentSwitchScene.tsx
│   │   ├── TromboneScene.tsx
│   │   ├── ErasScene.tsx
│   │   └── CTAScene.tsx
│   ├── components/
│   │   ├── TextOverlay.tsx   # Animated bold text
│   │   ├── KenBurns.tsx      # Pan/zoom over images
│   │   └── SlideTransition.tsx
│   ├── assets/
│   │   ├── screenshots/      # Captured PNGs from browser automation
│   │   └── audio/            # ElevenLabs backing track
│   └── constants.ts          # Timing, colors, fonts
```

## Screenshot Capture Plan

Using Chrome MCP browser automation on musiker.page:

| # | Filename | App State |
|---|----------|-----------|
| 1 | piano-full.png | Piano, zoomed out, nothing selected |
| 2 | piano-medium.png | Piano, medium zoom, Baroque-Classical area |
| 3 | bach-connections.png | Piano, Bach selected (connections highlighted) |
| 4 | bach-panel.png | Piano, Bach PersonPanel open |
| 5 | color-mix.png | Piano, zoomed in on blue/orange/purple bars |
| 6 | violin-full.png | Violin, zoomed out |
| 7 | trombone-full.png | Trombone, zoomed out |
| 8 | eras-zoom.png | Piano, zoomed to show era bands clearly |
| 9 | hero-clean.png | Piano, clean shot for CTA background |

## Key Components

- **KenBurns:** Uses Remotion's `interpolate()` + `spring()` for smooth pan/zoom over static images
- **TextOverlay:** Scale + opacity entrance/exit animations for bold text callouts
- **SlideTransition:** Horizontal slide between scene screenshots
- Each scene is a Remotion `<Sequence>` with defined start frame and duration
