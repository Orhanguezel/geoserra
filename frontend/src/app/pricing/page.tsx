import type { Metadata } from 'next';
import { PricingSection } from '@/components/home/pricing-section';

export const metadata: Metadata = {
  title: 'Fiyatlandırma — GeoSerra',
  description: 'GeoSerra GEO SEO rapor paketleri. Starter $29, Pro $59, Expert $99.',
  openGraph: {
    title: 'GeoSerra Fiyatlandırma',
    description: 'Starter, Pro ve Expert GEO SEO rapor paketlerini karşılaştırın.',
    url: 'https://geoserra.com/pricing',
    siteName: 'GeoSerra',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GeoSerra Fiyatlandırma',
    description: 'Starter, Pro ve Expert paketlerini karşılaştırın.',
  },
};

export default function PricingPage() {
  const offerSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: [
      { '@type': 'Offer', name: 'Starter', price: '29', priceCurrency: 'USD', url: 'https://geoserra.com/checkout/starter' },
      { '@type': 'Offer', name: 'Pro', price: '59', priceCurrency: 'USD', url: 'https://geoserra.com/checkout/pro' },
      { '@type': 'Offer', name: 'Expert', price: '99', priceCurrency: 'USD', url: 'https://geoserra.com/checkout/expert' },
    ],
  };

  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(offerSchema) }}
      />
      <PricingSection />
    </main>
  );
}
