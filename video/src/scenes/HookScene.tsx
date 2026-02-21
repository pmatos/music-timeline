import { AbsoluteFill } from 'remotion';
import { KenBurns } from '../components/KenBurns';
import { TextOverlay } from '../components/TextOverlay';

export const HookScene: React.FC = () => (
  <AbsoluteFill>
    <KenBurns src="screenshots/piano-full.png" startScale={1.3} endScale={1} />
    <TextOverlay text="500 years of music." fontSize={96} />
  </AbsoluteFill>
);
