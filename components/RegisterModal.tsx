'use client';

import { useState } from 'react';

interface RegisterModalProps {
  onRegistered: (userId: string, username: string) => void;
}

export function RegisterModal({ onRegistered }: RegisterModalProps) {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error al registrar');
        return;
      }

      localStorage.setItem('nmg-user-id', data.userId);
      localStorage.setItem('nmg-username', data.username);
      onRegistered(data.userId, data.username);
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-sm rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="text-xl font-bold text-white">🤖 AI Coach</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Elige un nombre de usuario para comenzar
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="tu_username"
              maxLength={20}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
            />
            <p className="mt-1 text-xs text-zinc-500">
              3-20 caracteres, letras, números y guión bajo
            </p>
          </div>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || username.trim().length < 3}
            className="w-full rounded-lg bg-white px-4 py-2 font-medium text-zinc-900 disabled:opacity-50 active:bg-zinc-200"
          >
            {loading ? 'Registrando...' : 'Comenzar'}
          </button>
        </form>
      </div>
    </div>
  );
}
