import { Composition } from 'remotion';
import { MarketingVideo } from './MarketingVideo';
import { FPS, WIDTH, HEIGHT, TOTAL_FRAMES } from './constants';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="MarketingVideo"
    component={MarketingVideo}
    durationInFrames={TOTAL_FRAMES}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
  />
);
