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
