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
  title: 'GeoSerra — AI Görünürlük & SEO Analiz Platformu',
  description: 'Web sitenizin ChatGPT, Gemini ve Perplexity\'deki görünürlüğünü analiz edin. GEO + SEO + Lighthouse raporu tek platformda.',
  alternates: { canonical: 'https://geoserra.com' },
  openGraph: {
    title: 'GeoSerra — AI Görünürlük & SEO Analiz Platformu',
    description: 'Web sitenizin ChatGPT, Gemini ve Perplexity\'deki görünürlüğünü analiz edin.',
    url: 'https://geoserra.com',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'GeoSerra — AI Görünürlük & SEO Analiz Platformu' }],
  },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Ücretsiz analiz ne içeriyor?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Ücretsiz analiz; temel SEO skoru, performans metrikleri (LCP, CLS), DNS kontrolü ve birkaç kritik öneri sunar. Her domain için yalnızca 1 kez kullanılabilir.',
      },
    },
    {
      '@type': 'Question',
      name: 'Ücretli rapor ne zaman teslim edilir?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Ödeme onaylandıktan sonra analiz otomatik başlar. 20+ metrik tarandıktan sonra rapor 5-10 dakika içinde e-postanıza PDF olarak iletilir.',
      },
    },
    {
      '@type': 'Question',
      name: 'Kredi kartım güvende mi?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Ödemeler Stripe ve PayPal altyapısıyla işlenir. Kart bilgileriniz GeoSerra sunucularında hiçbir zaman saklanmaz.',
      },
    },
    {
      '@type': 'Question',
      name: 'Implementation hizmetinde erişim bilgilerimi güvende mi?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'cPanel veya SSH bilgileriniz yalnızca işlem sırasında kullanılır ve veritabanımıza kaydedilmez. İşlem tamamlandıktan sonra şifrenizi değiştirmenizi öneririz.',
      },
    },
    {
      '@type': 'Question',
      name: 'Hangi AI platformları için analiz yapılıyor?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Google AI Overviews, ChatGPT web araması, Perplexity AI ve Bing Copilot için görünürlük ve citability analizi yapılmaktadır.',
      },
    },
    {
      '@type': 'Question',
      name: 'Raporumu nasıl indirebilirim?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Rapor hazır olduğunda e-postanıza PDF olarak gönderilir. Aynı zamanda /report/[id] adresinden de durumu izleyebilir ve PDF\'i doğrudan indirebilirsiniz.',
      },
    },
  ],
};

const productSchema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'GeoSerra Analiz Paketleri',
  description: 'GEO + SEO + Lighthouse analiz raporları için fiyatlandırma paketleri',
  url: 'https://geoserra.com/pricing',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      item: {
        '@type': 'Product',
        name: 'GeoSerra Başlangıç Raporu',
        description: '8 kategori tam GEO/SEO/Lighthouse analizi, PDF rapor, 30 öncelikli aksiyon maddesi',
        url: 'https://geoserra.com/checkout/starter',
        brand: { '@type': 'Brand', name: 'GeoSerra' },
        offers: {
          '@type': 'Offer',
          price: '9.00',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
          url: 'https://geoserra.com/checkout/starter',
        },
      },
    },
    {
      '@type': 'ListItem',
      position: 2,
      item: {
        '@type': 'Product',
        name: 'GeoSerra Pro Raporu',
        description: 'Başlangıç + AI citability derinlemesine analizi, schema markup önerileri, rakip karşılaştırması',
        url: 'https://geoserra.com/checkout/pro',
        brand: { '@type': 'Brand', name: 'GeoSerra' },
        offers: {
          '@type': 'Offer',
          price: '29.00',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
          url: 'https://geoserra.com/checkout/pro',
        },
      },
    },
    {
      '@type': 'ListItem',
      position: 3,
      item: {
        '@type': 'Product',
        name: 'GeoSerra Uzman Raporu',
        description: 'Pro + 1 saatlik teknik implementasyon dahil, cPanel/VPS üzerinde doğrudan uygulama',
        url: 'https://geoserra.com/checkout/expert',
        brand: { '@type': 'Brand', name: 'GeoSerra' },
        offers: {
          '@type': 'Offer',
          price: '99.00',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
          url: 'https://geoserra.com/checkout/expert',
        },
      },
    },
  ],
};

const reviewSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'GeoSerra',
  applicationCategory: 'BusinessApplication',
  url: 'https://geoserra.com',
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '5',
    reviewCount: '3',
    bestRating: '5',
    worstRating: '1',
  },
  review: [
    {
      '@type': 'Review',
      author: { '@type': 'Person', name: 'Ayşe Kaya' },
      reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
      reviewBody: 'GeoSerra sayesinde Perplexity\'de ilk sayfada görünmeye başladım. llms.txt ve schema düzeltmeleri sonrası organik trafiğim 3 ayda %40 arttı.',
      datePublished: '2026-03-10',
    },
    {
      '@type': 'Review',
      author: { '@type': 'Person', name: 'Mehmet Demir' },
      reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
      reviewBody: 'Müşterilerime sunduğum en değerli araç. Schema ve AI visibility raporları somut aksiyon maddesi üretiyor.',
      datePublished: '2026-03-20',
    },
    {
      '@type': 'Review',
      author: { '@type': 'Person', name: 'Selin Özdemir' },
      reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
      reviewBody: 'Expert raporu ve implementation paketi aldık. 6 hafta içinde ChatGPT aramalarında marka adımız çıkmaya başladı. GEO skorum 41\'den 88\'e yükseldi.',
      datePublished: '2026-04-01',
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewSchema) }}
      />
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
