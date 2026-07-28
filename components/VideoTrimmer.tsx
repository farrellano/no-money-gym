'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

interface VideoTrimmerProps {
  videoUrl: string;
  duration: number;
  startSec: number;
  endSec: number;
  onRangeChange: (start: number, end: number) => void;
}

export function VideoTrimmer({
  videoUrl,
  duration,
  startSec,
  endSec,
  onRangeChange,
}: VideoTrimmerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Loop video within selected range
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (video.currentTime >= endSec) {
        video.currentTime = startSec;
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, [startSec, endSec]);

  const handlePreview = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = startSec;
    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  }, [startSec, isPlaying]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-3">
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full rounded-lg aspect-video bg-black"
        playsInline
        muted
      />

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span>Inicio: {formatTime(startSec)}</span>
          <span>Fin: {formatTime(endSec)}</span>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-zinc-500">Inicio</label>
          <input
            type="range"
            min={0}
            max={duration}
            step={0.1}
            value={startSec}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              if (val < endSec) onRangeChange(val, endSec);
            }}
            className="w-full accent-white"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-zinc-500">Fin</label>
          <input
            type="range"
            min={0}
            max={duration}
            step={0.1}
            value={endSec}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              if (val > startSec) onRangeChange(startSec, val);
            }}
            className="w-full accent-white"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={handlePreview}
        className="w-full rounded-lg border border-zinc-700 px-4 py-2 text-sm text-white active:bg-zinc-800"
      >
        {isPlaying ? '⏸ Pausar' : '▶ Previsualizar recorte'}
      </button>
    </div>
  );
}
