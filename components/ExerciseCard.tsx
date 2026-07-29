'use client';

import { useEffect, useRef, useState } from 'react';
import { db, type EjercicioRecord } from '@/lib/db';
import { useI18n } from '@/lib/i18n';

interface ExerciseCardProps {
  ejercicio: EjercicioRecord;
  onEdit: (ejercicio: EjercicioRecord) => void;
  onDelete: (id: string) => void;
}

export function ExerciseCard({ ejercicio, onEdit, onDelete }: ExerciseCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [thumbnailReady, setThumbnailReady] = useState(false);
  const { t } = useI18n();

  // Map DB key to translated label
  const groupIndex = (t.muscleGroupKeys as string[]).indexOf(ejercicio.grupoMuscular);
  const groupLabel = groupIndex >= 0 ? (t.muscleGroups as string[])[groupIndex] : ejercicio.grupoMuscular;

  // Generate thumbnail from video at startSec
  useEffect(() => {
    let url: string | null = null;
    let revoked = false;

    db.videos.get(ejercicio.videoId).then((video) => {
      if (!video || !canvasRef.current) return;

      url = URL.createObjectURL(video.blob);
      const videoEl = document.createElement('video');
      videoEl.preload = 'auto';
      videoEl.muted = true;
      videoEl.playsInline = true;
      videoEl.setAttribute('playsinline', '');

      const revokeUrl = () => {
        if (url && !revoked) {
          URL.revokeObjectURL(url);
          revoked = true;
        }
      };

      videoEl.onloadeddata = () => {
        videoEl.currentTime = ejercicio.startSec;
      };

      videoEl.onseeked = () => {
        // On iOS, briefly play to force frame decode
        const drawFrame = () => {
          const canvas = canvasRef.current;
          if (!canvas) { revokeUrl(); return; }
          canvas.width = videoEl.videoWidth;
          canvas.height = videoEl.videoHeight;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(videoEl, 0, 0);
            setThumbnailReady(true);
          }
          videoEl.pause();
          revokeUrl();
        };

        // Try drawing immediately; if canvas is blank (iOS), play briefly
        const canvas = canvasRef.current;
        if (canvas) {
          canvas.width = videoEl.videoWidth;
          canvas.height = videoEl.videoHeight;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(videoEl, 0, 0);
            // Check if frame was actually drawn (not blank)
            const pixel = ctx.getImageData(0, 0, 1, 1).data;
            if (pixel[0] !== 0 || pixel[1] !== 0 || pixel[2] !== 0) {
              setThumbnailReady(true);
              revokeUrl();
              return;
            }
          }
        }

        // Fallback for iOS: play to force decode, then draw
        videoEl.play().then(() => {
          requestAnimationFrame(drawFrame);
        }).catch(() => {
          drawFrame();
        });
      };

      videoEl.src = url;
      videoEl.load();
    });

    return () => {
      if (url && !revoked) {
        URL.revokeObjectURL(url);
        revoked = true;
      }
    };
  }, [ejercicio.videoId, ejercicio.startSec]);

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900">
      <canvas
        ref={canvasRef}
        className={`aspect-video w-full bg-zinc-800 object-cover ${
          !thumbnailReady ? 'animate-pulse' : ''
        }`}
      />
      <div className="p-3">
        <h3 className="text-sm font-medium text-white truncate">{ejercicio.nombre}</h3>
        <span className="mt-0.5 inline-block rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
          {groupLabel}
        </span>
        <div className="mt-2 flex gap-2">
          <button
            onClick={() => onEdit(ejercicio)}
            className="flex-1 rounded-md border border-zinc-700 px-2 py-1 text-xs text-zinc-300 active:bg-zinc-800"
          >
            {t.circuitsEdit}
          </button>
          <button
            onClick={() => onDelete(ejercicio.id)}
            className="rounded-md border border-red-900 px-2 py-1 text-xs text-red-400 active:bg-red-950"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
