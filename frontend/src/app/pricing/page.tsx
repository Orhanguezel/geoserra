import type { Metadata } from 'next';
import { PricingSection } from '@/components/home/pricing-section';

export const metadata: Metadata = {
  title: 'Fiyatlandırma — GeoSerra',
  description: 'GeoSerra GEO SEO rapor paketleri. Starter $29, Pro $59, Expert $99. Tek seferlik ödeme, anında PDF raporu.',
  openGraph: {
    title: 'GeoSerra Fiyatlandırma',
    description: 'Starter, Pro ve Expert GEO SEO rapor paketlerini karşılaştırın.',
    url: 'https://geoserra.com/pricing',
    siteName: 'GeoSerra',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GeoSerra Fiyatlandırma',
    description: 'Starter, Pro ve Expert paketlerini karşılaştırın.',
    images: ['/og-image.png'],
  },
};

export default function PricingPage() {
  const offerSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: [
      { '@type': 'Offer', name: 'Starter', price: '9', priceCurrency: 'USD', url: 'https://geoserra.com/checkout/starter' },
      { '@type': 'Offer', name: 'Pro', price: '29', priceCurrency: 'USD', url: 'https://geoserra.com/checkout/pro' },
      { '@type': 'Offer', name: 'Expert', price: '99', priceCurrency: 'USD', url: 'https://geoserra.com/checkout/expert' },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'GeoSerra\'nın ücretsiz analizi neleri kapsar?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Ücretsiz analiz, web sitenizin GEO skorunu, temel SEO metriklerini ve en kritik 5 sorunu gösterir. Her domain için bir kez kullanılabilir.',
        },
      },
      {
        '@type': 'Question',
        name: 'Ücretli raporda ne var?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Ücretli raporlar; ChatGPT, Gemini ve Perplexity görünürlük analizi, Lighthouse performans skoru, DNS/SSL güvenlik denetimi, önceliklendirilmiş aksiyon listesi ve indirilebilir PDF raporunu içerir.',
        },
      },
      {
        '@type': 'Question',
        name: 'Paketlerde aylık ücret var mı?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Hayır. GeoSerra paketleri tek seferlik ödeme ile çalışır. Aylık abonelik yoktur.',
        },
      },
      {
        '@type': 'Question',
        name: 'Hangi ödeme yöntemlerini kabul ediyorsunuz?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Kredi/banka kartı (Visa, Mastercard, Amex) ve PayPal ile ödeme yapabilirsiniz. Stripe güvencesiyle 256-bit SSL şifreli ödeme.',
        },
      },
      {
        '@type': 'Question',
        name: 'Rapor ne zaman hazır olur?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Ödeme tamamlandıktan sonra analiz otomatik başlar ve genellikle 30-60 saniye içinde tamamlanır. Rapor hem ekranda gösterilir hem de PDF olarak e-posta adresinize gönderilir.',
        },
      },
    ],
  };

  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(offerSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <PricingSection />
    </main>
  );
}
