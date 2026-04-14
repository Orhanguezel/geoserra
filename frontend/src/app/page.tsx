import type { Metadata } from 'next';
import { HeroSection } from '@/components/home/hero-section';
import { TrustBar } from '@/components/home/trust-bar';
import { FeaturesSection } from '@/components/home/features-section';
import { HowItWorksSection } from '@/components/home/how-it-works-section';
import { ReportPreviewSection } from '@/components/home/report-preview-section';
import { PricingSection } from '@/components/home/pricing-section';
import { TestimonialsSection } from '@/components/home/testimonials-section';
import { FaqSection } from '@/components/home/faq-section';
import { CtaBanner } from '@/components/home/cta-banner';

export const metadata: Metadata = {
  title: 'GeoSerra — GEO SEO Performance',
  description: 'Yapay zeka destekli SEO analizi. Sitenizin Google AI, ChatGPT ve Perplexity\'deki görünürlüğünü artırın.',
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TrustBar />
      <FeaturesSection />
      <HowItWorksSection />
      <ReportPreviewSection />
      <PricingSection />
      <TestimonialsSection />
      <FaqSection />
      <CtaBanner />
    </>
  );
}
