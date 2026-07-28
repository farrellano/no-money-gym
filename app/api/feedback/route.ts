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
