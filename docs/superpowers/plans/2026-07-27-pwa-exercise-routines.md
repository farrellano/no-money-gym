# PWA Exercise Routines — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a client-side PWA for creating Tabata/circuit exercise routines using locally-stored videos with IndexedDB.

**Architecture:** Next.js 16 App Router with all data in IndexedDB via Dexie.js. Videos stored as Blobs, exercises reference videos by ID. Bottom tab navigation, mobile-first. Manual PWA setup (manifest.ts + service worker).

**Tech Stack:** Next.js 16, TypeScript, Tailwind CSS 4, Dexie.js, dnd-kit, JSZip, Web Speech API, Wake Lock API

---

## File Structure

```
app/
  layout.tsx              — Root layout with bottom tab navigation
  manifest.ts            — PWA manifest (standalone, portrait)
  globals.css            — Tailwind + custom theme vars
  banco-ejercicios/
    page.tsx             — Exercise gallery (server component shell)
  circuitos/
    page.tsx             — Circuit list
    [id]/
      play/
        page.tsx         — Fullscreen playback mode
  ajustes/
    page.tsx             — Settings page
components/
  BottomNav.tsx          — Tab bar navigation
  VideoTrimmer.tsx       — Dual-slider video range selector
  ExerciseCard.tsx       — Gallery card with thumbnail
  ExerciseForm.tsx       — Create/edit exercise form
  CircuitBuilder.tsx     — Drag & drop circuit builder
  CircuitPlayer.tsx      — Fullscreen playback orchestrator
  Timer.tsx              — Countdown timer display
  StorageModal.tsx       — Error modal for storage full
lib/
  db.ts                  — Dexie database schema & instance
  audio.ts              — Audio/voice helper (beeps + speech)
  storage.ts            — Storage estimate & persist helpers
hooks/
  useCircuitTimer.ts    — Timer state machine for playback
  useWakeLock.ts        — Wake Lock API wrapper
public/
  sw.js                 — Service worker (cache app shell)
  icon-192x192.png      — PWA icon (placeholder)
  icon-512x512.png      — PWA icon (placeholder)
```

---

## Task 1: Project Foundation — Dependencies & Database

**Files:**
- Modify: `package.json`
- Create: `lib/db.ts`

- [ ] **Step 1: Install dependencies**

```bash
npm install dexie @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities jszip
```

- [ ] **Step 2: Create database schema**

Create `lib/db.ts`:

```typescript
import Dexie, { type EntityTable } from 'dexie';

export interface VideoRecord {
  id: string;
  blob: Blob;
  duracionTotal: number;
  createdAt: Date;
}

export interface EjercicioRecord {
  id: string;
  nombre: string;
  grupoMuscular: string;
  videoId: string;
  startSec: number;
  endSec: number;
  createdAt: Date;
}

export interface CircuitoEjercicio {
  ejercicioId: string;
  duracionSeg: number;
  descansoSeg: number;
}

export interface CircuitoRecord {
  id: string;
  nombre: string;
  rondas: number;
  ejercicios: CircuitoEjercicio[];
  createdAt: Date;
}

export interface ConfigRecord {
  id: string;
  vozActivada: boolean;
  sonidosActivados: boolean;
  vozLang: string;
}

const db = new Dexie('NoMoneyGymDB') as Dexie & {
  videos: EntityTable<VideoRecord, 'id'>;
  ejercicios: EntityTable<EjercicioRecord, 'id'>;
  circuitos: EntityTable<CircuitoRecord, 'id'>;
  config: EntityTable<ConfigRecord, 'id'>;
};

db.version(1).stores({
  videos: 'id, createdAt',
  ejercicios: 'id, grupoMuscular, videoId, createdAt',
  circuitos: 'id, createdAt',
  config: 'id',
});

export { db };
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json lib/db.ts
git commit -m "feat: add dependencies and Dexie database schema"
```

---

## Task 2: PWA Manifest & Service Worker

**Files:**
- Create: `app/manifest.ts`
- Create: `public/sw.js`
- Create: `public/icon-192x192.png` (placeholder)
- Create: `public/icon-512x512.png` (placeholder)

- [ ] **Step 1: Create PWA manifest**

Create `app/manifest.ts`:

```typescript
import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'No Money Gym',
    short_name: 'NoMoneyGym',
    description: 'Rutinas de ejercicio con videos locales',
    start_url: '/banco-ejercicios',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#0a0a0a',
    theme_color: '#0a0a0a',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
```

- [ ] **Step 2: Create service worker**

Create `public/sw.js`:

```javascript
const CACHE_NAME = 'no-money-gym-v1';

const APP_SHELL = [
  '/',
  '/banco-ejercicios',
  '/circuitos',
  '/ajustes',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => cached);

      return cached || fetchPromise;
    })
  );
});
```

- [ ] **Step 3: Create placeholder icons**

Generate minimal 1x1 PNG placeholders (will be replaced with real icons later):

```bash
# Create minimal placeholder PNGs using base64
echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPj/HwADBwIAMCbHYQAAAABJRU5ErkJggg==" | base64 -d > public/icon-192x192.png
cp public/icon-192x192.png public/icon-512x512.png
```

- [ ] **Step 4: Commit**

```bash
git add app/manifest.ts public/sw.js public/icon-192x192.png public/icon-512x512.png
git commit -m "feat: add PWA manifest and service worker"
```

---

## Task 3: Layout & Bottom Tab Navigation

**Files:**
- Modify: `app/layout.tsx`
- Create: `components/BottomNav.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Create BottomNav component**

Create `components/BottomNav.tsx`:

```typescript
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { href: '/banco-ejercicios', label: 'Ejercicios', icon: '💪' },
  { href: '/circuitos', label: 'Circuitos', icon: '🔄' },
  { href: '/ajustes', label: 'Ajustes', icon: '⚙️' },
];

