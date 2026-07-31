import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const BLOG_DIR = path.join(process.cwd(), 'content/blog');

export interface BlogPost {
  slug: string;
  locale: string;
  title: string;
  description: string;
  date: string;
  image?: string;
  keywords?: string[];
  content: string;
}

export function getAllPosts(locale: string): BlogPost[] {
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(`.${locale}.mdx`));

  return files
    .map((file) => {
      const raw = fs.readFileSync(path.join(BLOG_DIR, file), 'utf-8');
      const { data, content } = matter(raw);
      return {
        slug: data.slug,
        locale: data.locale,
        title: data.title,
        description: data.description,
        date: data.date,
        image: data.image,
        keywords: data.keywords,
        content,
      } as BlogPost;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string, locale: string): BlogPost | null {
  const filename = `${slug}.${locale}.mdx`;
  const filePath = path.join(BLOG_DIR, filename);

  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);

  return {
    slug: data.slug,
    locale: data.locale,
    title: data.title,
    description: data.description,
    date: data.date,
    image: data.image,
    keywords: data.keywords,
    content,
  } as BlogPost;
}

export function getAllSlugs(): string[] {
  const files = fs.readdirSync(BLOG_DIR);
  const slugs = new Set<string>();
  for (const file of files) {
    const match = file.match(/^(.+)\.(es|en)\.mdx$/);
    if (match) slugs.add(match[1]);
  }
  return Array.from(slugs);
}
