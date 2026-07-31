'use client';

import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import type { BlogPost } from '@/lib/blog';

interface Props {
  esPosts: BlogPost[];
  enPosts: BlogPost[];
}

export function BlogListClient({ esPosts, enPosts }: Props) {
  const { locale } = useI18n();
  const posts = locale === 'en' ? enPosts : esPosts;

  return (
    <div className="mt-8 space-y-6">
      {posts.map((post) => (
        <Link
          key={post.slug}
          href={`/blog/${post.slug}`}
          className="block rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 transition-colors hover:border-zinc-600"
        >
          {post.image && (
            <img
              src={post.image}
              alt={post.title}
              className="mb-4 w-full rounded-lg aspect-video object-cover bg-zinc-800"
              loading="lazy"
            />
          )}
          <h2 className="text-xl font-semibold text-white">{post.title}</h2>
          <p className="mt-2 text-sm text-zinc-400">{post.description}</p>
          <time className="mt-3 block text-xs text-zinc-500">
            {new Date(post.date).toLocaleDateString(locale === 'en' ? 'en-US' : 'es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
        </Link>
      ))}
    </div>
  );
}