export function BottomNav() {
  const pathname = usePathname();

  // Hide nav during playback
  if (pathname.endsWith('/play')) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800 bg-zinc-900/95 backdrop-blur-sm safe-bottom">
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-0.5 px-4 py-2 text-xs transition-colors ${
                isActive ? 'text-white' : 'text-zinc-500'
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Update root layout**

Replace `app/layout.tsx`:

```typescript
import type { Metadata, Viewport } from 'next';
import { Geist } from 'next/font/google';
import { BottomNav } from '@/components/BottomNav';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'No Money Gym',
  description: 'Rutinas de ejercicio con videos locales',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0a0a0a',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${geistSans.variable} h-full`}>
      <body className="min-h-full bg-zinc-950 text-white font-sans pb-16">
        <main className="flex-1">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Update globals.css for dark mobile-first theme**

Replace `app/globals.css`:

```css
@import "tailwindcss";

@theme inline {
  --font-sans: var(--font-geist-sans);
}

/* Safe area for bottom nav on notched devices */
.safe-bottom {
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
```

- [ ] **Step 4: Create placeholder pages**

Create `app/banco-ejercicios/page.tsx`:

```typescript
export default function BancoEjerciciosPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Banco de Ejercicios</h1>
    </div>
  );
}
```

Create `app/circuitos/page.tsx`:

```typescript
export default function CircuitosPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Circuitos</h1>
    </div>
  );
}
```

Create `app/ajustes/page.tsx`:

```typescript
export default function AjustesPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Ajustes</h1>
    </div>
  );
}
```

- [ ] **Step 5: Update app/page.tsx to redirect**

Replace `app/page.tsx`:

```typescript
import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/banco-ejercicios');
}
```

- [ ] **Step 6: Verify build**

```bash
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add layout with bottom tab navigation and route structure"
```

---

## Task 4: Storage Utilities & Modal

**Files:**
- Create: `lib/storage.ts`
- Create: `components/StorageModal.tsx`

- [ ] **Step 1: Create storage utilities**

Create `lib/storage.ts`:

```typescript
export async function requestPersistentStorage(): Promise<boolean> {
  if (navigator.storage && navigator.storage.persist) {
    return navigator.storage.persist();
  }
  return false;
}

export interface StorageEstimate {
  usage: number;
  quota: number;
  usagePercent: number;
}

export async function getStorageEstimate(): Promise<StorageEstimate> {
  if (navigator.storage && navigator.storage.estimate) {
    const { usage = 0, quota = 0 } = await navigator.storage.estimate();
    return {
      usage,
      quota,
      usagePercent: quota > 0 ? (usage / quota) * 100 : 0,
    };
  }
  return { usage: 0, quota: 0, usagePercent: 0 };
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
```

- [ ] **Step 2: Create StorageModal component**

Create `components/StorageModal.tsx`:

```typescript
'use client';

interface StorageModalProps {
  open: boolean;
  onClose: () => void;
}

export function StorageModal({ open, onClose }: StorageModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-sm rounded-xl bg-zinc-800 p-6 shadow-xl">
        <h2 className="text-lg font-bold text-white">Almacenamiento lleno</h2>
        <p className="mt-2 text-sm text-zinc-300">
          No hay suficiente espacio para guardar este video. Elimina ejercicios
          que ya no uses desde el banco de ejercicios, o revisa el uso de
          almacenamiento en Ajustes.
        </p>
        <button
          onClick={onClose}
          className="mt-4 w-full rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-900 active:bg-zinc-200"
        >
          Entendido
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add lib/storage.ts components/StorageModal.tsx
git commit -m "feat: add storage utilities and error modal"
```

---

## Task 5: Video Upload & Exercise Form

**Files:**
- Create: `components/ExerciseForm.tsx`
- Create: `components/VideoTrimmer.tsx`

- [ ] **Step 1: Create VideoTrimmer component**

Create `components/VideoTrimmer.tsx`:

```typescript
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
```

- [ ] **Step 2: Create ExerciseForm component**

Create `components/ExerciseForm.tsx`:

```typescript
'use client';

import { useState, useEffect, useCallback } from 'react';
import { db, type EjercicioRecord, type VideoRecord } from '@/lib/db';
import { VideoTrimmer } from './VideoTrimmer';
import { StorageModal } from './StorageModal';

const GRUPOS_MUSCULARES = [
  'pierna',
  'espalda',
  'pecho',
  'hombro',
  'brazo',
  'core',
  'glúteo',
  'cardio',
] as const;

interface ExerciseFormProps {
  ejercicio?: EjercicioRecord;
  onSaved: () => void;
  onCancel: () => void;
}

export function ExerciseForm({ ejercicio, onSaved, onCancel }: ExerciseFormProps) {
  const [nombre, setNombre] = useState(ejercicio?.nombre ?? '');
  const [grupoMuscular, setGrupoMuscular] = useState(ejercicio?.grupoMuscular ?? GRUPOS_MUSCULARES[0]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [startSec, setStartSec] = useState(ejercicio?.startSec ?? 0);
  const [endSec, setEndSec] = useState(ejercicio?.endSec ?? 0);
  const [saving, setSaving] = useState(false);
  const [storageError, setStorageError] = useState(false);

  // Load existing video URL for edit mode
  useEffect(() => {
    if (ejercicio?.videoId) {
      db.videos.get(ejercicio.videoId).then((video) => {
        if (video) {
          const url = URL.createObjectURL(video.blob);
          setVideoUrl(url);
          setDuration(video.duracionTotal);
        }
      });
    }
  }, [ejercicio?.videoId]);

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    };
  }, [videoUrl]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setVideoFile(file);
    if (videoUrl) URL.revokeObjectURL(videoUrl);

    const url = URL.createObjectURL(file);
    setVideoUrl(url);

    // Get duration from video metadata
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      setDuration(video.duration);
      setStartSec(0);
      setEndSec(video.duration);
      URL.revokeObjectURL(video.src);
    };
    video.src = URL.createObjectURL(file);
  }, [videoUrl]);

  const handleSave = async () => {
    if (!nombre.trim() || (!videoFile && !ejercicio?.videoId)) return;

    setSaving(true);
    try {
      let videoId = ejercicio?.videoId ?? '';

      if (videoFile) {
        videoId = crypto.randomUUID();
        await db.videos.put({
          id: videoId,
          blob: videoFile,
          duracionTotal: duration,
          createdAt: new Date(),
        });
      }

      const record: EjercicioRecord = {
        id: ejercicio?.id ?? crypto.randomUUID(),
        nombre: nombre.trim(),
        grupoMuscular,
        videoId,
        startSec,
        endSec,
        createdAt: ejercicio?.createdAt ?? new Date(),
      };

      await db.ejercicios.put(record);
      onSaved();
    } catch (err) {
      if (err instanceof DOMException && err.name === 'QuotaExceededError') {
        setStorageError(true);
      } else {
        throw err;
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">
          {ejercicio ? 'Editar ejercicio' : 'Nuevo ejercicio'}
        </h2>
        <button onClick={onCancel} className="text-sm text-zinc-400">
          Cancelar
        </button>
      </div>

      {!videoUrl && (
        <label className="flex h-40 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-700 text-zinc-400 active:border-zinc-500">
          <span className="text-3xl">📹</span>
          <span className="mt-1 text-sm">Seleccionar video</span>
          <input
            type="file"
            accept="video/*"
            className="hidden"
            onChange={handleFileSelect}
          />
        </label>
      )}

      {videoUrl && duration > 0 && (
        <VideoTrimmer
          videoUrl={videoUrl}
          duration={duration}
          startSec={startSec}
          endSec={endSec}
          onRangeChange={(s, e) => {
            setStartSec(s);
            setEndSec(e);
          }}
        />
      )}

      <div className="space-y-3">
        <div>
          <label className="text-xs text-zinc-500">Nombre del ejercicio</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Sentadillas con salto"
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-500"
          />
        </div>

        <div>
          <label className="text-xs text-zinc-500">Grupo muscular</label>
          <select
            value={grupoMuscular}
            onChange={(e) => setGrupoMuscular(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white"
          >
            {GRUPOS_MUSCULARES.map((g) => (
              <option key={g} value={g}>
                {g.charAt(0).toUpperCase() + g.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving || !nombre.trim() || (!videoFile && !ejercicio?.videoId)}
        className="w-full rounded-lg bg-white px-4 py-3 text-sm font-medium text-zinc-900 disabled:opacity-50 active:bg-zinc-200"
      >
        {saving ? 'Guardando...' : 'Guardar ejercicio'}
      </button>

      <StorageModal open={storageError} onClose={() => setStorageError(false)} />
    </div>
  );
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components/VideoTrimmer.tsx components/ExerciseForm.tsx
git commit -m "feat: add video trimmer and exercise form components"
```

---

## Task 6: Exercise Card & Gallery Page

**Files:**
- Create: `components/ExerciseCard.tsx`
- Modify: `app/banco-ejercicios/page.tsx`

- [ ] **Step 1: Create ExerciseCard component**

Create `components/ExerciseCard.tsx`:

```typescript
'use client';

import { useEffect, useRef, useState } from 'react';
import { db, type EjercicioRecord } from '@/lib/db';

interface ExerciseCardProps {
  ejercicio: EjercicioRecord;
  onEdit: (ejercicio: EjercicioRecord) => void;
  onDelete: (id: string) => void;
}

export function ExerciseCard({ ejercicio, onEdit, onDelete }: ExerciseCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [thumbnailReady, setThumbnailReady] = useState(false);

  // Generate thumbnail from video at startSec
  useEffect(() => {
    let url: string | null = null;

    db.videos.get(ejercicio.videoId).then((video) => {
      if (!video || !canvasRef.current) return;

      url = URL.createObjectURL(video.blob);
      const videoEl = document.createElement('video');
      videoEl.preload = 'metadata';
      videoEl.muted = true;
      videoEl.playsInline = true;

      videoEl.onloadeddata = () => {
        videoEl.currentTime = ejercicio.startSec;
      };

      videoEl.onseeked = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = videoEl.videoWidth;
        canvas.height = videoEl.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(videoEl, 0, 0);
          setThumbnailReady(true);
        }
        if (url) URL.revokeObjectURL(url);
      };

      videoEl.src = url;
    });

    return () => {
      if (url) URL.revokeObjectURL(url);
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
          {ejercicio.grupoMuscular}
        </span>
        <div className="mt-2 flex gap-2">
          <button
            onClick={() => onEdit(ejercicio)}
            className="flex-1 rounded-md border border-zinc-700 px-2 py-1 text-xs text-zinc-300 active:bg-zinc-800"
          >
            Editar
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
```

- [ ] **Step 2: Build the gallery page**

Replace `app/banco-ejercicios/page.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type EjercicioRecord } from '@/lib/db';
import { ExerciseCard } from '@/components/ExerciseCard';
import { ExerciseForm } from '@/components/ExerciseForm';

const GRUPOS_MUSCULARES = [
  'todos',
  'pierna',
  'espalda',
  'pecho',
  'hombro',
  'brazo',
  'core',
  'glúteo',
  'cardio',
];

export default function BancoEjerciciosPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingEjercicio, setEditingEjercicio] = useState<EjercicioRecord | undefined>();
  const [filtro, setFiltro] = useState('todos');

  const ejercicios = useLiveQuery(() => {
    if (filtro === 'todos') {
      return db.ejercicios.orderBy('createdAt').reverse().toArray();
    }
    return db.ejercicios
      .where('grupoMuscular')
      .equals(filtro)
      .reverse()
      .sortBy('createdAt');
  }, [filtro]);

  const handleEdit = (ej: EjercicioRecord) => {
    setEditingEjercicio(ej);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    const ej = await db.ejercicios.get(id);
    if (!ej) return;

    // Check if video is used by other exercises
    const otherUses = await db.ejercicios
      .where('videoId')
      .equals(ej.videoId)
      .count();

    await db.ejercicios.delete(id);

    // Delete video if no other exercise uses it
    if (otherUses <= 1) {
      await db.videos.delete(ej.videoId);
    }
  };

  const handleSaved = () => {
    setShowForm(false);
    setEditingEjercicio(undefined);
  };

  if (showForm) {
    return (
      <ExerciseForm
        ejercicio={editingEjercicio}
        onSaved={handleSaved}
        onCancel={() => {
          setShowForm(false);
          setEditingEjercicio(undefined);
        }}
      />
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Ejercicios</h1>
        <button
          onClick={() => setShowForm(true)}
          className="rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-zinc-900 active:bg-zinc-200"
        >
          + Nuevo
        </button>
      </div>

      {/* Muscle group filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none">
        {GRUPOS_MUSCULARES.map((g) => (
          <button
            key={g}
            onClick={() => setFiltro(g)}
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              filtro === g
                ? 'bg-white text-zinc-900'
                : 'bg-zinc-800 text-zinc-400'
            }`}
          >
            {g.charAt(0).toUpperCase() + g.slice(1)}
          </button>
        ))}
      </div>

      {/* Gallery grid */}
      {ejercicios && ejercicios.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {ejercicios.map((ej) => (
            <ExerciseCard
              key={ej.id}
              ejercicio={ej}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
          <span className="text-4xl">💪</span>
          <p className="mt-2 text-sm">No hay ejercicios aún</p>
          <p className="text-xs">Toca "+ Nuevo" para agregar uno</p>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Install dexie-react-hooks**

```bash
npm install dexie-react-hooks
```

- [ ] **Step 4: Verify build**

```bash
npm run build
```

Expected: Build succeeds.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add exercise gallery with cards, filters, and CRUD"
```

---

## Task 7: Circuit Builder

**Files:**
- Create: `components/CircuitBuilder.tsx`
- Modify: `app/circuitos/page.tsx`

- [ ] **Step 1: Create CircuitBuilder component**

Create `components/CircuitBuilder.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { db, type CircuitoEjercicio, type EjercicioRecord } from '@/lib/db';

interface SortableItemProps {
  id: string;
  ejercicio: EjercicioRecord;
  config: CircuitoEjercicio;
  onConfigChange: (ejercicioId: string, field: 'duracionSeg' | 'descansoSeg', value: number) => void;
  onRemove: (ejercicioId: string) => void;
}

function SortableItem({ id, ejercicio, config, onConfigChange, onRemove }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="rounded-lg border border-zinc-700 bg-zinc-800 p-3">
      <div className="flex items-center gap-2">
        <button {...attributes} {...listeners} className="cursor-grab text-zinc-500 active:cursor-grabbing">
          ⠿
        </button>
        <span className="flex-1 text-sm font-medium text-white truncate">{ejercicio.nombre}</span>
        <button onClick={() => onRemove(config.ejercicioId)} className="text-xs text-red-400">✕</button>
      </div>
      <div className="mt-2 flex gap-3">
        <div className="flex-1">
          <label className="text-[10px] text-zinc-500">Trabajo (s)</label>
          <input
            type="number"
            min={5}
            max={120}
            value={config.duracionSeg}
            onChange={(e) => onConfigChange(config.ejercicioId, 'duracionSeg', parseInt(e.target.value) || 30)}
            className="mt-0.5 w-full rounded border border-zinc-600 bg-zinc-900 px-2 py-1 text-xs text-white"
          />
        </div>
        <div className="flex-1">
          <label className="text-[10px] text-zinc-500">Descanso (s)</label>
          <input
            type="number"
            min={0}
            max={60}
            value={config.descansoSeg}
            onChange={(e) => onConfigChange(config.ejercicioId, 'descansoSeg', parseInt(e.target.value) || 10)}
            className="mt-0.5 w-full rounded border border-zinc-600 bg-zinc-900 px-2 py-1 text-xs text-white"
          />
        </div>
      </div>
    </div>
  );
}

interface CircuitBuilderProps {
  circuitoId?: string;
  onSaved: () => void;
  onCancel: () => void;
}

export function CircuitBuilder({ circuitoId, onSaved, onCancel }: CircuitBuilderProps) {
  const [nombre, setNombre] = useState('');
  const [rondas, setRondas] = useState(3);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [ejerciciosConfig, setEjerciciosConfig] = useState<CircuitoEjercicio[]>([]);
  const [showSelector, setShowSelector] = useState(false);

  const allEjercicios = useLiveQuery(() => db.ejercicios.toArray());

  // Load existing circuit for editing
  useEffect(() => {
    if (circuitoId) {
      db.circuitos.get(circuitoId).then((c) => {
        if (c) {
          setNombre(c.nombre);
          setRondas(c.rondas);
          setEjerciciosConfig(c.ejercicios);
          setSelectedIds(c.ejercicios.map((e) => e.ejercicioId));
        }
      });
    }
  }, [circuitoId]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = ejerciciosConfig.findIndex((e) => e.ejercicioId === active.id);
      const newIndex = ejerciciosConfig.findIndex((e) => e.ejercicioId === over.id);
      setEjerciciosConfig(arrayMove(ejerciciosConfig, oldIndex, newIndex));
    }
  };

  const handleToggleEjercicio = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((sid) => sid !== id));
      setEjerciciosConfig(ejerciciosConfig.filter((e) => e.ejercicioId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
      setEjerciciosConfig([...ejerciciosConfig, { ejercicioId: id, duracionSeg: 30, descansoSeg: 10 }]);
    }
  };

  const handleConfigChange = (ejercicioId: string, field: 'duracionSeg' | 'descansoSeg', value: number) => {
    setEjerciciosConfig(
      ejerciciosConfig.map((e) =>
        e.ejercicioId === ejercicioId ? { ...e, [field]: value } : e
      )
    );
  };

  const handleRemove = (ejercicioId: string) => {
    setSelectedIds(selectedIds.filter((id) => id !== ejercicioId));
    setEjerciciosConfig(ejerciciosConfig.filter((e) => e.ejercicioId !== ejercicioId));
  };

  const handleSave = async () => {
    if (!nombre.trim() || ejerciciosConfig.length === 0) return;

    await db.circuitos.put({
      id: circuitoId ?? crypto.randomUUID(),
      nombre: nombre.trim(),
      rondas,
      ejercicios: ejerciciosConfig,
      createdAt: new Date(),
    });

    onSaved();
  };

  const ejerciciosMap = new Map(allEjercicios?.map((e) => [e.id, e]) ?? []);

  if (showSelector) {
    return (
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Seleccionar ejercicios</h2>
          <button onClick={() => setShowSelector(false)} className="text-sm text-zinc-400">
            Listo ({selectedIds.length})
          </button>
        </div>
        <div className="space-y-2">
          {allEjercicios?.map((ej) => (
            <button
              key={ej.id}
              onClick={() => handleToggleEjercicio(ej.id)}
              className={`w-full rounded-lg border p-3 text-left text-sm ${
                selectedIds.includes(ej.id)
                  ? 'border-white bg-zinc-800 text-white'
                  : 'border-zinc-700 text-zinc-400'
              }`}
            >
              <span className="font-medium">{ej.nombre}</span>
              <span className="ml-2 text-xs text-zinc-500">{ej.grupoMuscular}</span>
            </button>
          ))}
          {(!allEjercicios || allEjercicios.length === 0) && (
            <p className="text-center text-sm text-zinc-500 py-8">
              No hay ejercicios. Crea algunos primero en el banco.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">{circuitoId ? 'Editar circuito' : 'Nuevo circuito'}</h2>
        <button onClick={onCancel} className="text-sm text-zinc-400">Cancelar</button>
      </div>

      <div>
        <label className="text-xs text-zinc-500">Nombre del circuito</label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej: Tabata piernas"
          className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-500"
        />
      </div>

      <div>
        <label className="text-xs text-zinc-500">Rondas</label>
        <input
          type="number"
          min={1}
          max={20}
          value={rondas}
          onChange={(e) => setRondas(parseInt(e.target.value) || 1)}
          className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white"
        />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label className="text-xs text-zinc-500">Ejercicios ({ejerciciosConfig.length})</label>
          <button
            onClick={() => setShowSelector(true)}
            className="text-xs text-white underline"
          >
            + Agregar
          </button>
        </div>

        {ejerciciosConfig.length > 0 && (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext
              items={ejerciciosConfig.map((e) => e.ejercicioId)}
              strategy={verticalListSortingStrategy}
            >
              <div className="mt-2 space-y-2">
                {ejerciciosConfig.map((config) => {
                  const ej = ejerciciosMap.get(config.ejercicioId);
                  if (!ej) return null;
                  return (
                    <SortableItem
                      key={config.ejercicioId}
                      id={config.ejercicioId}
                      ejercicio={ej}
                      config={config}
                      onConfigChange={handleConfigChange}
                      onRemove={handleRemove}
                    />
                  );
                })}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      <button
        onClick={handleSave}
        disabled={!nombre.trim() || ejerciciosConfig.length === 0}
        className="w-full rounded-lg bg-white px-4 py-3 text-sm font-medium text-zinc-900 disabled:opacity-50 active:bg-zinc-200"
      >
        Guardar circuito
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Build the circuits list page**

Replace `app/circuitos/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import Link from 'next/link';
import { db } from '@/lib/db';
import { CircuitBuilder } from '@/components/CircuitBuilder';

export default function CircuitosPage() {
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>();

  const circuitos = useLiveQuery(() =>
    db.circuitos.orderBy('createdAt').reverse().toArray()
  );

  const handleDelete = async (id: string) => {
    await db.circuitos.delete(id);
  };

  if (showBuilder) {
    return (
      <CircuitBuilder
        circuitoId={editingId}
        onSaved={() => {
          setShowBuilder(false);
          setEditingId(undefined);
        }}
        onCancel={() => {
          setShowBuilder(false);
          setEditingId(undefined);
        }}
      />
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Circuitos</h1>
        <button
          onClick={() => setShowBuilder(true)}
          className="rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-zinc-900 active:bg-zinc-200"
        >
          + Nuevo
        </button>
      </div>

      {circuitos && circuitos.length > 0 ? (
        <div className="space-y-3">
          {circuitos.map((c) => (
            <div key={c.id} className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-white">{c.nombre}</h3>
                  <p className="text-xs text-zinc-400">
                    {c.ejercicios.length} ejercicios · {c.rondas} rondas
                  </p>
                </div>
                <Link
                  href={`/circuitos/${c.id}/play`}
                  className="rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white active:bg-green-700"
                >
                  ▶ Iniciar
                </Link>
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => {
                    setEditingId(c.id);
                    setShowBuilder(true);
                  }}
                  className="rounded-md border border-zinc-700 px-3 py-1 text-xs text-zinc-300 active:bg-zinc-800"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(c.id)}
                  className="rounded-md border border-red-900 px-3 py-1 text-xs text-red-400 active:bg-red-950"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
          <span className="text-4xl">🔄</span>
          <p className="mt-2 text-sm">No hay circuitos aún</p>
          <p className="text-xs">Crea ejercicios primero, luego arma circuitos</p>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Create route folder for play page**

Create `app/circuitos/[id]/play/page.tsx`:

```typescript
export default function PlayPage() {
  return (
    <div className="flex items-center justify-center h-screen bg-black text-white">
      <p>Cargando reproductor...</p>
    </div>
  );
}
```

- [ ] **Step 4: Verify build**

```bash
npm run build
```

Expected: Build succeeds.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add circuit builder with drag-and-drop and circuit list"
```

---

## Task 8: Audio & Wake Lock Hooks

**Files:**
- Create: `lib/audio.ts`
- Create: `hooks/useWakeLock.ts`
- Create: `hooks/useCircuitTimer.ts`

- [ ] **Step 1: Create audio utility**

Create `lib/audio.ts`:

```typescript
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

export function playBeep(frequency = 800, durationMs = 200): void {
  const ctx = getAudioContext();
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.connect(gain);
  gain.connect(ctx.destination);

  oscillator.frequency.value = frequency;
  oscillator.type = 'sine';
  gain.gain.value = 0.3;

  oscillator.start();
  oscillator.stop(ctx.currentTime + durationMs / 1000);
}

export function playCountdownBeep(): void {
  playBeep(600, 150);
}

export function speak(text: string, lang = 'es-ES'): void {
  if (!('speechSynthesis' in window)) return;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 1.0;
  utterance.volume = 1.0;
  window.speechSynthesis.speak(utterance);
}
```

- [ ] **Step 2: Create Wake Lock hook**

Create `hooks/useWakeLock.ts`:

```typescript
'use client';

import { useRef, useCallback } from 'react';

export function useWakeLock() {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  const request = useCallback(async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
      }
    } catch {
      // Wake Lock not supported or denied
    }
  }, []);

  const release = useCallback(async () => {
    if (wakeLockRef.current) {
      await wakeLockRef.current.release();
      wakeLockRef.current = null;
    }
  }, []);

  return { request, release };
}
```

- [ ] **Step 3: Create circuit timer hook**

Create `hooks/useCircuitTimer.ts`:

```typescript
'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { type CircuitoEjercicio } from '@/lib/db';
import { playBeep, playCountdownBeep, speak } from '@/lib/audio';

export type TimerPhase = 'work' | 'rest' | 'finished';

export interface TimerState {
  phase: TimerPhase;
  secondsLeft: number;
  currentExerciseIndex: number;
  currentRound: number;
  totalRounds: number;
  isRunning: boolean;
}

interface UseCircuitTimerOptions {
  ejercicios: CircuitoEjercicio[];
  rondas: number;
  vozActivada: boolean;
  sonidosActivados: boolean;
  onFinished: () => void;
}

export function useCircuitTimer({
  ejercicios,
  rondas,
  vozActivada,
  sonidosActivados,
  onFinished,
}: UseCircuitTimerOptions) {
  const [state, setState] = useState<TimerState>({
    phase: 'work',
    secondsLeft: ejercicios[0]?.duracionSeg ?? 30,
    currentExerciseIndex: 0,
    currentRound: 1,
    totalRounds: rondas,
    isRunning: false,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  const announceExercise = useCallback(
    (name: string) => {
      if (sonidosActivados) playBeep();
      if (vozActivada) speak(`Ejercicio: ${name}`);
    },
    [vozActivada, sonidosActivados]
  );

  const tick = useCallback(() => {
    const s = stateRef.current;
    const newSeconds = s.secondsLeft - 1;

    // Countdown beeps at 3, 2, 1
    if (newSeconds <= 3 && newSeconds > 0 && sonidosActivados) {
      playCountdownBeep();
    }

    // Prepare announcement at 3s remaining in rest
    if (s.phase === 'rest' && newSeconds === 3 && vozActivada) {
      speak('Prepárate');
    }

    if (newSeconds <= 0) {
      // Transition to next phase
      if (s.phase === 'work') {
        const currentEj = ejercicios[s.currentExerciseIndex];
        if (currentEj.descansoSeg > 0) {
          if (vozActivada) speak('Descanso');
          setState((prev) => ({ ...prev, phase: 'rest', secondsLeft: currentEj.descansoSeg }));
        } else {
          // No rest, go directly to next exercise
          advanceExercise(s);
        }
      } else if (s.phase === 'rest') {
        advanceExercise(s);
      }
    } else {
      setState((prev) => ({ ...prev, secondsLeft: newSeconds }));
    }
  }, [ejercicios, vozActivada, sonidosActivados]);

  const advanceExercise = useCallback(
    (s: TimerState) => {
      const nextIndex = s.currentExerciseIndex + 1;

      if (nextIndex >= ejercicios.length) {
        // End of round
        const nextRound = s.currentRound + 1;
        if (nextRound > rondas) {
          // Circuit complete
          if (vozActivada) speak('Circuito completado');
          setState((prev) => ({ ...prev, phase: 'finished', isRunning: false, secondsLeft: 0 }));
          if (intervalRef.current) clearInterval(intervalRef.current);
          onFinished();
          return;
        }
        // Start next round from first exercise
        setState((prev) => ({
          ...prev,
          phase: 'work',
          currentExerciseIndex: 0,
          currentRound: nextRound,
          secondsLeft: ejercicios[0].duracionSeg,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          phase: 'work',
          currentExerciseIndex: nextIndex,
          secondsLeft: ejercicios[nextIndex].duracionSeg,
        }));
      }
    },
    [ejercicios, rondas, vozActivada, onFinished]
  );

  const start = useCallback(() => {
    setState((prev) => ({ ...prev, isRunning: true }));
    intervalRef.current = setInterval(tick, 1000);
  }, [tick]);

  const pause = useCallback(() => {
    setState((prev) => ({ ...prev, isRunning: false }));
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    pause();
    setState({
      phase: 'work',
      secondsLeft: ejercicios[0]?.duracionSeg ?? 30,
      currentExerciseIndex: 0,
      currentRound: 1,
      totalRounds: rondas,
      isRunning: false,
    });
  }, [ejercicios, rondas, pause]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return { state, start, pause, reset, announceExercise };
}
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add lib/audio.ts hooks/useWakeLock.ts hooks/useCircuitTimer.ts
git commit -m "feat: add audio utilities, wake lock hook, and circuit timer"
```

---

## Task 9: Circuit Playback Mode

**Files:**
- Create: `components/CircuitPlayer.tsx`
- Create: `components/Timer.tsx`
- Modify: `app/circuitos/[id]/play/page.tsx`

- [ ] **Step 1: Create Timer component**

Create `components/Timer.tsx`:

```typescript
'use client';

import { type TimerPhase } from '@/hooks/useCircuitTimer';

interface TimerProps {
  secondsLeft: number;
  phase: TimerPhase;
}

export function Timer({ secondsLeft, phase }: TimerProps) {
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const display = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  const phaseColors: Record<TimerPhase, string> = {
    work: 'text-green-400',
    rest: 'text-yellow-400',
    finished: 'text-white',
  };

  const phaseLabels: Record<TimerPhase, string> = {
    work: 'TRABAJO',
    rest: 'DESCANSO',
    finished: 'COMPLETADO',
  };

  return (
    <div className="flex flex-col items-center">
      <span className="text-sm font-medium uppercase tracking-widest text-zinc-400">
        {phaseLabels[phase]}
      </span>
      <span className={`text-7xl font-bold tabular-nums ${phaseColors[phase]}`}>
        {display}
      </span>
    </div>
  );
}
```

- [ ] **Step 2: Create CircuitPlayer component**

Create `components/CircuitPlayer.tsx`:

```typescript
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { db, type CircuitoRecord, type EjercicioRecord, type ConfigRecord } from '@/lib/db';
import { useCircuitTimer } from '@/hooks/useCircuitTimer';
import { useWakeLock } from '@/hooks/useWakeLock';
import { Timer } from './Timer';

interface CircuitPlayerProps {
  circuito: CircuitoRecord;
  ejercicios: EjercicioRecord[];
  config: ConfigRecord;
  onExit: () => void;
}

export function CircuitPlayer({ circuito, ejercicios, config, onExit }: CircuitPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const wakeLock = useWakeLock();

  const ejerciciosMap = new Map(ejercicios.map((e) => [e.id, e]));

  const { state, start, pause, reset, announceExercise } = useCircuitTimer({
    ejercicios: circuito.ejercicios,
    rondas: circuito.rondas,
    vozActivada: config.vozActivada,
    sonidosActivados: config.sonidosActivados,
    onFinished: () => {
      wakeLock.release();
    },
  });

  const currentEjConfig = circuito.ejercicios[state.currentExerciseIndex];
  const currentEjercicio = currentEjConfig ? ejerciciosMap.get(currentEjConfig.ejercicioId) : null;

  // Load video for current exercise
  useEffect(() => {
    if (!currentEjercicio) return;

    let url: string | null = null;
    db.videos.get(currentEjercicio.videoId).then((video) => {
      if (video) {
        url = URL.createObjectURL(video.blob);
        setVideoUrl(url);
      }
    });

    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [currentEjercicio?.videoId]);

  // Loop video between startSec and endSec
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !currentEjercicio) return;

    const handleTimeUpdate = () => {
      if (video.currentTime >= currentEjercicio.endSec) {
        video.currentTime = currentEjercicio.startSec;
      }
    };

    const handleLoadedData = () => {
      video.currentTime = currentEjercicio.startSec;
      if (state.isRunning && state.phase === 'work') {
        video.play();
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadeddata', handleLoadedData);
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadeddata', handleLoadedData);
    };
  }, [currentEjercicio, state.isRunning, state.phase]);

  // Announce exercise on change
  useEffect(() => {
    if (currentEjercicio && state.isRunning && state.phase === 'work') {
      announceExercise(currentEjercicio.nombre);
    }
  }, [state.currentExerciseIndex, state.currentRound]);

  // Pause/play video based on state
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (state.isRunning && state.phase === 'work') {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [state.isRunning, state.phase]);

  const handleStart = useCallback(() => {
    wakeLock.request();
    if (currentEjercicio) {
      announceExercise(currentEjercicio.nombre);
    }
    start();
  }, [start, wakeLock, announceExercise, currentEjercicio]);

  const handleExit = () => {
    pause();
    wakeLock.release();
    onExit();
  };

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-black">
      {/* Video */}
      <div className="flex-1 relative">
        {videoUrl && (
          <video
            ref={videoRef}
            src={videoUrl}
            className="absolute inset-0 w-full h-full object-contain"
            playsInline
            muted
            loop={false}
          />
        )}

        {/* Overlay: round info */}
        <div className="absolute top-4 left-4 rounded-full bg-black/60 px-3 py-1 text-xs text-white">
          Ronda {state.currentRound}/{state.totalRounds}
        </div>

        {/* Exit button */}
        <button
          onClick={handleExit}
          className="absolute top-4 right-4 rounded-full bg-black/60 px-3 py-1 text-xs text-white"
        >
          ✕ Salir
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-4 bg-zinc-900 px-4 py-6 safe-bottom">
        {currentEjercicio && (
          <p className="text-sm font-medium text-white">{currentEjercicio.nombre}</p>
        )}

        <Timer secondsLeft={state.secondsLeft} phase={state.phase} />

        <div className="flex gap-4">
          {state.phase === 'finished' ? (
            <button
              onClick={handleExit}
              className="rounded-lg bg-white px-6 py-3 text-sm font-medium text-zinc-900"
            >
              Terminar
            </button>
          ) : state.isRunning ? (
            <button
              onClick={pause}
              className="rounded-lg border border-zinc-600 px-6 py-3 text-sm text-white"
            >
              ⏸ Pausar
            </button>
          ) : (
            <>
              <button
                onClick={handleStart}
                className="rounded-lg bg-green-600 px-6 py-3 text-sm font-medium text-white"
              >
                ▶ {state.secondsLeft === circuito.ejercicios[0]?.duracionSeg && state.currentRound === 1 ? 'Iniciar' : 'Continuar'}
              </button>
              <button
                onClick={reset}
                className="rounded-lg border border-zinc-600 px-6 py-3 text-sm text-white"
              >
                ↺ Reiniciar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Build the play page**

Replace `app/circuitos/[id]/play/page.tsx`:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { db, type CircuitoRecord, type EjercicioRecord, type ConfigRecord } from '@/lib/db';
import { CircuitPlayer } from '@/components/CircuitPlayer';

export default function PlayPage() {
  const params = useParams();
  const router = useRouter();
  const [circuito, setCircuito] = useState<CircuitoRecord | null>(null);
  const [ejercicios, setEjercicios] = useState<EjercicioRecord[]>([]);
  const [config, setConfig] = useState<ConfigRecord | null>(null);

  useEffect(() => {
    const id = params.id as string;

    Promise.all([
      db.circuitos.get(id),
      db.ejercicios.toArray(),
      db.config.get('1'),
    ]).then(([c, allEj, cfg]) => {
      if (!c) {
        router.replace('/circuitos');
        return;
      }
      setCircuito(c);
      setEjercicios(allEj);
      setConfig(
        cfg ?? { id: '1', vozActivada: true, sonidosActivados: true, vozLang: 'es-ES' }
      );
    });
  }, [params.id, router]);

  if (!circuito || !config) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <CircuitPlayer
      circuito={circuito}
      ejercicios={ejercicios}
      config={config}
      onExit={() => router.push('/circuitos')}
    />
  );
}
```

- [ ] **Step 4: Verify build**

```bash
npm run build
```

Expected: Build succeeds.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add circuit playback mode with timer, video loop, and audio"
```

---

## Task 10: Settings Page

**Files:**
- Modify: `app/ajustes/page.tsx`

- [ ] **Step 1: Build the settings page**

Replace `app/ajustes/page.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { db, type ConfigRecord } from '@/lib/db';
import { getStorageEstimate, formatBytes, requestPersistentStorage } from '@/lib/storage';

export default function AjustesPage() {
  const [config, setConfig] = useState<ConfigRecord>({
    id: '1',
    vozActivada: true,
    sonidosActivados: true,
    vozLang: 'es-ES',
  });
  const [storageUsage, setStorageUsage] = useState('');
  const [storageQuota, setStorageQuota] = useState('');
  const [persistent, setPersistent] = useState(false);

  useEffect(() => {
    // Load config
    db.config.get('1').then((cfg) => {
      if (cfg) setConfig(cfg);
    });

    // Load storage info
    getStorageEstimate().then((est) => {
      setStorageUsage(formatBytes(est.usage));
      setStorageQuota(formatBytes(est.quota));
    });

    // Check persistence
    if (navigator.storage && navigator.storage.persisted) {
      navigator.storage.persisted().then(setPersistent);
    }
  }, []);

  const updateConfig = async (updates: Partial<ConfigRecord>) => {
    const updated = { ...config, ...updates };
    setConfig(updated);
    await db.config.put(updated);
  };

  const handleRequestPersistence = async () => {
    const granted = await requestPersistentStorage();
    setPersistent(granted);
  };

  const handleExport = async () => {
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    const ejercicios = await db.ejercicios.toArray();
    const circuitos = await db.circuitos.toArray();
    const videos = await db.videos.toArray();

    zip.file('ejercicios.json', JSON.stringify(ejercicios));
    zip.file('circuitos.json', JSON.stringify(circuitos));

    const videosFolder = zip.folder('videos')!;
    for (const video of videos) {
      videosFolder.file(`${video.id}.blob`, video.blob);
      videosFolder.file(`${video.id}.json`, JSON.stringify({
        id: video.id,
        duracionTotal: video.duracionTotal,
        createdAt: video.createdAt,
      }));
    }

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `no-money-gym-backup-${new Date().toISOString().slice(0, 10)}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const JSZip = (await import('jszip')).default;
    const zip = await JSZip.loadAsync(file);

    // Import exercises
    const ejerciciosJson = await zip.file('ejercicios.json')?.async('string');
    if (ejerciciosJson) {
      const ejercicios = JSON.parse(ejerciciosJson);
      await db.ejercicios.bulkPut(ejercicios);
    }

    // Import circuits
    const circuitosJson = await zip.file('circuitos.json')?.async('string');
    if (circuitosJson) {
      const circuitos = JSON.parse(circuitosJson);
      await db.circuitos.bulkPut(circuitos);
    }

    // Import videos
    const videosFolder = zip.folder('videos');
    if (videosFolder) {
      const metaFiles = Object.keys(zip.files).filter(
        (name) => name.startsWith('videos/') && name.endsWith('.json')
      );

      for (const metaPath of metaFiles) {
        const metaJson = await zip.file(metaPath)?.async('string');
        if (!metaJson) continue;
        const meta = JSON.parse(metaJson);
        const blobFile = zip.file(`videos/${meta.id}.blob`);
        if (!blobFile) continue;
        const blob = await blobFile.async('blob');

        await db.videos.put({
          id: meta.id,
          blob,
          duracionTotal: meta.duracionTotal,
          createdAt: new Date(meta.createdAt),
        });
      }
    }

    // Refresh storage display
    const est = await getStorageEstimate();
    setStorageUsage(formatBytes(est.usage));
    setStorageQuota(formatBytes(est.quota));
  };

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">Ajustes</h1>

      {/* Audio settings */}
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wide">Audio</h2>

        <label className="flex items-center justify-between">
          <span className="text-sm text-white">Voz (indicaciones habladas)</span>
          <input
            type="checkbox"
            checked={config.vozActivada}
            onChange={(e) => updateConfig({ vozActivada: e.target.checked })}
            className="h-5 w-5 accent-white"
          />
        </label>

        <label className="flex items-center justify-between">
          <span className="text-sm text-white">Sonidos (beeps)</span>
          <input
            type="checkbox"
            checked={config.sonidosActivados}
            onChange={(e) => updateConfig({ sonidosActivados: e.target.checked })}
            className="h-5 w-5 accent-white"
          />
        </label>
      </section>

      {/* Storage */}
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wide">Almacenamiento</h2>

        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-3">
          <p className="text-sm text-white">
            Usado: <span className="font-mono">{storageUsage}</span> / {storageQuota}
          </p>
          <p className="mt-1 text-xs text-zinc-400">
            {persistent ? '✓ Almacenamiento persistente activo' : 'Almacenamiento temporal'}
          </p>
          {!persistent && (
            <button
              onClick={handleRequestPersistence}
              className="mt-2 rounded-md border border-zinc-700 px-3 py-1 text-xs text-white active:bg-zinc-800"
            >
              Solicitar persistencia
            </button>
          )}
        </div>
      </section>

      {/* Backup */}
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wide">Respaldo</h2>

        <button
          onClick={handleExport}
          className="w-full rounded-lg border border-zinc-700 px-4 py-2.5 text-sm text-white active:bg-zinc-800"
        >
          📦 Exportar respaldo (.zip)
        </button>

        <label className="block w-full cursor-pointer rounded-lg border border-zinc-700 px-4 py-2.5 text-center text-sm text-white active:bg-zinc-800">
          📥 Importar respaldo
          <input
            type="file"
            accept=".zip"
            className="hidden"
            onChange={handleImport}
          />
        </label>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add app/ajustes/page.tsx
git commit -m "feat: add settings page with audio config, storage info, and backup"
```

---

## Task 11: Service Worker Registration & Persistent Storage Request

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Add service worker registration to layout**

Add a client component for service worker registration. Create `components/ServiceWorkerRegistrar.tsx`:

```typescript
'use client';

import { useEffect } from 'react';
import { requestPersistentStorage } from '@/lib/storage';

export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', { scope: '/' });
    }
    requestPersistentStorage();
  }, []);

  return null;
}
```

- [ ] **Step 2: Add to layout**

In `app/layout.tsx`, add the import and component after `<BottomNav />`:

```typescript
import { ServiceWorkerRegistrar } from '@/components/ServiceWorkerRegistrar';
```

And in the body:
```tsx
<ServiceWorkerRegistrar />
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add components/ServiceWorkerRegistrar.tsx app/layout.tsx
git commit -m "feat: register service worker and request persistent storage on mount"
```

---

## Task 12: Final Integration & Smoke Test

**Files:**
- No new files — integration verification

- [ ] **Step 1: Run full build**

```bash
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 2: Run linter**

```bash
npm run lint
```

Expected: No lint errors (fix any that appear).

- [ ] **Step 3: Start dev server and verify routes**

```bash
npm run dev
```

Manually verify:
- `/banco-ejercicios` loads exercise gallery
- `/circuitos` loads circuit list
- `/ajustes` loads settings page
- Bottom nav is visible on all pages
- Redirect from `/` to `/banco-ejercicios` works

- [ ] **Step 4: Commit spec update**

```bash
git add docs/superpowers/specs/2026-07-27-pwa-exercise-routines-design.md
git commit -m "docs: update spec with final PWA library decision"
```

---

## Summary

| Task | Description | Key Files |
|------|-------------|-----------|
| 1 | Dependencies & Dexie schema | `lib/db.ts` |
| 2 | PWA manifest & service worker | `app/manifest.ts`, `public/sw.js` |
| 3 | Layout & bottom navigation | `components/BottomNav.tsx`, `app/layout.tsx` |
| 4 | Storage utilities & error modal | `lib/storage.ts`, `components/StorageModal.tsx` |
| 5 | Video upload & exercise form | `components/VideoTrimmer.tsx`, `components/ExerciseForm.tsx` |
| 6 | Exercise gallery page | `components/ExerciseCard.tsx`, `app/banco-ejercicios/page.tsx` |
| 7 | Circuit builder & list | `components/CircuitBuilder.tsx`, `app/circuitos/page.tsx` |
| 8 | Audio, Wake Lock & timer hooks | `lib/audio.ts`, `hooks/useCircuitTimer.ts`, `hooks/useWakeLock.ts` |
| 9 | Circuit playback mode | `components/CircuitPlayer.tsx`, `app/circuitos/[id]/play/page.tsx` |
| 10 | Settings page | `app/ajustes/page.tsx` |
| 11 | Service worker registration | `components/ServiceWorkerRegistrar.tsx` |
| 12 | Final integration & smoke test | — |
