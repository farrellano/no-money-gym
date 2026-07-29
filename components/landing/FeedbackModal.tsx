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

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const canSubmit =
    nombre.trim() &&
    email.trim() &&
    isValidEmail &&
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
            {email && !isValidEmail && (
              <p className="mt-1 text-xs text-red-400">Email inválido</p>
            )}
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
