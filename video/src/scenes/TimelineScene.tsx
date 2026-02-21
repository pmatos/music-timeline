import { AbsoluteFill } from 'remotion';
import { KenBurns } from '../components/KenBurns';
import { TextOverlay } from '../components/TextOverlay';

export const TimelineScene: React.FC = () => (
  <AbsoluteFill>
    <KenBurns src="screenshots/piano-medium.png" startX={-5} endX={5} />
    <TextOverlay text="Every composer. Every performer. One timeline." fontSize={64} position="bottom" />
  </AbsoluteFill>
);
