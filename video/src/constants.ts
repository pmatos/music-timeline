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
