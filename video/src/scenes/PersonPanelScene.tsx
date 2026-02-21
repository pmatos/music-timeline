import { AbsoluteFill } from 'remotion';
import { KenBurns } from '../components/KenBurns';
import { TextOverlay } from '../components/TextOverlay';

export const PersonPanelScene: React.FC = () => (
  <AbsoluteFill>
    <KenBurns src="screenshots/bach-panel.png" startScale={1.05} endScale={1.15} startX={3} endX={5} />
    <TextOverlay text="Dive into the details." fontSize={72} position="top" />
  </AbsoluteFill>
);
