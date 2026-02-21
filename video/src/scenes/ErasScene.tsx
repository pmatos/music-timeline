import { AbsoluteFill } from 'remotion';
import { KenBurns } from '../components/KenBurns';
import { TextOverlay } from '../components/TextOverlay';

export const ErasScene: React.FC = () => (
  <AbsoluteFill>
    <KenBurns src="screenshots/eras-zoom.png" startX={-4} endX={4} />
    <TextOverlay text="From Baroque to Contemporary." fontSize={72} position="bottom" />
  </AbsoluteFill>
);
