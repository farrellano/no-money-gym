# PWA Exercise Routines App — Design Spec

## Overview

A Progressive Web App for creating Tabata/circuit exercise routines using locally-stored videos. Everything runs client-side with IndexedDB storage — no backend.

## Architecture

- **Framework:** Next.js 16 (App Router), configured as PWA
- **Language:** TypeScript throughout
- **Storage:** Dexie.js over IndexedDB for all data (videos as Blobs, exercises, circuits, config)
- **Styling:** Tailwind CSS 4
- **Drag & Drop:** dnd-kit
- **PWA:** Serwist (or next-pwa) for service worker + manifest
- **Audio:** Web Speech API (es-ES) + native Audio() for beeps
- **Screen:** Wake Lock API during playback
- **Backup:** JSZip for export/import

## Data Model (Dexie)

```
VideoRecord: id, blob, duracionTotal, createdAt
EjercicioRecord: id, nombre, grupoMuscular, videoId (FK→VideoRecord), startSec, endSec, createdAt
CircuitoRecord: id, nombre, rondas, ejercicios[{ejercicioId, duracionSeg, descansoSeg}], createdAt
ConfigRecord: id, vozActivada, sonidosActivados, vozLang
```

Videos stored once as Blobs; exercises reference by videoId. No duplication.

## Routes

```
/banco-ejercicios         → Phase 1: exercise gallery, upload, edit
/circuitos                → Phase 2: circuit list, builder
/circuitos/[id]/play      → Phase 2: fullscreen playback mode
/ajustes                  → Config: voice/sound toggles, storage info, backup
```

## Phase 1 — Exercise Bank

1. Upload video via `<input type="file" accept="video/*">`
2. Store Blob in `videos` table
3. VideoTrimmer component: dual-slider over video timeline to set startSec/endSec (metadata only, no re-encoding)
4. Preview plays only the selected range
5. Form: exercise name + muscle group dropdown (pierna, espalda, pecho, hombro, brazo, core, glúteo, cardio)
6. Save creates EjercicioRecord pointing to videoId
7. Gallery view with thumbnails (canvas frame capture at startSec), filterable by muscle group
8. Edit/delete exercises

## Phase 2 — Circuit Builder & Playback

### Builder
1. Select exercises from saved bank (checkboxes)
2. Drag & drop (dnd-kit) to reorder sequence
3. Configure per-exercise: work seconds, rest seconds
4. Configure circuit: number of rounds
5. Save to `circuitos` table

### Playback Mode
1. Fullscreen-optimized view
2. Video loops between startSec and endSec of current exercise
3. Large countdown timer (work → rest → next exercise)
4. Auto-advance through exercises and rounds
5. Wake Lock active during playback
6. Audio triggers:

| Event | Audio |
|-------|-------|
| Exercise starts | Beep + voice: "Ejercicio: [nombre]" |
| 3s remaining (work) | Short countdown beep |
| Rest starts | Voice: "Descanso" |
| 3s remaining (rest) | Beep + voice: "Prepárate" |
| Circuit complete | Voice: "Circuito completado" |

## Storage Management

- Request persistent storage on app mount (`navigator.storage.persist()`)
- Show storage usage vs quota in settings (`navigator.storage.estimate()`)
- `URL.createObjectURL(blob)` with cleanup in useEffect return
- No localStorage for video data

## Backup System

- Export: package ejercicios + circuitos (JSON) + video blobs into a .zip (JSZip)
- Import: unzip, restore all records to IndexedDB

## PWA Configuration

- Manifest: name, icons, `display: standalone`, portrait orientation
- Service worker caches app shell for offline use
- Playback mode works 100% offline once app is loaded

## Folder Structure

```
/app
  /banco-ejercicios/
  /circuitos/
  /circuitos/[id]/play/
  /ajustes/
/lib
  db.ts
  audio.ts
  storage.ts
/components
  VideoTrimmer.tsx
  ExerciseCard.tsx
  CircuitBuilder.tsx
  CircuitPlayer.tsx
  Timer.tsx
/hooks
  useCircuitTimer.ts
  useWakeLock.ts
```

## Constraints (Non-Negotiable)

- No Instagram integration (ToS/API restrictions)
- No ffmpeg/video re-encoding — trim is metadata only
- No backend/remote database — all local IndexedDB
- No localStorage for video content
- dnd-kit for drag & drop, custom components for everything else

## Dependencies to Install

- dexie
- dnd-kit (@dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities)
- serwist (or next-pwa) for PWA
- jszip for backup
