import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/' },
      { userAgent: '*', disallow: ['/banco-ejercicios', '/circuitos', '/ajustes'] },
    ],
    sitemap: 'https://nomoneygym.com/sitemap.xml',
  };
}
