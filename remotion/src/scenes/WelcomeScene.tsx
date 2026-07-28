import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';

export const WelcomeScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
  const titleY = spring({ frame, fps, from: 30, to: 0, durationInFrames: 30 });
  const subtitleOpacity = interpolate(frame, [20, 40], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        padding: 60,
      }}
    >
      <div
        style={{
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          fontSize: 80,
          fontWeight: 'bold',
          color: 'white',
          textAlign: 'center',
        }}
      >
        NoMoneyGym
      </div>
      <div
        style={{
          opacity: subtitleOpacity,
          fontSize: 36,
          color: '#a1a1aa',
          textAlign: 'center',
          marginTop: 40,
        }}
      >
        Rutinas con tus propios videos
      </div>
    </AbsoluteFill>
  );
};
