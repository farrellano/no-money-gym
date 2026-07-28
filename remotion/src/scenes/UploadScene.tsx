import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

export const UploadScene: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });
  const sliderProgress = interpolate(frame, [40, 120], [0, 70], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', padding: 60, opacity }}>
      <div style={{ fontSize: 40, color: '#a1a1aa', marginBottom: 40, textAlign: 'center' }}>
        1. Sube un video y recórtalo
      </div>
      <div
        style={{
          width: 800,
          height: 500,
          backgroundColor: '#27272a',
          borderRadius: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <div style={{ fontSize: 80 }}>📹</div>
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            left: 60,
            right: 60,
            height: 8,
            backgroundColor: '#3f3f46',
            borderRadius: 4,
          }}
        >
          <div
            style={{
              width: `${sliderProgress}%`,
              height: '100%',
              backgroundColor: '#22c55e',
              borderRadius: 4,
            }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};
