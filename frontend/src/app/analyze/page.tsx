import type { Metadata } from 'next';
import { AnalyzeClient } from '@/components/analyze/analyze-client';

export const metadata: Metadata = {
  title: 'Ücretsiz SEO Analizi — GeoSerra',
  description: 'Sitenizin GEO SEO skorunu 2 dakikada öğrenin. Google AI, ChatGPT ve Perplexity görünürlüğünüzü analiz edin.',
};

export default function AnalyzePage() {
  return <AnalyzeClient />;
}
