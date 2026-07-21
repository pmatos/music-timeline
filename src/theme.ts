import type { Role, ConnectionType } from './types';

// Single source of truth for the timeline's data-visualization colors and
// encodings. SVG components can't read the CSS custom properties in index.css
// cleanly, so these live here and are imported wherever a bar, line, axis, or
// legend swatch is drawn — keeping the bars and their legend from drifting.

/**
 * Deep, muted role fills. White 11px bar text clears WCAG AA on all three
 * (composer 6.1:1, player 6.3:1, both 7.3:1).
 */
export const ROLE_COLORS: Record<Role, string> = {
  composer: '#2f6690',
  player: '#8a5314',
  both: '#7a3f88',
};

/** Concise visible role names (legend, tooltip). */
export const ROLE_LABELS: Record<Role, string> = {
  composer: 'Composer',
  player: 'Player',
  both: 'Both',
};

/** Fuller role wording for screen-reader accessible names. */
export const ROLE_ARIA: Record<Role, string> = {
  composer: 'composer',
  player: 'player',
  both: 'composer and player',
};

/**
 * Non-color role cue (WCAG 1.4.1). A monochrome glyph carries the role
 * independently of hue; the legend teaches the mapping.
 */
export const ROLE_GLYPHS: Record<Role, string> = {
  composer: '✎',
  player: '♪',
  both: '◆',
};

/** Connection lines: pattern (solid vs dashed) carries meaning, color reinforces. */
export const CONNECTION_STYLES: Record<
  ConnectionType,
  { color: string; dash?: string }
> = {
  relative: { color: '#c0392b' },
  'student-teacher': { color: '#2980b9', dash: '6 3' },
};

export const CONNECTION_LABELS: Record<ConnectionType, string> = {
  relative: 'Relative',
  'student-teacher': 'Student/Teacher',
};

// Neutral viz grays (SVG-only; kept out of the CSS token layer).
export const BAR_TEXT = '#ffffff';
export const BAR_HIGHLIGHT_STROKE = '#333333';
export const FOCUS_RING = '#3d5a80';
export const AXIS_LINE = '#8c8c8c';
export const AXIS_TEXT = '#6c6c6c';
export const ERA_LABEL = '#666666';
