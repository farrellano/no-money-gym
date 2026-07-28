# Landing Page, SEO, Feedback & Explainer Video — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a SEO-optimized landing page with hero, Remotion explainer video, FAQ, feedback form (Turnstile + Resend), and footer with BTC donation link.

**Architecture:** Landing page at `/` is a Server Component for SEO. Only interactive parts (feedback modal, footer copy button) are client components. A single API route handles feedback (Turnstile validation + Resend email). Remotion renders a static mp4 offline.

**Tech Stack:** Next.js 16 (Server Components), Remotion, Resend, Cloudflare Turnstile (@marsidev/react-turnstile), JSON-LD

---

## File Structure

```
app/
  page.tsx                          → Landing page (Server Component, replaces redirect)
  api/feedback/route.ts             → POST handler: Turnstile + Resend
  robots.ts                         → SEO robots.txt
  sitemap.ts                        → SEO sitemap.xml
  banco-ejercicios/
    page.tsx                        → (already exists, no redirect needed now)
lib/
  resend.ts                         → Resend client wrapper
components/
  landing/
    Hero.tsx                        → Hero section (server)
    ExplainerVideo.tsx              → Video embed (server)
    Faq.tsx                         → FAQ accordion (server + client details)
    FeedbackModal.tsx               → Modal + form + Turnstile (client)
    Footer.tsx                      → Credits + BTC copy (client)
    StarRating.tsx                  → Star rating input (client)
    JsonLd.tsx                      → JSON-LD script tag (server)
remotion/
  src/
    ExplainerVideo.tsx              → Main composition
    scenes/
      WelcomeScene.tsx
      UploadScene.tsx
      BuildCircuitScene.tsx
      PlaybackScene.tsx
      CtaScene.tsx
  root.tsx                          → Remotion Root
public/
  explainer.mp4                     → Rendered video (gitignored)
  og-image.png                      → OG image placeholder
.env.example                        → Environment variable documentation
```

---

## Task 1: Dependencies & Environment Setup

**Files:**
- Modify: `package.json`
- Create: `.env.example`
- Create: `.env.local` (gitignored)

- [ ] **Step 1: Install dependencies**

```bash
npm install resend @marsidev/react-turnstile
npm install --save-dev remotion @remotion/cli @remotion/bundler @remotion/renderer
```

- [ ] **Step 2: Create .env.example**

Create `.env.example`:

```
# Feedback email (Resend)
RESEND_API_KEY=
FEEDBACK_TO_EMAIL=

# Cloudflare Turnstile
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=

# Site URL (used in metadata/sitemap)
NEXT_PUBLIC_SITE_URL=https://nomoneygym.com
```

- [ ] **Step 3: Create .env.local for development**

Create `.env.local`:

```
RESEND_API_KEY=re_placeholder
FEEDBACK_TO_EMAIL=test@example.com
NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Note: The Turnstile keys above are Cloudflare's official test keys that always pass.

- [ ] **Step 4: Add .env.local to .gitignore**

Append to `.gitignore`:

```
.env.local
```

- [ ] **Step 5: Verify install**

```bash
npx tsc --noEmit
```

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json .env.example .gitignore
git commit -m "feat: add landing page dependencies and env config"
```

---

## Task 2: SEO — robots.ts, sitemap.ts, JSON-LD component

**Files:**
- Create: `app/robots.ts`
- Create: `app/sitemap.ts`
- Create: `components/landing/JsonLd.tsx`

- [ ] **Step 1: Create robots.ts**

Create `app/robots.ts`:

```typescript
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/' },
      { userAgent: '*', disallow: ['/banco-ejercicios', '/circuitos', '/ajustes'] },
    ],
    sitemap: 'https://nomoneygym.com/sitemap.xml',
  };
}
```

- [ ] **Step 2: Create sitemap.ts**

Create `app/sitemap.ts`:

```typescript
import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://nomoneygym.com',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
  ];
}
```

- [ ] **Step 3: Create JsonLd component**

Create `components/landing/JsonLd.tsx`:

```typescript
export function JsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'NoMoneyGym',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description:
      'Arma rutinas tipo Tabata con tus propios videos. Gratis, offline, sin suscripciones.',
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
```

- [ ] **Step 4: Verify build**

```bash
npm run build
```

Expected: Build succeeds. Routes show `/robots.txt` and `/sitemap.xml`.

- [ ] **Step 5: Commit**

```bash
git add app/robots.ts app/sitemap.ts components/landing/JsonLd.tsx
git commit -m "feat: add SEO robots.txt, sitemap.xml, and JSON-LD component"
```

