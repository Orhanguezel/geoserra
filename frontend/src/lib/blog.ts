import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const BLOG_DIR = path.join(process.cwd(), '..', 'content', 'blog');

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  authorUrl: string;
  category: string;
  tags: string[];
  image: string;
  readTime: string;
  content: string;
}

export interface BlogPostMeta extends Omit<BlogPost, 'content'> {}

function getBlogDir(): string {
  // Try relative path from next.js app, fallback to content at project root
  const candidates = [
    path.join(process.cwd(), '..', 'content', 'blog'),
    path.join(process.cwd(), 'content', 'blog'),
  ];
  for (const dir of candidates) {
    if (fs.existsSync(dir)) return dir;
  }
  return candidates[0];
}

export function getAllPosts(): BlogPostMeta[] {
  const dir = getBlogDir();
  if (!fs.existsSync(dir)) return [];

  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md'));

  return files
    .map((file) => {
      const raw = fs.readFileSync(path.join(dir, file), 'utf-8');
      const { data } = matter(raw);
      return {
        slug: data.slug ?? file.replace(/\.md$/, ''),
        title: data.title ?? '',
        description: data.description ?? '',
        date: data.date ?? '',
        author: data.author ?? 'GeoSerra',
        authorUrl: data.authorUrl ?? 'https://geoserra.com/hakkimizda',
        category: data.category ?? 'Genel',
        tags: data.tags ?? [],
        image: data.image ?? '/og-image.png',
        readTime: data.readTime ?? '5 dk',
      } satisfies BlogPostMeta;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string): BlogPost | null {
  const dir = getBlogDir();
  if (!fs.existsSync(dir)) return null;

  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md'));

  for (const file of files) {
    const raw = fs.readFileSync(path.join(dir, file), 'utf-8');
    const { data, content } = matter(raw);
    const postSlug = data.slug ?? file.replace(/\.md$/, '');
    if (postSlug === slug) {
      return {
        slug: postSlug,
        title: data.title ?? '',
        description: data.description ?? '',
        date: data.date ?? '',
        author: data.author ?? 'GeoSerra',
        authorUrl: data.authorUrl ?? 'https://geoserra.com/hakkimizda',
        category: data.category ?? 'Genel',
        tags: data.tags ?? [],
        image: data.image ?? '/og-image.png',
        readTime: data.readTime ?? '5 dk',
        content,
      };
    }
  }
  return null;
}
