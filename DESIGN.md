---
name: Music Timeline
description: An interactive, scholarly timeline of composers and performers across instruments.
colors:
  ink: '#1a1a1a'
  ink-muted: '#555555'
  ink-subtle: '#6c6c6c'
  accent: '#3d5a80'
  border: '#e0ddd8'
  bg: '#faf9f7'
  panel-bg: '#ffffff'
  chip-bg: '#f0ede8'
  role-composer: '#2f6690'
  role-player: '#8a5314'
  role-both: '#7a3f88'
  connection-relative: '#c0392b'
  connection-teacher: '#2980b9'
  era-baroque: '#e3f2fd'
  era-classical: '#fff3e0'
  era-romantic: '#fce4ec'
  era-modern: '#e8f5e9'
  era-contemporary: '#f3e5f5'
  era-alt: '#fff9c4'
typography:
  display:
    fontFamily: 'Cormorant Garamond, Georgia, serif'
    fontSize: '1.65rem'
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: '-0.01em'
  title:
    fontFamily: 'Cormorant Garamond, Georgia, serif'
    fontSize: '1.5rem'
    fontWeight: 700
    lineHeight: 1.2
  body:
    fontFamily: 'Karla, Helvetica Neue, sans-serif'
    fontSize: '0.92rem'
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: 'Karla, Helvetica Neue, sans-serif'
    fontSize: '0.72rem'
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: '0.06em'
rounded:
  xs: '4px'
  sm: '6px'
  md: '8px'
  pill: '12px'
spacing:
  xs: '4px'
  sm: '8px'
  md: '16px'
  lg: '28px'
components:
  instrument-select:
    backgroundColor: '{colors.panel-bg}'
    textColor: '{colors.ink}'
    rounded: '{rounded.sm}'
    padding: '6px 14px'
  role-chip:
    backgroundColor: '{colors.chip-bg}'
    textColor: '{colors.ink-muted}'
    rounded: '{rounded.pill}'
    padding: '2px 10px'
  person-panel:
    backgroundColor: '{colors.panel-bg}'
    textColor: '{colors.ink}'
    padding: '28px'
  tooltip:
    backgroundColor: '{colors.panel-bg}'
    textColor: '{colors.ink}'
    rounded: '{rounded.sm}'
    padding: '8px 12px'
---

# Design System: Music Timeline

## 1. Overview

**Creative North Star: "The Illuminated Almanac"**

Music Timeline is a literate almanac of music history rendered as an interactive canvas. It reads like a well-set reference volume that happens to be alive: names set in a warm serif, a paper-toned surface, centuries of composers and performers laid across quiet colored bands you can read at a glance. The system's job is to make history _explorable and trustworthy_ — nothing on screen should feel approximate, gimmicky, or louder than the people it describes.

The register is a **product** (the timeline is a tool that serves exploration), but the identity is deliberately editorial. Cormorant Garamond carries the names because the names are the point; Karla carries everything functional so the interface stays legible and out of the way. The palette is restrained to a single slate-blue accent over a warm off-white, with role and era color used as _information_, never decoration. Depth is nearly absent — the timeline is flat, and shadow appears only where something genuinely floats above the page.

This system explicitly rejects the generic AI/SaaS dashboard (card grids, gradient accents, tracked-uppercase eyebrow labels), the cluttered rainbow infographic, childish or gamified edutainment, and cold corporate sterility. Warmth comes from paper and serif, not from ornament.

**Key Characteristics:**

- Editorial serif for names/titles, humanist sans for everything else.
- Warm off-white paper surface (`#faf9f7`), a single slate-blue accent (`#3d5a80`).
- Color is information: role hues, era bands, connection lines — each earns its place.
- Flat by default; soft ambient shadow only on floating overlays.
- Restrained, deferential controls that never compete with the timeline.

## 2. Colors

A warm-neutral paper base carries near-black text and a single reserved slate-blue accent; every other hue is a data encoding, not styling.

### Primary

- **Slate Blue** (`#3d5a80`): the one interactive accent. Links, the instrument selector's hover border, in-panel connection links. Marks "you can act here" and nothing else.

### Neutral

- **Ink** (`#1a1a1a`): primary text — names, headings, body at full strength.
- **Muted Ink** (`#555555`): secondary text — bios, legend labels, chip text.
- **Subtle Ink** (`#6c6c6c`): tertiary text — years, subtitles, footer, time-axis labels. The lightest text tier, tuned to sit just above the AA floor (4.99:1 on paper, 5.25:1 on panel white).
- **Paper** (`#faf9f7`): the warm off-white body surface. The room the timeline lives in.
- **Panel White** (`#ffffff`): raised surfaces — header, slide-in panel, tooltip, footer.
- **Border** (`#e0ddd8`): warm hairline dividers and control outlines, tuned to the paper, never gray-cold.
- **Chip** (`#f0ede8`): the role badge's soft warm fill in the person panel.

