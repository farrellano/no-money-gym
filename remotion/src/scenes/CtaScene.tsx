import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';

export const CtaScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
  const scale = spring({ frame, fps, from: 0.8, to: 1, durationInFrames: 30 });

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        padding: 60,
        opacity,
      }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 56, fontWeight: 'bold', color: 'white', marginBottom: 30 }}>
          Empieza gratis
        </div>
        <div style={{ fontSize: 32, color: '#a1a1aa', maxWidth: 700 }}>
          Tus datos se quedan en tu dispositivo. Sin nube, sin suscripciones.
        </div>
        <div
          style={{
            marginTop: 60,
            backgroundColor: '#16a34a',
            borderRadius: 12,
            padding: '20px 60px',
            display: 'inline-block',
          }}
        >
          <span style={{ fontSize: 36, fontWeight: 'bold', color: 'white' }}>Comenzar</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
