# Landing Page, SEO, Feedback & Explainer Video — Design Spec

## Overview

A marketing landing page at `/` with hero section, Remotion-rendered explainer video, FAQ, feedback form (Turnstile + Resend email), footer with BTC donation, and full SEO optimization for `nomoneygym.com`.

## Architecture

- **Landing page** (`/`): Server Component for SEO. Only the feedback modal and BTC copy button are client-side.
- **Feedback API route** (`/api/feedback`): Server-side Turnstile validation + Resend email. The ONLY backend endpoint in the project.
- **Remotion pipeline**: Separate `/remotion` directory with composition, rendered to static `.mp4` served from `/public`.
- **SEO**: Next.js metadata API, `sitemap.ts`, `robots.ts`, JSON-LD structured data.

## Tech Stack Additions

- `remotion`, `@remotion/cli`, `@remotion/bundler`, `@remotion/renderer` — video composition + render
- `resend` — email sending SDK
- `@marsidev/react-turnstile` — Cloudflare Turnstile React widget

## Routes

```
/                         → Landing page (Server Component)
/api/feedback             → POST: validate Turnstile + send email via Resend
```

## Landing Page Sections

### Hero

- Single `<h1>`: "Arma rutinas tipo Tabata con tus propios videos"
- Subtitle: "Gratis, sin suscripciones, sin nube. Tus datos se quedan en tu dispositivo."
- CTA button: "Comenzar" → navigates to `/banco-ejercicios`
- Server-rendered, semantic HTML

### Explainer Video

- Rendered with Remotion as static `.mp4` (20-30 seconds, loop, muted autoplay)
- Served from `public/explainer.mp4`
- Embedded via `<video>` tag with `autoPlay muted loop playsInline`
- Storyboard (5 scenes, ~5s each):
  1. Welcome screen: app name + tagline
  2. Upload & trim: show video upload → slider interaction → save
  3. Build circuit: drag & drop exercises, configure rounds/rest
  4. Playback mode: timer countdown + voice cues
  5. CTA closing: "Empieza gratis, tus datos se quedan en tu dispositivo"
- Remotion composition renders at 1080x1920 (portrait, mobile-first) at 30fps

### FAQ

Accordion-style (details/summary or custom component). Questions:

1. **"¿Mis videos se suben a algún servidor?"** → No. Todo se guarda localmente en tu dispositivo usando IndexedDB. Nadie más tiene acceso a tus datos.
2. **"¿Es gratis?"** → 100% gratuita. Sin planes pagos, sin cobros, sin trial.
3. **"¿Hay suscripciones?"** → No. Sin cobros recurrentes de ningún tipo.
4. **"¿Necesito internet para usarla?"** → Solo para la primera carga. Después funciona offline como app instalada.
5. **"¿Qué pasa si cambio de celular?"** → Puedes exportar un respaldo (.zip) desde Ajustes e importarlo en el nuevo dispositivo.
6. **"¿De dónde saco los videos de los ejercicios?"** → Los grabas tú o los descargas de donde prefieras y los subes desde tu dispositivo. No hay integración directa con redes sociales.

### Feedback Modal

- Trigger: button "Danos tu feedback" in landing
- Modal form fields:
  - Nombre (text, required)
  - Email (email, required)
  - Calificación (1-5 stars, custom component, required)
  - Comentario (textarea, required)
- Cloudflare Turnstile widget below form fields
- Submit button disabled until Turnstile completes
- On submit: POST to `/api/feedback` with all fields + Turnstile token
- Success: show "¡Gracias por tu feedback!" message, close after 2s
- Error: show error message, allow retry

### Footer

- Credit text: "Developed by Fas and Claude"
- BTC donation (subtle/discrete):
  - Text: "Si quieres aportar, puedes dejar unos satoshis en esta dirección BTC"
  - Address display (truncated) + copy button
  - `BTC_ADDRESS` constant (placeholder: `"bc1q..."`, comment: "reemplazar con dirección real")
  - Copy feedback: "Copiado ✓" for 2 seconds

## Feedback API Route

`app/api/feedback/route.ts`:

