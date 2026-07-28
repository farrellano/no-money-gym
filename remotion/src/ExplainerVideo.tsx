import { Composition } from 'remotion';
import { AbsoluteFill, Sequence } from 'remotion';
import { WelcomeScene } from './scenes/WelcomeScene';
import { UploadScene } from './scenes/UploadScene';
import { BuildCircuitScene } from './scenes/BuildCircuitScene';
import { PlaybackScene } from './scenes/PlaybackScene';
import { CtaScene } from './scenes/CtaScene';

const SCENE_DURATION = 150; // 5 seconds at 30fps

export const ExplainerVideoComp: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#09090b' }}>
      <Sequence from={0} durationInFrames={SCENE_DURATION}>
        <WelcomeScene />
      </Sequence>
      <Sequence from={SCENE_DURATION} durationInFrames={SCENE_DURATION}>
        <UploadScene />
      </Sequence>
      <Sequence from={SCENE_DURATION * 2} durationInFrames={SCENE_DURATION}>
        <BuildCircuitScene />
      </Sequence>
      <Sequence from={SCENE_DURATION * 3} durationInFrames={SCENE_DURATION}>
        <PlaybackScene />
      </Sequence>
      <Sequence from={SCENE_DURATION * 4} durationInFrames={SCENE_DURATION}>
        <CtaScene />
      </Sequence>
    </AbsoluteFill>
  );
};

export const ExplainerVideo: React.FC = () => {
  return (
    <>
      <Composition
        id="ExplainerVideo"
        component={ExplainerVideoComp}
        durationInFrames={SCENE_DURATION * 5}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
