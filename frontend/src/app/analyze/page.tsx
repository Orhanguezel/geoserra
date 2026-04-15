import type { Metadata } from 'next';
import { AnalyzeClient } from '@/components/analyze/analyze-client';

export const metadata: Metadata = {
  title: 'Ücretsiz GEO SEO Analizi — URL Gir, Skoru Gör',
  description: 'Web sitenizin ChatGPT, Gemini ve Perplexity görünürlüğünü saniyeler içinde analiz et. Ücretsiz, kayıt gerekmez.',
  alternates: { canonical: 'https://geoserra.com/analyze' },
  openGraph: {
    title: 'Ücretsiz GEO SEO Analizi',
    description: 'Web sitenizin ChatGPT, Gemini ve Perplexity görünürlüğünü saniyeler içinde analiz et.',
    url: 'https://geoserra.com/analyze',
    siteName: 'GeoSerra',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'GeoSerra — Ücretsiz GEO SEO Analizi' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ücretsiz GEO SEO Analizi',
    description: 'AI aramalardaki görünürlüğünü saniyeler içinde analiz et.',
    images: ['/og-image.png'],
  },
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: 'https://geoserra.com' },
    { '@type': 'ListItem', position: 2, name: 'Ücretsiz GEO SEO Analizi', item: 'https://geoserra.com/analyze' },
  ],
};

export default function AnalyzePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <AnalyzeClient />
    </>
  );
}
