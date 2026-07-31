import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { remark } from 'remark';
import html from 'remark-html';
import { getAllSlugs, getPostBySlug } from '@/lib/blog';
import { BlogPostClient } from '@/components/blog/BlogPostClient';

interface Props {
  params: Promise<{ slug: string }>;
}

async function mdToHtml(content: string): Promise<string> {
  const result = await remark().use(html, { sanitize: false }).process(content);
  return result.toString();
}

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug, 'es') ?? getPostBySlug(slug, 'en');
  if (!post) return {};

  const enPost = getPostBySlug(slug, 'en');

  return {
    title: `${post.title} — NoMoneyGym Blog`,
    description: post.description,
    keywords: post.keywords,
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://nomoneygym.com/blog/${slug}`,
      siteName: 'NoMoneyGym',
      type: 'article',
      publishedTime: post.date,
      images: post.image ? [{ url: post.image }] : [{ url: '/og-image.png' }],
      locale: 'es_LA',
      alternateLocale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: post.image ? [post.image] : ['/og-image.png'],
    },
    alternates: {
      canonical: `https://nomoneygym.com/blog/${slug}`,
      languages: {
        es: `https://nomoneygym.com/blog/${slug}`,
        en: enPost ? `https://nomoneygym.com/blog/${slug}` : undefined,
      },
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const esPost = getPostBySlug(slug, 'es');
  const enPost = getPostBySlug(slug, 'en');

  if (!esPost && !enPost) notFound();

  const primaryPost = esPost ?? enPost!;
  const esHtml = esPost ? await mdToHtml(esPost.content) : null;
  const enHtml = enPost ? await mdToHtml(enPost.content) : null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: primaryPost.title,
    description: primaryPost.description,
    datePublished: primaryPost.date,
    image: primaryPost.image,
    url: `https://nomoneygym.com/blog/${slug}`,
    author: {
      '@type': 'Organization',
      name: 'NoMoneyGym',
      url: 'https://nomoneygym.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'NoMoneyGym',
      url: 'https://nomoneygym.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://nomoneygym.com/logonomoneygym.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://nomoneygym.com/blog/${slug}`,
    },
    inLanguage: ['es', 'en'],
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4">
          <Link href="/blog" className="text-zinc-400 hover:text-white transition-colors">
            ← Blog
          </Link>
        </div>
      </header>

      <BlogPostClient
        esPost={esPost ?? enPost!}
        enPost={enPost}
        esHtml={esHtml ?? (await mdToHtml(enPost!.content))}
        enHtml={enHtml}
      />
    </div>
  );
}
