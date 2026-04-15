import type { Metadata } from 'next';
import { AnalyzeClient } from '@/components/analyze/analyze-client';

export const metadata: Metadata = {
  title: 'Ücretsiz GEO SEO Analizi — URL Gir, Skoru Gör',
  description: 'Web sitenizin ChatGPT, Gemini ve Perplexity görünürlüğünü saniyeler içinde analiz et. Ücretsiz, kayıt gerekmez.',
  openGraph: {
    title: 'Ücretsiz GEO SEO Analizi',
    description: 'Web sitenizin ChatGPT, Gemini ve Perplexity görünürlüğünü saniyeler içinde analiz et.',
    url: 'https://geoserra.com/analyze',
    siteName: 'GeoSerra',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ücretsiz GEO SEO Analizi',
    description: 'AI aramalardaki görünürlüğünü saniyeler içinde analiz et.',
    images: ['/og-image.png'],
  },
};

export default function AnalyzePage() {
  return <AnalyzeClient />;
}
