'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useState, useSyncExternalStore, useRef, useEffect, useMemo } from 'react';
import { RegisterModal } from './RegisterModal';

const subscribe = () => () => {};

export function AiCoachChat() {
  const [registeredUserId, setRegisteredUserId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const isHydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
  const storedUserId = isHydrated ? localStorage.getItem('nmg-user-id') : null;
  const userId = registeredUserId ?? storedUserId;

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/ai-coach',
        headers: userId ? { 'x-user-id': userId } : undefined,
      }),
    [userId]
  );

  const { messages, sendMessage, status } = useChat({ transport });

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  if (!isHydrated) return null;

  if (!userId) {
    return (
      <RegisterModal
        onRegistered={(id) => {
          setRegisteredUserId(id);
        }}
      />
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || status === 'streaming') return;
    setInput('');
    sendMessage({ text });
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <div className="border-b border-zinc-800 px-4 py-3">
        <h1 className="text-lg font-bold text-white">🤖 AI Coach</h1>
        <p className="text-xs text-zinc-400">Crea circuitos con ayuda de IA</p>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
            <span className="text-4xl">🤖</span>
            <p className="mt-2 text-sm font-medium">¡Hola! Soy tu AI Coach</p>
            <p className="text-xs text-zinc-600">
              Dime qué tipo de circuito quieres crear
            </p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-xl px-4 py-2 text-sm ${
                message.role === 'user'
                  ? 'bg-white text-zinc-900'
                  : 'bg-zinc-800 text-zinc-100'
              }`}
            >
              <p className="whitespace-pre-wrap">
                {message.parts
                  .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
                  .map(p => p.text)
                  .join('')}
              </p>
            </div>
          </div>
        ))}

        {status === 'streaming' && (
          <div className="flex justify-start">
            <div className="rounded-xl bg-zinc-800 px-4 py-2 text-sm text-zinc-400">
              Pensando...
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-zinc-800 p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe el circuito que quieres crear..."
            disabled={status === 'streaming'}
            className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || status === 'streaming'}
            className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-900 disabled:opacity-50 active:bg-zinc-200"
          >
            →
          </button>
        </form>
      </div>
    </div>
  );
}
