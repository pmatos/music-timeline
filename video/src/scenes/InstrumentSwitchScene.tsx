import { AbsoluteFill } from 'remotion';
import { KenBurns } from '../components/KenBurns';
import { TextOverlay } from '../components/TextOverlay';

export const InstrumentSwitchScene: React.FC = () => (
  <AbsoluteFill>
    <KenBurns src="screenshots/violin-full.png" startScale={1} endScale={1.1} />
    <TextOverlay text="Switch instruments. New stories." fontSize={72} />
  </AbsoluteFill>
);
