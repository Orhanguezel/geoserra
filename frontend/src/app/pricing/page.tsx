import type { Metadata } from 'next';
import { PricingSection } from '@/components/home/pricing-section';

export const metadata: Metadata = {
  title: 'Fiyatlandırma — GeoSerra',
  description: 'GeoSerra GEO SEO rapor paketleri. Starter $29, Pro $59, Expert $99.',
};

export default function PricingPage() {
  return (
    <main className="min-h-screen">
      <PricingSection />
    </main>
  );
}
