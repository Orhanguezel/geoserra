import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllPosts } from '@/lib/blog';
import { Calendar, Clock, Tag } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Blog — GEO & SEO Rehberleri | GeoSerra',
  description: 'GEO (Generative Engine Optimization), AI arama görünürlüğü, SEO ve web performansı hakkında rehberler ve analizler.',
  alternates: { canonical: 'https://geoserra.com/blog' },
  openGraph: {
    title: 'GeoSerra Blog — GEO & SEO Rehberleri',
    description: 'AI arama motorlarında görünürlük kazanmak için kapsamlı rehberler.',
    url: 'https://geoserra.com/blog',
    siteName: 'GeoSerra',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'GeoSerra Blog — GEO & SEO Rehberleri' }],
  },
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: 'https://geoserra.com' },
    { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://geoserra.com/blog' },
  ],
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <main className="min-h-screen py-20 md:py-28">
        <div className="container max-w-4xl">
          <div className="mb-12 text-center">
            <h1 className="text-3xl font-bold md:text-4xl">GEO & SEO Rehberleri</h1>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Yapay zeka arama motorlarında görünürlük kazanmak, GEO skorunuzu artırmak ve
              AI sistemleri tarafından alıntılanmak için kapsamlı rehberler.
            </p>
          </div>

          {posts.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-12 text-center text-muted-foreground">
              Yakında içerik eklenecek.
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group block rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:bg-card/80"
                >
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-3">
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
                  <h2 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors mb-2">
                    {post.title}
                  </h2>
                  <p className="text-sm text-muted-foreground leading-6">{post.description}</p>
                  {post.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {post.tags.slice(0, 4).map((tag) => (
                        <span key={tag} className="flex items-center gap-1 rounded-full border border-border bg-muted/30 px-2.5 py-0.5 text-xs text-muted-foreground">
                          <Tag size={9} />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}

          {/* CTA */}
          <div className="mt-16 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8 text-center">
            <h2 className="text-xl font-semibold">Sitenizin GEO Skorunu Öğrenin</h2>
            <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
              Teorik bilgiyi pratiğe dökün. Ücretsiz GEO analizi ile sitenizin mevcut durumunu görün.
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