### Tertiary — Role Encoding

Lifetime bars are colored by role. Each hue is deep enough that the 11px white bar name clears AA (composer 6.1:1, player 6.3:1, both 7.3:1), and a monochrome **glyph** prefixes the name so role survives color-blindness.

- **Composer Blue** (`#2f6690`, glyph `✎`): role = composer.
- **Player Ochre** (`#8a5314`, glyph `♪`): role = player.
- **Both Plum** (`#7a3f88`, glyph `◆`): role = both.

### Tertiary — Connection Encoding

Connection lines are distinguished by **line pattern first, color second**, so the relationship survives color-blindness.

- **Relative Red** (`#c0392b`): family ties — drawn solid.
- **Teacher Blue** (`#2980b9`): student/teacher links — drawn dashed (`6 3`).

### Tertiary — Era Bands

Semi-transparent bands (Material-50 tints at 30% opacity) sit behind the timeline as orientation. They blend where eras overlap.

- **Baroque** (`#e3f2fd`), **Classical** (`#fff3e0`), **Romantic** (`#fce4ec`), **Modern** (`#e8f5e9`), **Contemporary** (`#f3e5f5`), plus an alternate tint (`#fff9c4`) for additional eras.

### Named Rules

**The One Accent Rule.** Slate blue (`#3d5a80`) is for interaction only — links and actionable controls. It never fills a shape and never decorates. Keep it under ~10% of any screen.

**The Quiet Bands Rule.** Era colors live at 30% opacity _behind_ the timeline. They orient the eye across centuries; they never touch text, controls, or foreground. If a band competes with a person bar for attention, the band is too strong.

**The Color-Is-Information Rule.** Every non-neutral hue encodes data (role, relationship, era). No hue is chosen for flavor. If a color can't name what it means, it doesn't belong.

**The Shape-Encodes-Role Rule.** Categorical meaning never rests on hue alone. Role carries a monochrome glyph (`✎` composer, `♪` player, `◆` both) alongside its color; connections carry a line pattern (solid vs dashed) alongside theirs. The legend teaches both channels.

**The AA-Contrast Rule.** Every text/background pairing meets WCAG 2.1 AA — 4.5:1 for normal-size text, 3:1 for large (≥18px, or bold ≥14px), and 3:1 for meaningful non-text (axis lines). Role fills are deep enough that the white bar names clear AA; Subtle Ink is `#6c6c6c`; the time-axis line is `#8c8c8c`.

## 3. Typography

**Display Font:** Cormorant Garamond (with Georgia, serif fallback)
**Body Font:** Karla (with Helvetica Neue, sans-serif fallback)

**Character:** A high-contrast pairing on the classic axis — a literary old-style serif against a clean humanist grotesque. The serif lends the names gravity and timelessness; the sans keeps the working interface crisp and quiet. The contrast is intentional and load-bearing: it is what makes an exploration tool feel like a reference book rather than a chart.

### Hierarchy

- **Display** (Cormorant Garamond, 700, 1.65rem, line-height 1.2, letter-spacing -0.01em): the app/instrument title in the header.
- **Title** (Cormorant Garamond, 700, 1.5rem, line-height 1.2): a person's name in the detail panel and the tooltip.
- **Body** (Karla, 400, 0.92rem, line-height 1.65): bios and prose. Cap prose at 65–75ch.
- **Label** (Karla, 600, 0.72rem, letter-spacing 0.06em, uppercase): the role badge and section labels inside the panel. This is the _only_ sanctioned uppercase-tracked text — a labeled datum, never a decorative eyebrow above a section.

### Named Rules

**The Serif-Is-For-People Rule.** Cormorant Garamond is reserved for names and titles — the human beings the timeline is about. Every functional element (controls, labels, data, years, legends, body copy) is set in Karla. Never set a UI label, a button, or data in the display serif.

**The One Eyebrow Rule.** The uppercase tracked label exists once, as the role badge. Do not multiply it into per-section kickers; that is the generic-AI tell this system rejects.

## 4. Elevation

The system is **flat by default**. The timeline canvas — era bands, lifetime bars, connection curves, axis — carries zero shadow; depth there is conveyed entirely by color, opacity, and overlap. Shadow is admitted only where an element genuinely floats above the page: the slide-in person panel and the hover tooltip. Both use a soft, low-opacity ambient shadow, never a hard or dark drop shadow.

### Shadow Vocabulary

