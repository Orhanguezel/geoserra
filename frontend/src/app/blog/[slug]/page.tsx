import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAllPosts, getPostBySlug } from '@/lib/blog';
import { marked } from 'marked';
import { Calendar, Clock, ArrowLeft, Github } from 'lucide-react';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: `${post.title} | GeoSerra Blog`,
    description: post.description,
    alternates: { canonical: `https://geoserra.com/blog/${slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://geoserra.com/blog/${slug}`,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
      images: [{ url: post.image, width: 1200, height: 630, alt: post.title }],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const htmlContent = marked(post.content) as string;

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      '@type': 'Person',
      name: post.author,
      url: post.authorUrl,
    },
    publisher: {
      '@type': 'Organization',
      '@id': 'https://geoserra.com/#org',
      name: 'GeoSerra',
      logo: { '@type': 'ImageObject', url: 'https://geoserra.com/logo.png' },
    },
    image: { '@type': 'ImageObject', url: `https://geoserra.com${post.image}`, width: 1200, height: 630 },
    url: `https://geoserra.com/blog/${slug}`,
    mainEntityOfPage: { '@type': 'WebPage', '@id': `https://geoserra.com/blog/${slug}` },
    keywords: post.tags.join(', '),
    articleSection: post.category,
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: 'https://geoserra.com' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://geoserra.com/blog' },
      { '@type': 'ListItem', position: 3, name: post.title, item: `https://geoserra.com/blog/${slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <main className="min-h-screen py-20 md:py-28">
        <div className="container max-w-3xl">
          {/* Back */}
          <Link
            href="/blog"
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={14} />
            Tüm Yazılar
          </Link>

          {/* Header */}
          <header className="mb-10">
            <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-emerald-400 font-medium">
                {post.category}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={11} />
                {new Date(post.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={11} />
                {post.readTime} okuma
              </span>
            </div>
            <h1 className="text-3xl font-bold md:text-4xl leading-tight">{post.title}</h1>
            <p className="mt-4 text-lg text-muted-foreground leading-7">{post.description}</p>

            {/* Author */}
            <div className="mt-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20 text-sm font-bold text-emerald-400">
                {post.author.split(' ').map((n) => n[0]).join('')}
              </div>
              <div>
                <p className="text-sm font-medium">{post.author}</p>
                <a
                  href={post.authorUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Github size={11} /> GitHub
                </a>
              </div>
            </div>
          </header>

          {/* Content */}
          <article
            className="prose prose-invert prose-emerald max-w-none
              prose-headings:font-bold prose-headings:tracking-tight
              prose-h2:text-xl prose-h3:text-lg
              prose-p:text-muted-foreground prose-p:leading-7
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              prose-strong:text-foreground
              prose-code:rounded prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:text-xs prose-code:font-mono prose-code:text-foreground
              prose-table:text-sm prose-th:text-foreground prose-td:text-muted-foreground
              prose-li:text-muted-foreground
              prose-hr:border-border"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="mt-10 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-border bg-muted/30 px-3 py-1 text-xs text-muted-foreground">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* CTA */}
          <div className="mt-16 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8 text-center">
            <h2 className="text-xl font-semibold">Sitenizin GEO Skoru Nedir?</h2>
            <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
              Bu makalede anlattığımız kriterleri sitenize otomatik olarak uygulayın. Ücretsiz, 2 dakikada sonuç.
            </p>
            <Link
              href="/analyze"
              className="mt-5 inline-flex rounded-xl bg-emerald-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-800"
            >
              Ücretsiz Analiz Yap
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
