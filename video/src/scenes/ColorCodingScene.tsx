import { AbsoluteFill } from 'remotion';
import { KenBurns } from '../components/KenBurns';
import { TextOverlay } from '../components/TextOverlay';

export const ColorCodingScene: React.FC = () => (
  <AbsoluteFill>
    <KenBurns src="screenshots/color-mix.png" startX={-3} endX={3} />
    <TextOverlay text="Composers. Performers. Both." fontSize={80} />
  </AbsoluteFill>
);