- **Panel float** (`box-shadow: -4px 0 24px rgba(0,0,0,0.08)`): the right-edge slide-in person panel, lifting it off the content beneath.
- **Tooltip float** (`box-shadow: 0 2px 12px rgba(0,0,0,0.12)`): the hover tooltip, a small card tracking the cursor.

### Named Rules

**The Flat-Timeline Rule.** The timeline is flat. Shadow appears only on genuinely floating overlays (panel, tooltip) and never as decoration on bars, bands, chips, or controls. A shadow on a resting surface is a bug.

## 5. Components

Controls are **refined and restrained** — precise, quiet, and deferential to the timeline. They read as the furniture of a reference book, not the chrome of an app.

### Instrument Selector

- **Style:** a native `<select>` with a 1px warm border (`#e0ddd8`), 6px radius, `6px 14px` padding, on panel white, set in Karla 500.
- **Hover:** border shifts to slate-blue accent (`#3d5a80`); a 0.15s color transition, nothing else moves.
- **Behavior:** a trailing "New Instrument…" option routes to the contribution form rather than selecting — the product visibly invites additions.

### Role Badge (Chip)

- **Style:** soft warm fill (`#f0ede8`), muted-ink text, 12px radius, `2px 10px` padding.
- **Type:** Karla 600, 0.72rem, uppercase, 0.06em tracking — the spelled-out role that backs up the bar's color encoding.

### Person Panel

- **Corner / surface:** panel white, full-height fixed rail on the right (360px, max 90vw), 28px padding.
- **Elevation:** panel-float shadow (see Elevation).
- **Motion:** slides in via `transform: translateX` over 0.3s ease. Contains the portrait (8px radius), name in serif title, years in subtle ink, role badge, bio, external links (Wikipedia / website) in accent, and a connections list of accent text-buttons.
- **Close:** a quiet ✕ in subtle ink that darkens to ink on hover.

### Tooltip

- **Style:** panel white, 6px radius, `8px 12px` padding, tooltip-float shadow. Name in serif (0.92rem, 600) over years in small sans. Tracks the cursor; appears on hover only.

### Lifetime Bar (signature component)

- **Style:** an SVG `<rect>`, 4px radius, filled by the deep role color, with a role glyph (`✎`/`♪`/`◆`) and the name in 11px white sans inset at the left. White text clears AA on all three fills.
- **States:** default; **highlighted** = 2px `#333` stroke (selected/connected); **dimmed** = 0.3 opacity (de-emphasized when another person is selected). Cursor is a pointer throughout.

### Connection Line (signature component)

- **Style:** an SVG bezier curve between two bars. **Relative** = solid red (`#c0392b`); **student/teacher** = dashed blue (`#2980b9`, dash `6 3`). Pattern carries the meaning; color reinforces it.

## 6. Do's and Don'ts

### Do:

- **Do** reserve Cormorant Garamond for names and titles; set every control, label, datum, and body line in Karla.
- **Do** hold the slate-blue accent (`#3d5a80`) to links and interactive affordances, under ~10% of any screen.
- **Do** render era bands at 30% opacity behind the timeline as orientation only.
- **Do** back every hue-coded signal with a non-color cue — the per-bar role glyph (`✎`/`♪`/`◆`), solid-vs-dashed connection lines, and the spelled-out role in the panel — so meaning survives color-blindness.
- **Do** honor `prefers-reduced-motion`: replace the 0.3s panel slide and hover transitions with an instant or crossfade alternative.
- **Do** keep every text pairing at WCAG 2.1 AA — Subtle Ink is `#6c6c6c`, the role fills are deep enough for white bar names, and the axis line meets the 3:1 non-text threshold.
- **Do** keep surfaces flat; add shadow only to the floating panel and tooltip.

### Don't:

- **Don't** turn this into a generic AI/SaaS dashboard — no card grids, no gradient accents, no tiny uppercase tracked eyebrow labels above sections.
- **Don't** let it become a cluttered infographic — no busy, over-labeled, rainbow-coded chart junk competing with the timeline.
- **Don't** add childish or gamified edutainment — no cartoon styling, badges, or confetti.
- **Don't** drift corporate or sterile — warmth is carried by the paper surface (`#faf9f7`) and serif names; never flatten to cold enterprise gray.
- **Don't** set UI labels, controls, or data in the display serif, and never multiply the uppercase role label into per-section kickers.
- **Don't** rely on hue alone to distinguish composer/player/both or relative/teacher connections.
- **Don't** lighten the role fills back toward the old bright Material hues — the deep values are what let the white bar names clear AA; brightening them breaks contrast.
- **Don't** put shadow on a resting surface (bars, bands, chips, controls); a shadow at rest is a bug.