---

## Task 3: Landing Page — Hero & Video Components

**Files:**
- Create: `components/landing/Hero.tsx`
- Create: `components/landing/ExplainerVideo.tsx`

- [ ] **Step 1: Create Hero component**

Create `components/landing/Hero.tsx`:

```typescript
import Link from 'next/link';

export function Hero() {
  return (
    <section className="flex flex-col items-center px-4 pt-16 pb-12 text-center">
      <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl">
        Arma rutinas tipo Tabata con tus propios videos
      </h1>
      <p className="mt-4 max-w-md text-lg text-zinc-400">
        Gratis, sin suscripciones, sin nube. Tus datos se quedan en tu dispositivo.
      </p>
      <Link
        href="/banco-ejercicios"
        className="mt-8 rounded-lg bg-green-600 px-8 py-3 text-lg font-medium text-white shadow-lg active:bg-green-700 hover:bg-green-500 transition-colors"
      >
        Comenzar
      </Link>
    </section>
  );
}
```

- [ ] **Step 2: Create ExplainerVideo component**

Create `components/landing/ExplainerVideo.tsx`:

```typescript
export function ExplainerVideo() {
  return (
    <section className="flex justify-center px-4 py-8">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-zinc-800 shadow-2xl">
        <video
          src="/explainer.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="w-full aspect-[9/16] bg-black object-cover"
        />
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Create a placeholder video file**

```bash
# Create a minimal valid mp4 placeholder (will be replaced by Remotion render)
# For now, create an empty file so the component doesn't 404
touch public/explainer.mp4
```

- [ ] **Step 4: Commit**

```bash
git add components/landing/Hero.tsx components/landing/ExplainerVideo.tsx public/explainer.mp4
git commit -m "feat: add hero and explainer video landing components"
```

---

## Task 4: Landing Page — FAQ Component

**Files:**
- Create: `components/landing/Faq.tsx`

- [ ] **Step 1: Create FAQ component**

Create `components/landing/Faq.tsx`:

```typescript
const faqs = [
  {
    question: '¿Mis videos se suben a algún servidor?',
    answer:
      'No. Todo se guarda localmente en tu dispositivo usando IndexedDB. Nadie más tiene acceso a tus datos.',
  },
  {
    question: '¿Es gratis?',
    answer: '100% gratuita. Sin planes pagos, sin cobros, sin trial.',
  },
  {
    question: '¿Hay suscripciones?',
    answer: 'No. Sin cobros recurrentes de ningún tipo.',
  },
  {
    question: '¿Necesito internet para usarla?',
    answer:
      'Solo para la primera carga. Después funciona offline como app instalada.',
  },
  {
    question: '¿Qué pasa si cambio de celular?',
    answer:
      'Puedes exportar un respaldo (.zip) desde Ajustes e importarlo en el nuevo dispositivo.',
  },
  {
    question: '¿De dónde saco los videos de los ejercicios?',
    answer:
      'Los grabas tú o los descargas de donde prefieras y los subes desde tu dispositivo. No hay integración directa con redes sociales.',
  },
];

