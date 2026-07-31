import type { MetadataRoute } from 'next';
import { getAllSlugs } from '@/lib/blog';

export default function sitemap(): MetadataRoute.Sitemap {
  const blogSlugs = getAllSlugs();

  return [
    {
      url: 'https://nomoneygym.com',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: 'https://nomoneygym.com/blog',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...blogSlugs.map((slug) => ({
      url: `https://nomoneygym.com/blog/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ];
}
