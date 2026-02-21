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
  color = '#1a1a1a',
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

  const justifyContent = position === 'top' ? 'flex-start' : position === 'bottom' ? 'flex-end' : 'center';
  const paddingVertical = position === 'top' ? 80 : position === 'bottom' ? 80 : 0;

  return (
    <AbsoluteFill
      style={{
        justifyContent,
        alignItems: 'center',
        paddingTop: position === 'top' ? paddingVertical : 0,
        paddingBottom: position === 'bottom' ? paddingVertical : 0,
      }}
    >
      <div
        style={{
          fontFamily: displayFont,
          fontSize,
          fontWeight: 700,
          color,
          textShadow: '0 2px 12px rgba(150,150,150,0.7)',
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