export function Faq() {
  return (
    <section className="px-4 py-12">
      <h2 className="text-2xl font-bold text-white text-center mb-8">
        Preguntas frecuentes
      </h2>
      <div className="mx-auto max-w-lg space-y-3">
        {faqs.map((faq) => (
          <details
            key={faq.question}
            className="group rounded-lg border border-zinc-800 bg-zinc-900"
          >
            <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-white list-none flex items-center justify-between">
              {faq.question}
              <span className="text-zinc-500 group-open:rotate-180 transition-transform">
                ▾
              </span>
            </summary>
            <p className="px-4 pb-3 text-sm text-zinc-400">{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/landing/Faq.tsx
git commit -m "feat: add FAQ accordion component for landing page"
```

---

## Task 5: Landing Page — Footer with BTC Copy

**Files:**
- Create: `components/landing/Footer.tsx`

- [ ] **Step 1: Create Footer component**

Create `components/landing/Footer.tsx`:

```typescript
'use client';

import { useState } from 'react';

// Reemplazar con dirección real
const BTC_ADDRESS = 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh';

export function Footer() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(BTC_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <footer className="border-t border-zinc-800 px-4 py-8 text-center">
      <p className="text-sm text-zinc-400">Developed by Fas and Claude</p>

      <div className="mt-4 text-xs text-zinc-600">
        <p>Si quieres aportar, puedes dejar unos satoshis en esta dirección BTC</p>
        <div className="mt-2 flex items-center justify-center gap-2">
          <code className="rounded bg-zinc-800 px-2 py-1 text-zinc-400 text-[10px]">
            {BTC_ADDRESS.slice(0, 12)}...{BTC_ADDRESS.slice(-6)}
          </code>
          <button
            onClick={handleCopy}
            className="rounded bg-zinc-800 px-2 py-1 text-[10px] text-zinc-400 hover:text-white transition-colors"
          >
            {copied ? 'Copiado ✓' : 'Copiar'}
          </button>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/landing/Footer.tsx
git commit -m "feat: add footer with BTC donation copy button"
```

---

## Task 6: Star Rating & Feedback Modal

**Files:**
- Create: `components/landing/StarRating.tsx`
- Create: `components/landing/FeedbackModal.tsx`

- [ ] **Step 1: Create StarRating component**

Create `components/landing/StarRating.tsx`:

```typescript
'use client';

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
}

export function StarRating({ value, onChange }: StarRatingProps) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className={`text-2xl transition-colors ${
            star <= value ? 'text-yellow-400' : 'text-zinc-600'
          }`}
          aria-label={`${star} estrellas`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Create FeedbackModal component**

Create `components/landing/FeedbackModal.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';
import { StarRating } from './StarRating';

interface FeedbackModalProps {
  open: boolean;
  onClose: () => void;
}

export function FeedbackModal({ open, onClose }: FeedbackModalProps) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [estrellas, setEstrellas] = useState(0);
  const [comentario, setComentario] = useState('');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  if (!open) return null;

  const canSubmit =
    nombre.trim() &&
    email.trim() &&
    estrellas > 0 &&
    comentario.trim() &&
    turnstileToken &&
    status !== 'sending';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setStatus('sending');
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, estrellas, comentario, turnstileToken }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al enviar');
      }

      setStatus('success');
      setTimeout(onClose, 2000);
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  if (status === 'success') {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
        <div className="w-full max-w-sm rounded-xl bg-zinc-800 p-6 text-center">
          <p className="text-lg font-bold text-white">¡Gracias por tu feedback! 🙏</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-sm rounded-xl bg-zinc-800 p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Tu feedback</h2>
          <button onClick={onClose} className="text-zinc-400 text-sm">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-zinc-500">Nombre</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white"
            />
          </div>

          <div>
            <label className="text-xs text-zinc-500">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white"
            />
          </div>

          <div>
            <label className="text-xs text-zinc-500">Calificación</label>
            <div className="mt-1">
              <StarRating value={estrellas} onChange={setEstrellas} />
            </div>
          </div>

          <div>
            <label className="text-xs text-zinc-500">Comentario</label>
            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              required
              rows={3}
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white resize-none"
            />
          </div>

          <div className="flex justify-center">
            <Turnstile
              siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
              onSuccess={setTurnstileToken}
              options={{ theme: 'dark' }}
            />
          </div>

          {status === 'error' && (
            <p className="text-xs text-red-400">{errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-zinc-900 disabled:opacity-50 active:bg-zinc-200"
          >
            {status === 'sending' ? 'Enviando...' : 'Enviar feedback'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add components/landing/StarRating.tsx components/landing/FeedbackModal.tsx
git commit -m "feat: add star rating and feedback modal with Turnstile"
```

---

## Task 7: Feedback API Route

**Files:**
- Create: `lib/resend.ts`
- Create: `app/api/feedback/route.ts`

- [ ] **Step 1: Create Resend client helper**

Create `lib/resend.ts`:

```typescript
import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY);
```

- [ ] **Step 2: Create feedback API route**

Create `app/api/feedback/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { resend } from '@/lib/resend';

interface FeedbackBody {
  nombre: string;
  email: string;
  estrellas: number;
  comentario: string;
  turnstileToken: string;
}

export async function POST(request: Request) {
  const body: FeedbackBody = await request.json();
  const { nombre, email, estrellas, comentario, turnstileToken } = body;

  // Validate required fields
  if (!nombre || !email || !estrellas || !comentario || !turnstileToken) {
    return NextResponse.json({ error: 'Campos requeridos faltantes' }, { status: 400 });
  }

  // Validate Turnstile token
  const turnstileRes = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: turnstileToken,
      }),
    }
  );

  const turnstileData = await turnstileRes.json();
  if (!turnstileData.success) {
    return NextResponse.json({ error: 'Captcha inválido' }, { status: 400 });
  }

  // Send email via Resend
  try {
    await resend.emails.send({
      from: 'NoMoneyGym Feedback <onboarding@resend.dev>',
      to: process.env.FEEDBACK_TO_EMAIL!,
      subject: `Feedback: ${'⭐'.repeat(estrellas)} (${estrellas}/5) de ${nombre}`,
      html: `
        <h2>Nuevo feedback de NoMoneyGym</h2>
        <p><strong>Nombre:</strong> ${nombre}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Calificación:</strong> ${'⭐'.repeat(estrellas)} (${estrellas}/5)</p>
        <p><strong>Comentario:</strong></p>
        <p>${comentario}</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Error al enviar feedback' }, { status: 500 });
  }
}
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Expected: Build succeeds, `/api/feedback` shows as a function route.

- [ ] **Step 4: Commit**

```bash
git add lib/resend.ts app/api/feedback/route.ts
git commit -m "feat: add feedback API route with Turnstile validation and Resend"
```

---

## Task 8: Landing Page Assembly

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/layout.tsx` (metadata update)

- [ ] **Step 1: Replace app/page.tsx with landing page**

Replace `app/page.tsx`:

```typescript
import type { Metadata } from 'next';
import { Hero } from '@/components/landing/Hero';
import { ExplainerVideo } from '@/components/landing/ExplainerVideo';
import { Faq } from '@/components/landing/Faq';
import { Footer } from '@/components/landing/Footer';
import { JsonLd } from '@/components/landing/JsonLd';
import { LandingFeedback } from '@/components/landing/LandingFeedback';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://nomoneygym.com'),
  title: 'NoMoneyGym — Rutinas de ejercicio gratis, sin nube, sin suscripciones',
  description:
    'Arma rutinas tipo Tabata con tus propios videos. 100% gratis, offline, tus datos se quedan en tu dispositivo.',
  keywords: [
    'rutina de ejercicios gratis',
    'tabata sin internet',
    'app de circuitos sin suscripción',
    'ejercicios offline',
    'tabata gratis',
  ],
  openGraph: {
    title: 'NoMoneyGym — Rutinas gratis sin suscripciones',
    description: 'Arma circuitos tipo Tabata con tus propios videos. Sin nube, sin pagos.',
    url: 'https://nomoneygym.com',
    siteName: 'NoMoneyGym',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NoMoneyGym — Rutinas gratis sin suscripciones',
    description: 'Arma circuitos tipo Tabata con tus propios videos.',
    images: ['/og-image.png'],
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <JsonLd />
      <Hero />
      <ExplainerVideo />
      <Faq />
      <LandingFeedback />
      <Footer />
    </div>
  );
}
```

- [ ] **Step 2: Create LandingFeedback client wrapper**

Since FeedbackModal needs state (open/close), create a thin client wrapper. Create `components/landing/LandingFeedback.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { FeedbackModal } from './FeedbackModal';

export function LandingFeedback() {
  const [open, setOpen] = useState(false);

  return (
    <section className="flex justify-center px-4 py-8">
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg border border-zinc-700 px-6 py-2.5 text-sm text-white hover:bg-zinc-800 transition-colors"
      >
        💬 Danos tu feedback
      </button>
      <FeedbackModal open={open} onClose={() => setOpen(false)} />
    </section>
  );
}
```

- [ ] **Step 3: Create OG image placeholder**

```bash
# Create a minimal placeholder OG image
echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPj/HwADBwIAMCbHYQAAAABJRU5ErkJggg==" | base64 -d > public/og-image.png
```

- [ ] **Step 4: Update layout.tsx metadata**

In `app/layout.tsx`, update the metadata to be the app-level fallback (landing page overrides with its own):

```typescript
export const metadata: Metadata = {
  title: 'No Money Gym',
  description: 'Rutinas de ejercicio con videos locales',
};
```

(This should already be set from previous implementation — verify and leave as-is.)

- [ ] **Step 5: Verify build**

```bash
npm run build
```

Expected: Build succeeds. Landing page at `/` is now static. `/banco-ejercicios` still works.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: assemble landing page with hero, video, FAQ, feedback, and footer"
```

---

## Task 9: Remotion Video Composition

**Files:**
- Create: `remotion/root.tsx`
- Create: `remotion/src/ExplainerVideo.tsx`
- Create: `remotion/src/scenes/WelcomeScene.tsx`
- Create: `remotion/src/scenes/UploadScene.tsx`
- Create: `remotion/src/scenes/BuildCircuitScene.tsx`
- Create: `remotion/src/scenes/PlaybackScene.tsx`
- Create: `remotion/src/scenes/CtaScene.tsx`

- [ ] **Step 1: Create Remotion root**

Create `remotion/root.tsx`:

```typescript
import { registerRoot } from 'remotion';
import { ExplainerVideo } from './src/ExplainerVideo';

export const RemotionRoot: React.FC = () => {
  return null;
};

registerRoot(RemotionRoot);
```

- [ ] **Step 2: Create main composition**

Create `remotion/src/ExplainerVideo.tsx`:

```typescript
import { Composition } from 'remotion';
import { WelcomeScene } from './scenes/WelcomeScene';
import { UploadScene } from './scenes/UploadScene';
import { BuildCircuitScene } from './scenes/BuildCircuitScene';
import { PlaybackScene } from './scenes/PlaybackScene';
import { CtaScene } from './scenes/CtaScene';
import { AbsoluteFill, Sequence } from 'remotion';

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
```

- [ ] **Step 3: Create WelcomeScene**

Create `remotion/src/scenes/WelcomeScene.tsx`:

```typescript
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
```

- [ ] **Step 4: Create UploadScene**

Create `remotion/src/scenes/UploadScene.tsx`:

```typescript
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
      {/* Mock video frame */}
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
        {/* Slider bar */}
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
```

- [ ] **Step 5: Create BuildCircuitScene**

Create `remotion/src/scenes/BuildCircuitScene.tsx`:

```typescript
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
```

- [ ] **Step 6: Create PlaybackScene**

Create `remotion/src/scenes/PlaybackScene.tsx`:

```typescript
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
      {/* Timer display */}
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
```

- [ ] **Step 7: Create CtaScene**

Create `remotion/src/scenes/CtaScene.tsx`:

```typescript
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
        {/* Fake CTA button */}
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
```

- [ ] **Step 8: Update Remotion root to register composition**

Replace `remotion/root.tsx`:

```typescript
import { registerRoot } from 'remotion';
import { ExplainerVideo } from './src/ExplainerVideo';

registerRoot(ExplainerVideo);
```

- [ ] **Step 9: Add render script to package.json**

Add to `scripts` in `package.json`:

```json
"render-video": "npx remotion render remotion/src/ExplainerVideo.tsx ExplainerVideo public/explainer.mp4"
```

- [ ] **Step 10: Add explainer.mp4 to .gitignore**

Append to `.gitignore`:

```
public/explainer.mp4
```

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "feat: add Remotion explainer video composition (5 scenes)"
```

---

## Task 10: Render Video & Final Integration

**Files:**
- Render: `public/explainer.mp4`

- [ ] **Step 1: Render the explainer video**

```bash
npm run render-video
```

Expected: Renders `public/explainer.mp4` (portrait 1080x1920, ~25 seconds).

Note: If Remotion render fails due to environment issues (no Chrome/Chromium), skip this step — the landing page will still work with the empty placeholder video. The render can be done later.

- [ ] **Step 2: Run full build**

```bash
npm run build
```

Expected: Build succeeds with routes:
- `/` (static landing page)
- `/api/feedback` (function)
- `/robots.txt` (static)
- `/sitemap.xml` (static)
- Plus all existing app routes

- [ ] **Step 3: Run lint**

```bash
npm run lint
```

Expected: No lint errors. Fix any that appear.

- [ ] **Step 4: Commit if there are fixes**

```bash
git add -A && git status
# Only commit if there are changes
git commit -m "fix: resolve any lint issues from landing page integration" || true
```

- [ ] **Step 5: Push to remote**

```bash
git push origin main
```

---

## Summary

| Task | Description | Key Files |
|------|-------------|-----------|
| 1 | Dependencies & env setup | `package.json`, `.env.example` |
| 2 | SEO (robots, sitemap, JSON-LD) | `app/robots.ts`, `app/sitemap.ts` |
| 3 | Hero & video components | `components/landing/Hero.tsx`, `ExplainerVideo.tsx` |
| 4 | FAQ accordion | `components/landing/Faq.tsx` |
| 5 | Footer with BTC copy | `components/landing/Footer.tsx` |
| 6 | Star rating & feedback modal | `StarRating.tsx`, `FeedbackModal.tsx` |
| 7 | Feedback API route | `lib/resend.ts`, `app/api/feedback/route.ts` |
| 8 | Landing page assembly | `app/page.tsx`, `LandingFeedback.tsx` |
| 9 | Remotion video composition | `remotion/` directory (5 scenes) |
| 10 | Render video & final integration | Build, lint, push |
