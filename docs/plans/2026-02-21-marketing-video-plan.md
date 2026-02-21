# Marketing Video Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a 45-second Remotion marketing video for musiker.page using real app screenshots with Ken Burns animations and bold text overlays.

**Architecture:** Separate `video/` directory with its own Remotion project. Screenshots captured via Chrome MCP browser automation are placed in `video/public/screenshots/`. A `TransitionSeries` sequences 9 scenes with fade/slide transitions. Each scene is a component that wraps a `KenBurns` image with a `TextOverlay`.

**Tech Stack:** Remotion 4.x, React, TypeScript, `@remotion/transitions`, `@remotion/media`, `@remotion/google-fonts`

---

### Task 1: Scaffold Remotion Project

**Files:**
- Create: `video/` (entire Remotion scaffold)

**Step 1: Create the Remotion project**

Run:
```bash
cd /home/pmatos/dev/music-timeline && npx create-video@latest video --template blank
```

Select TypeScript when prompted. If `create-video` doesn't support `--template`, just use defaults and we'll replace files.

**Step 2: Install additional dependencies**

Run:
```bash
cd /home/pmatos/dev/music-timeline/video && npx remotion add @remotion/transitions && npx remotion add @remotion/media && npx remotion add @remotion/google-fonts
```

**Step 3: Verify it runs**

Run:
```bash
cd /home/pmatos/dev/music-timeline/video && npx remotion studio
```

Expected: Remotion Studio opens in browser. Close it after verifying.

**Step 4: Commit**

```bash
git add video/
git commit -m "Scaffold Remotion project for marketing video"
```

---

### Task 2: Capture Screenshots via Browser Automation

**Files:**
- Create: `video/public/screenshots/` (9 PNG files)

Use the Chrome MCP browser automation tools to capture screenshots from the live site at `https://musiker.page`.

**Step 1: Navigate to musiker.page and capture piano-full.png**

- Navigate to `https://musiker.page`
- Wait for page load
- Take screenshot → save as `video/public/screenshots/piano-full.png`

**Step 2: Capture piano-medium.png**

- Scroll/zoom to show the Baroque-Classical transition area at medium zoom
- Take screenshot → `video/public/screenshots/piano-medium.png`

**Step 3: Capture bach-connections.png**

- Click on J.S. Bach in the piano timeline
- Wait for connections to highlight
- Take screenshot → `video/public/screenshots/bach-connections.png`

**Step 4: Capture bach-panel.png**

- With Bach selected, ensure PersonPanel is open
- Take screenshot → `video/public/screenshots/bach-panel.png`

**Step 5: Capture color-mix.png**

- Close panel, zoom in to an area with blue/orange/purple bars visible
- Take screenshot → `video/public/screenshots/color-mix.png`

**Step 6: Capture violin-full.png**

- Switch instrument dropdown to "Violin"
- Wait for timeline to load
- Take screenshot → `video/public/screenshots/violin-full.png`

**Step 7: Capture trombone-full.png**

- Switch to "Trombone"
- Take screenshot → `video/public/screenshots/trombone-full.png`

**Step 8: Capture eras-zoom.png**

- Switch back to Piano
- Zoom to clearly show era bands with labels
- Take screenshot → `video/public/screenshots/eras-zoom.png`

**Step 9: Capture hero-clean.png**

- Reset to default Piano view, nothing selected
- Take screenshot → `video/public/screenshots/hero-clean.png`

**Step 10: Commit**

```bash
git add video/public/screenshots/
git commit -m "Add app screenshots for marketing video"
```

---

### Task 3: Create Constants and Font Setup

**Files:**
- Create: `video/src/constants.ts`
- Create: `video/src/fonts.ts`

**Step 1: Create constants.ts**

