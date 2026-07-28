import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';

export const BuildCircuitScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });

  const items = ['Sentadillas', 'Flexiones', 'Burpees', 'Plancha'];

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', padding: 60, opacity }}>
      <div style={{ fontSize: 40, color: '#a1a1aa', marginBottom: 40, textAlign: 'center' }}>
        2. Arma tu circuito
      </div>
      <div style={{ width: 700, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {items.map((item, i) => {
          const y = spring({ frame: frame - i * 10, fps, from: 50, to: 0, durationInFrames: 20 });
          const itemOpacity = interpolate(frame, [i * 10, i * 10 + 15], [0, 1], { extrapolateRight: 'clamp' });
          return (
            <div
              key={item}
              style={{
                opacity: itemOpacity,
                transform: `translateY(${y}px)`,
                backgroundColor: '#27272a',
                borderRadius: 12,
                padding: '24px 32px',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
              }}
            >
              <span style={{ color: '#71717a', fontSize: 28 }}>⠿</span>
              <span style={{ color: 'white', fontSize: 32 }}>{item}</span>
              <span style={{ marginLeft: 'auto', color: '#22c55e', fontSize: 24 }}>30s</span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
