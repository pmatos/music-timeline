import { AbsoluteFill } from 'remotion';
import { KenBurns } from '../components/KenBurns';
import { TextOverlay } from '../components/TextOverlay';

export const ConnectionsScene: React.FC = () => (
  <AbsoluteFill>
    <KenBurns src="screenshots/bach-connections.png" startScale={1} endScale={1.1} startX={-2} endX={2} />
    <TextOverlay text="Trace who taught whom." fontSize={80} position="bottom" />
  </AbsoluteFill>
);
