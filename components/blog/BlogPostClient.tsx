'use client';

import { useI18n } from '@/lib/i18n';
import type { BlogPost } from '@/lib/blog';

interface Props {
  esPost: BlogPost;
  enPost: BlogPost | null;
  esHtml: string;
  enHtml: string | null;
}

export function BlogPostClient({ esPost, enPost, esHtml, enHtml }: Props) {
  const { locale } = useI18n();
  const post = locale === 'en' && enPost ? enPost : esPost;
  const html = locale === 'en' && enHtml ? enHtml : esHtml;

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <time className="text-sm text-zinc-500">
        {new Date(post.date).toLocaleDateString(locale === 'en' ? 'en-US' : 'es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </time>

      <div
        className="mt-6 prose prose-invert prose-zinc max-w-none
          prose-headings:text-white prose-h1:text-3xl prose-h1:font-bold prose-h1:mb-4
          prose-h2:text-2xl prose-h2:font-semibold prose-h2:mt-10 prose-h2:mb-3
          prose-p:text-zinc-300 prose-p:leading-relaxed
          prose-a:text-green-400 prose-a:underline hover:prose-a:text-green-300
          prose-strong:text-white prose-li:text-zinc-300
          prose-img:rounded-xl prose-img:my-6 prose-img:w-full prose-img:bg-zinc-800"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </article>
  );
}