```ts
export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

export const SCENES = {
  hook:             { duration: 3 * FPS },
  timeline:         { duration: 5 * FPS },
  connections:      { duration: 6 * FPS },
  personPanel:      { duration: 5 * FPS },
  colorCoding:      { duration: 4 * FPS },
  instrumentSwitch: { duration: 5 * FPS },
  trombone:         { duration: 4 * FPS },
  eras:             { duration: 4 * FPS },
  cta:              { duration: 5 * FPS },
} as const;

export const TRANSITION_DURATION = 10; // frames overlap between scenes

export const TOTAL_FRAMES = Object.values(SCENES).reduce(
  (sum, s) => sum + s.duration, 0
) - (Object.keys(SCENES).length - 1) * TRANSITION_DURATION;

export const COLORS = {
  accent: '#3d5a80',
  bg: '#faf9f7',
  ink: '#1a1a1a',
  white: '#ffffff',
} as const;
```

**Step 2: Create fonts.ts**

```ts
import { loadFont as loadCormorant } from '@remotion/google-fonts/CormorantGaramond';
import { loadFont as loadKarla } from '@remotion/google-fonts/Karla';

const { fontFamily: displayFont } = loadCormorant('normal', {
  weights: ['700'],
  subsets: ['latin'],
});

const { fontFamily: bodyFont } = loadKarla('normal', {
  weights: ['400', '700'],
  subsets: ['latin'],
});

export { displayFont, bodyFont };
```

**Step 3: Commit**

```bash
git add video/src/constants.ts video/src/fonts.ts
git commit -m "Add constants and font setup for marketing video"
```

---

### Task 4: Build KenBurns Component

**Files:**
- Create: `video/src/components/KenBurns.tsx`

**Step 1: Create the component**

```tsx
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';

type KenBurnsProps = {
  src: string;
  startScale?: number;
  endScale?: number;
  startX?: number;
  endX?: number;
  startY?: number;
  endY?: number;
};

export const KenBurns: React.FC<KenBurnsProps> = ({
  src,
  startScale = 1,
  endScale = 1.15,
  startX = 0,
  endX = 0,
  startY = 0,
  endY = 0,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const scale = interpolate(frame, [0, durationInFrames], [startScale, endScale], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const translateX = interpolate(frame, [0, durationInFrames], [startX, endX], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const translateY = interpolate(frame, [0, durationInFrames], [startY, endY], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill>
      <Img
        src={staticFile(src)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${scale}) translate(${translateX}%, ${translateY}%)`,
        }}
      />
    </AbsoluteFill>
  );
};
```

**Step 2: Commit**

```bash
git add video/src/components/KenBurns.tsx
git commit -m "Add KenBurns pan/zoom component"
```

---

### Task 5: Build TextOverlay Component

**Files:**
- Create: `video/src/components/TextOverlay.tsx`

**Step 1: Create the component**

```tsx
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { displayFont } from '../fonts';

type TextOverlayProps = {
  text: string;
  fontSize?: number;
  color?: string;
  position?: 'center' | 'bottom' | 'top';
  delay?: number;
};

