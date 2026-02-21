import { AbsoluteFill } from 'remotion';
import { KenBurns } from '../components/KenBurns';
import { TextOverlay } from '../components/TextOverlay';

export const TromboneScene: React.FC = () => (
  <AbsoluteFill>
    <KenBurns src="screenshots/trombone-full.png" startScale={1.05} endScale={1.15} />
    <TextOverlay text="Piano. Violin. Trombone." fontSize={80} />
  </AbsoluteFill>
);
