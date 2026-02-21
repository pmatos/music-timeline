import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { slide } from '@remotion/transitions/slide';
import { Audio } from '@remotion/media';
import { staticFile } from 'remotion';
import { SCENES, TRANSITION_DURATION } from './constants';
import { HookScene } from './scenes/HookScene';
import { TimelineScene } from './scenes/TimelineScene';
import { ConnectionsScene } from './scenes/ConnectionsScene';
import { PersonPanelScene } from './scenes/PersonPanelScene';
import { ColorCodingScene } from './scenes/ColorCodingScene';
import { InstrumentSwitchScene } from './scenes/InstrumentSwitchScene';
import { TromboneScene } from './scenes/TromboneScene';
import { ErasScene } from './scenes/ErasScene';
import { CTAScene } from './scenes/CTAScene';

const transition = (type: 'fade' | 'slide' = 'fade') => (
  <TransitionSeries.Transition
    presentation={type === 'slide' ? slide({ direction: 'from-right' }) : fade()}
    timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
  />
);

export const MarketingVideo: React.FC = () => (
  <>
    <Audio src={staticFile('audio/backing-track.mp3')} volume={0.8} />
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={SCENES.hook.duration}>
        <HookScene />
      </TransitionSeries.Sequence>
      {transition()}
      <TransitionSeries.Sequence durationInFrames={SCENES.timeline.duration}>
        <TimelineScene />
      </TransitionSeries.Sequence>
      {transition()}
      <TransitionSeries.Sequence durationInFrames={SCENES.connections.duration}>
        <ConnectionsScene />
      </TransitionSeries.Sequence>
      {transition()}
      <TransitionSeries.Sequence durationInFrames={SCENES.personPanel.duration}>
        <PersonPanelScene />
      </TransitionSeries.Sequence>
      {transition()}
      <TransitionSeries.Sequence durationInFrames={SCENES.colorCoding.duration}>
        <ColorCodingScene />
      </TransitionSeries.Sequence>
      {transition('slide')}
      <TransitionSeries.Sequence durationInFrames={SCENES.instrumentSwitch.duration}>
        <InstrumentSwitchScene />
      </TransitionSeries.Sequence>
      {transition('slide')}
      <TransitionSeries.Sequence durationInFrames={SCENES.trombone.duration}>
        <TromboneScene />
      </TransitionSeries.Sequence>
      {transition()}
      <TransitionSeries.Sequence durationInFrames={SCENES.eras.duration}>
        <ErasScene />
      </TransitionSeries.Sequence>
      {transition()}
      <TransitionSeries.Sequence durationInFrames={SCENES.cta.duration}>
        <CTAScene />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  </>
);