```
POST /api/feedback
Body: { nombre, email, estrellas, comentario, turnstileToken }

1. Validate turnstileToken against https://challenges.cloudflare.com/turnstile/v0/siteverify
   - Send: { secret: TURNSTILE_SECRET_KEY, response: turnstileToken }
   - If invalid → 400 { error: "Captcha inválido" }

2. Send email via Resend SDK:
   - From: "NoMoneyGym Feedback <feedback@nomoneygym.com>" (or Resend default)
   - To: FEEDBACK_TO_EMAIL
   - Subject: "Feedback: ⭐{estrellas}/5 de {nombre}"
   - Body: formatted with nombre, email, estrellas, comentario

3. Return 200 { success: true }
   - On Resend error → 500 { error: "Error al enviar feedback" }
```

## SEO Configuration

### Metadata (app/layout.tsx or app/page.tsx)

```typescript
export const metadata: Metadata = {
  metadataBase: new URL('https://nomoneygym.com'),
  title: 'NoMoneyGym — Rutinas de ejercicio gratis, sin nube, sin suscripciones',
  description: 'Arma rutinas tipo Tabata con tus propios videos. 100% gratis, offline, tus datos se quedan en tu dispositivo.',
  keywords: ['rutina de ejercicios gratis', 'tabata sin internet', 'app de circuitos sin suscripción', 'ejercicios offline', 'tabata gratis'],
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
```

### robots.ts

```typescript
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

### sitemap.ts

```typescript
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://nomoneygym.com', lastModified: new Date(), changeFrequency: 'monthly', priority: 1 },
  ];
}
```

### JSON-LD (in landing page)

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "NoMoneyGym",
  "applicationCategory": "HealthApplication",
  "operatingSystem": "Web",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  "description": "Arma rutinas tipo Tabata con tus propios videos. Gratis, offline, sin suscripciones."
}
```

## Remotion Video Pipeline

### Directory Structure

```
remotion/
  src/
    ExplainerVideo.tsx     — Main composition (5 scenes)
    scenes/
      WelcomeScene.tsx
      UploadScene.tsx
      BuildCircuitScene.tsx
      PlaybackScene.tsx
      CtaScene.tsx
  root.tsx                 — Remotion Root with composition registration
  render.ts               — Script to render mp4
```

### Render Command

```bash
npx remotion render remotion/src/ExplainerVideo.tsx ExplainerVideo public/explainer.mp4
```

### Composition Config

- Width: 1080, Height: 1920 (9:16 portrait)
- FPS: 30
- Duration: 750 frames (25 seconds)
- Each scene: 150 frames (5 seconds)
- Visual style: Dark theme matching app (zinc-950 background, white text, green accents)
- Animations: Simple fade-in/slide transitions between scenes
- No audio track (muted autoplay in browser)

## Environment Variables

`.env.example`:
```
RESEND_API_KEY=
FEEDBACK_TO_EMAIL=
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
NEXT_PUBLIC_SITE_URL=https://nomoneygym.com
```

## Folder Structure (new files)

```
app/
  page.tsx                          → Landing (server component, replaces redirect)
  api/feedback/route.ts             → Turnstile + Resend
  robots.ts                         → SEO robots
  sitemap.ts                        → SEO sitemap
lib/
  resend.ts                         → Resend client helper
components/
  landing/
    Hero.tsx                        → Hero section (server)
    ExplainerVideo.tsx              → Video embed (server)
    Faq.tsx                         → FAQ accordion (server)
    FeedbackModal.tsx               → Modal + form + Turnstile (client)
    Footer.tsx                      → Credits + BTC copy (client)
    StarRating.tsx                  → Star rating input (client)
    JsonLd.tsx                      → JSON-LD script tag (server)
remotion/
  src/
    ExplainerVideo.tsx
    scenes/WelcomeScene.tsx
    scenes/UploadScene.tsx
    scenes/BuildCircuitScene.tsx
    scenes/PlaybackScene.tsx
    scenes/CtaScene.tsx
  root.tsx
  render.ts
public/
  explainer.mp4                     → Rendered video (gitignored, render locally)
  og-image.png                      → OG image placeholder
.env.example
```

## Dependencies to Install

- `remotion` + `@remotion/cli` + `@remotion/bundler` + `@remotion/renderer`
- `resend`
- `@marsidev/react-turnstile`

## Constraints

- Landing page must be server-rendered (SEO)
- Only client components: FeedbackModal, Footer (copy button), StarRating
- No mention of prices, plans, or subscriptions anywhere
- Feedback form MUST validate Turnstile server-side before sending email
- Remotion video rendered offline and committed as static asset (no runtime rendering)
- Domain: `nomoneygym.com` for all absolute URLs
