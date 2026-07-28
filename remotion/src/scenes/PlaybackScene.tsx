import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

export const PlaybackScene: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });
  const countdown = Math.max(0, 30 - Math.floor(frame / 5));

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', padding: 60, opacity }}>
      <div style={{ fontSize: 40, color: '#a1a1aa', marginBottom: 40, textAlign: 'center' }}>
        3. ¡A entrenar!
      </div>
      <div
        style={{
          fontSize: 160,
          fontWeight: 'bold',
          color: '#4ade80',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        0:{countdown.toString().padStart(2, '0')}
      </div>
      <div style={{ fontSize: 32, color: '#a1a1aa', marginTop: 20 }}>TRABAJO</div>
      <div style={{ fontSize: 28, color: '#71717a', marginTop: 40 }}>
        🔊 &quot;Ejercicio: Sentadillas&quot;
      </div>
    </AbsoluteFill>
  );
};
