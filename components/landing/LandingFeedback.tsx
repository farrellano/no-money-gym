'use client';

import { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { FeedbackModal } from './FeedbackModal';

export function LandingFeedback() {
  const [open, setOpen] = useState(false);
  const { t } = useI18n();

  return (
    <section id="feedback" className="flex justify-center px-4 py-8">
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg border border-zinc-700 px-6 py-2.5 text-sm text-white hover:bg-zinc-800 transition-colors"
      >
        {t.feedbackButton}
      </button>
      <FeedbackModal open={open} onClose={() => setOpen(false)} />
    </section>
  );
}
