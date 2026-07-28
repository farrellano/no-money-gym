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