export const TextOverlay: React.FC<TextOverlayProps> = ({
  text,
  fontSize = 72,
  color = '#ffffff',
  position = 'center',
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const entrance = spring({
    frame: frame - delay,
    fps,
    config: { damping: 20, stiffness: 200 },
  });

  const exitStart = durationInFrames - 0.3 * fps;
  const exit = frame > exitStart
    ? interpolate(frame, [exitStart, durationInFrames], [1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 1;

  const opacity = entrance * exit;
  const scale = interpolate(entrance, [0, 1], [0.8, 1]);
  const translateY = interpolate(entrance, [0, 1], [30, 0]);

  const top = position === 'top' ? '15%' : position === 'bottom' ? '75%' : '50%';

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        top,
        position: 'absolute',
      }}
    >
      <div
        style={{
          fontFamily: displayFont,
          fontSize,
          fontWeight: 700,
          color,
          textShadow: '0 4px 20px rgba(0,0,0,0.6)',
          opacity,
          transform: `scale(${scale}) translateY(${translateY}px)`,
          textAlign: 'center',
          padding: '0 80px',
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};
```

**Step 2: Commit**

```bash
git add video/src/components/TextOverlay.tsx
git commit -m "Add TextOverlay animated text component"
```

---

### Task 6: Build Individual Scene Components

**Files:**
- Create: `video/src/scenes/HookScene.tsx`
- Create: `video/src/scenes/TimelineScene.tsx`
- Create: `video/src/scenes/ConnectionsScene.tsx`
- Create: `video/src/scenes/PersonPanelScene.tsx`
- Create: `video/src/scenes/ColorCodingScene.tsx`
- Create: `video/src/scenes/InstrumentSwitchScene.tsx`
- Create: `video/src/scenes/TromboneScene.tsx`
- Create: `video/src/scenes/ErasScene.tsx`
- Create: `video/src/scenes/CTAScene.tsx`

Each scene wraps `KenBurns` + `TextOverlay` with scene-specific parameters.

**Step 1: Create HookScene.tsx**

```tsx
import { AbsoluteFill } from 'remotion';
import { KenBurns } from '../components/KenBurns';
import { TextOverlay } from '../components/TextOverlay';

export const HookScene: React.FC = () => (
  <AbsoluteFill>
    <KenBurns src="screenshots/piano-full.png" startScale={1.3} endScale={1} />
    <TextOverlay text="500 years of music." fontSize={96} />
  </AbsoluteFill>
);
```

**Step 2: Create TimelineScene.tsx**

```tsx
import { AbsoluteFill } from 'remotion';
import { KenBurns } from '../components/KenBurns';
import { TextOverlay } from '../components/TextOverlay';

export const TimelineScene: React.FC = () => (
  <AbsoluteFill>
    <KenBurns src="screenshots/piano-medium.png" startX={-5} endX={5} />
    <TextOverlay text="Every composer. Every performer. One timeline." fontSize={64} position="bottom" />
  </AbsoluteFill>
);
```

**Step 3: Create ConnectionsScene.tsx**

```tsx
import { AbsoluteFill } from 'remotion';
import { KenBurns } from '../components/KenBurns';
import { TextOverlay } from '../components/TextOverlay';

export const ConnectionsScene: React.FC = () => (
  <AbsoluteFill>
    <KenBurns src="screenshots/bach-connections.png" startScale={1} endScale={1.1} startX={-2} endX={2} />
    <TextOverlay text="Trace who taught whom." fontSize={80} position="bottom" />
  </AbsoluteFill>
);
```

**Step 4: Create PersonPanelScene.tsx**

```tsx
import { AbsoluteFill } from 'remotion';
import { KenBurns } from '../components/KenBurns';
import { TextOverlay } from '../components/TextOverlay';

export const PersonPanelScene: React.FC = () => (
  <AbsoluteFill>
    <KenBurns src="screenshots/bach-panel.png" startScale={1.05} endScale={1.15} startX={3} endX={5} />
    <TextOverlay text="Dive into the details." fontSize={72} position="top" />
  </AbsoluteFill>
);
```

**Step 5: Create ColorCodingScene.tsx**

```tsx
import { AbsoluteFill } from 'remotion';
import { KenBurns } from '../components/KenBurns';
import { TextOverlay } from '../components/TextOverlay';

export const ColorCodingScene: React.FC = () => (
  <AbsoluteFill>
    <KenBurns src="screenshots/color-mix.png" startX={-3} endX={3} />
    <TextOverlay text="Composers. Performers. Both." fontSize={80} />
  </AbsoluteFill>
);
```

**Step 6: Create InstrumentSwitchScene.tsx**

```tsx
import { AbsoluteFill } from 'remotion';
import { KenBurns } from '../components/KenBurns';
import { TextOverlay } from '../components/TextOverlay';

export const InstrumentSwitchScene: React.FC = () => (
  <AbsoluteFill>
    <KenBurns src="screenshots/violin-full.png" startScale={1} endScale={1.1} />
    <TextOverlay text="Switch instruments. New stories." fontSize={72} />
  </AbsoluteFill>
);
```

**Step 7: Create TromboneScene.tsx**

```tsx
import { AbsoluteFill } from 'remotion';
import { KenBurns } from '../components/KenBurns';
import { TextOverlay } from '../components/TextOverlay';

export const TromboneScene: React.FC = () => (
  <AbsoluteFill>
    <KenBurns src="screenshots/trombone-full.png" startScale={1.05} endScale={1.15} />
    <TextOverlay text="Piano. Violin. Trombone." fontSize={80} />
  </AbsoluteFill>
);
```

**Step 8: Create ErasScene.tsx**

```tsx
import { AbsoluteFill } from 'remotion';
import { KenBurns } from '../components/KenBurns';
import { TextOverlay } from '../components/TextOverlay';

export const ErasScene: React.FC = () => (
  <AbsoluteFill>
    <KenBurns src="screenshots/eras-zoom.png" startX={-4} endX={4} />
    <TextOverlay text="From Baroque to Contemporary." fontSize={72} position="bottom" />
  </AbsoluteFill>
);
```

**Step 9: Create CTAScene.tsx**

```tsx
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { KenBurns } from '../components/KenBurns';
import { displayFont, bodyFont } from '../fonts';
import { COLORS } from '../constants';

export const CTAScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleEntrance = spring({ frame, fps, config: { damping: 200 } });
  const urlEntrance = spring({ frame, fps, delay: 15, config: { damping: 200 } });

  const titleOpacity = titleEntrance;
  const urlOpacity = urlEntrance;
  const urlScale = interpolate(urlEntrance, [0, 1], [0.9, 1]);

  return (
    <AbsoluteFill>
      <KenBurns src="screenshots/hero-clean.png" startScale={1.05} endScale={1.1} />
      <AbsoluteFill
        style={{
          background: 'linear-gradient(transparent 20%, rgba(0,0,0,0.7) 100%)',
        }}
      />
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          gap: 30,
        }}
      >
        <div
          style={{
            fontFamily: displayFont,
            fontSize: 64,
            fontWeight: 700,
            color: COLORS.white,
            opacity: titleOpacity,
            textShadow: '0 4px 20px rgba(0,0,0,0.5)',
          }}
        >
          Explore the history of music.
        </div>
        <div
          style={{
            fontFamily: bodyFont,
            fontSize: 48,
            fontWeight: 700,
            color: COLORS.white,
            opacity: urlOpacity,
            transform: `scale(${urlScale})`,
            textShadow: '0 2px 10px rgba(0,0,0,0.5)',
          }}
        >
          musiker.page
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
```

**Step 10: Commit**

```bash
git add video/src/scenes/
git commit -m "Add all 9 scene components for marketing video"
```

---

### Task 7: Build Main Composition and Root

**Files:**
- Create: `video/src/MarketingVideo.tsx`
- Modify: `video/src/Root.tsx`

**Step 1: Create MarketingVideo.tsx**

```tsx
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { slide } from '@remotion/transitions/slide';
import { Audio } from '@remotion/media';
import { staticFile } from 'remotion';
import { SCENES, TRANSITION_DURATION } from './constants';
import { HookScene } from './scenes/HookScene';
import { TimelineScene } from './scenes/TimelineScene';
import { ConnectionsScene } from './scenes/ConnectionsScene';
import { PersonPanelScene } from './scenes/PersonPanelScene';
import { ColorCodingScene } from './scenes/ColorCodingScene';
import { InstrumentSwitchScene } from './scenes/InstrumentSwitchScene';
import { TromboneScene } from './scenes/TromboneScene';
import { ErasScene } from './scenes/ErasScene';
import { CTAScene } from './scenes/CTAScene';

const transition = (type: 'fade' | 'slide' = 'fade') => (
  <TransitionSeries.Transition
    presentation={type === 'slide' ? slide({ direction: 'from-right' }) : fade()}
    timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
  />
);

export const MarketingVideo: React.FC = () => (
  <>
    <Audio src={staticFile('audio/backing-track.mp3')} volume={0.8} />
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={SCENES.hook.duration}>
        <HookScene />
      </TransitionSeries.Sequence>
      {transition()}
      <TransitionSeries.Sequence durationInFrames={SCENES.timeline.duration}>
        <TimelineScene />
      </TransitionSeries.Sequence>
      {transition()}
      <TransitionSeries.Sequence durationInFrames={SCENES.connections.duration}>
        <ConnectionsScene />
      </TransitionSeries.Sequence>
      {transition()}
      <TransitionSeries.Sequence durationInFrames={SCENES.personPanel.duration}>
        <PersonPanelScene />
      </TransitionSeries.Sequence>
      {transition()}
      <TransitionSeries.Sequence durationInFrames={SCENES.colorCoding.duration}>
        <ColorCodingScene />
      </TransitionSeries.Sequence>
      {transition('slide')}
      <TransitionSeries.Sequence durationInFrames={SCENES.instrumentSwitch.duration}>
        <InstrumentSwitchScene />
      </TransitionSeries.Sequence>
      {transition('slide')}
      <TransitionSeries.Sequence durationInFrames={SCENES.trombone.duration}>
        <TromboneScene />
      </TransitionSeries.Sequence>
      {transition()}
      <TransitionSeries.Sequence durationInFrames={SCENES.eras.duration}>
        <ErasScene />
      </TransitionSeries.Sequence>
      {transition()}
      <TransitionSeries.Sequence durationInFrames={SCENES.cta.duration}>
        <CTAScene />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  </>
);
```

**Step 2: Update Root.tsx**

Replace the contents of `video/src/Root.tsx` with:

```tsx
import { Composition } from 'remotion';
import { MarketingVideo } from './MarketingVideo';
import { FPS, WIDTH, HEIGHT, TOTAL_FRAMES } from './constants';

export const RemotionRoot = () => (
  <Composition
    id="MarketingVideo"
    component={MarketingVideo}
    durationInFrames={TOTAL_FRAMES}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
  />
);
```

**Step 3: Commit**

```bash
git add video/src/MarketingVideo.tsx video/src/Root.tsx
git commit -m "Add main composition and root for marketing video"
```

---

### Task 8: Add Audio Track

**Files:**
- Create: `video/public/audio/backing-track.mp3`

**Step 1: User provides the ElevenLabs-generated audio file**

The user will generate the track and provide the file. Copy it to `video/public/audio/backing-track.mp3`.

**Step 2: Commit**

```bash
git add video/public/audio/
git commit -m "Add backing audio track"
```

---

### Task 9: Preview, Iterate, and Render

**Step 1: Launch Remotion Studio to preview**

Run:
```bash
cd /home/pmatos/dev/music-timeline/video && npx remotion studio
```

Preview the composition in the browser. Check timing, transitions, text readability.

**Step 2: Adjust scene parameters if needed**

Tune KenBurns `startScale`/`endScale`/`startX`/`endX` values, `TextOverlay` positions and font sizes, and `TRANSITION_DURATION` based on how it looks.

**Step 3: Render final video**

Run:
```bash
cd /home/pmatos/dev/music-timeline/video && npx remotion render MarketingVideo out/musiker-promo.mp4
```

Expected: MP4 file at `video/out/musiker-promo.mp4`.

**Step 4: Commit final adjustments**

```bash
git add -u video/src/
git commit -m "Finalize scene timing and parameters after preview"
```

---

## Task Dependency Order

```
Task 1 (scaffold) → Task 3 (constants/fonts) → Task 4 (KenBurns) → Task 5 (TextOverlay)
                  ↘ Task 2 (screenshots)     ↗
Task 4 + Task 5 → Task 6 (scenes) → Task 7 (composition) → Task 8 (audio) → Task 9 (render)
```

Tasks 2 and 3 can run in parallel after Task 1. Tasks 4 and 5 can run in parallel after Task 3.
