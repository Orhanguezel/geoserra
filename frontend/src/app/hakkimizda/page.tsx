import type { Metadata } from 'next';
import { AboutClient } from './about-client';

export const metadata: Metadata = {
  title: "Hakkımızda — GeoSerra",
  description: "GeoSerra, web sitelerinin ChatGPT, Google AI Overviews ve Perplexity'deki görünürlüğünü ölçen AI destekli GEO/SEO analiz platformudur. Orhan Güzel tarafından kuruldu.",
  alternates: { canonical: 'https://geoserra.com/hakkimizda' },
  openGraph: {
    title: "GeoSerra Hakkında — Kurucu, Misyon ve Teknoloji",
    description: "AI görünürlük odaklı GEO/SEO platformu GeoSerra'nın hikayesi, kurucusu ve teknoloji yaklaşımı.",
    url: 'https://geoserra.com/hakkimizda',
    siteName: 'GeoSerra',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'GeoSerra — Hakkımızda' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: "GeoSerra Hakkında",
    description: "GeoSerra'nın misyonu, kurucusu ve AI görünürlük teknolojisi.",
    images: ['/og-image.png'],
  },
};

const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': 'https://geoserra.com/hakkimizda#orhan-guzel',
  name: 'Orhan Güzel',
  url: 'https://geoserra.com/hakkimizda',
  jobTitle: 'Kurucu & Baş Geliştirici',
  worksFor: {
    '@type': 'Organization',
    '@id': 'https://geoserra.com/#org',
    name: 'GeoSerra',
  },
  description: 'Full-stack geliştirici ve GeoSerra platformunun kurucusu. Next.js, Fastify ve yapay zeka entegrasyonu konularında uzman.',
  sameAs: [
    'https://github.com/Orhanguezel',
    'https://www.linkedin.com/in/orhanguezel',
  ],
  knowsAbout: [
    'Generative Engine Optimization',
    'Search Engine Optimization',
    'Next.js',
    'Fastify',
    'AI Search Visibility',
    'Web Performance',
    'Schema Markup',
  ],
};

export default function HakkimizdaPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <AboutClient />
    </>
  );
}
