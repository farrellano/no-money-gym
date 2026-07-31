import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllPosts } from '@/lib/blog';
import { BlogListClient } from '@/components/blog/BlogListClient';

export const metadata: Metadata = {
  title: 'Blog — NoMoneyGym',
  description:
    'Tips, tutorials, and guides for building workout routines with your own videos. Consejos, tutoriales y guías para armar rutinas con tus propios videos.',
  openGraph: {
    title: 'Blog — NoMoneyGym',
    description: 'Tips, tutorials, and guides for building workout routines.',
    url: 'https://nomoneygym.com/blog',
    siteName: 'NoMoneyGym',
    type: 'website',
  },
  alternates: {
    canonical: 'https://nomoneygym.com/blog',
  },
};

export default function BlogPage() {
  const esPosts = getAllPosts('es');
  const enPosts = getAllPosts('en');

  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4">
          <Link href="/" className="text-zinc-400 hover:text-white transition-colors">
            ← NoMoneyGym
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-bold text-white">Blog</h1>
        <BlogListClient esPosts={esPosts} enPosts={enPosts} />
      </main>
    </div>
  );
}
