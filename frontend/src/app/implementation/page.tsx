import type { Metadata } from 'next';
import { ImplementationClient } from '@/components/implementation/implementation-client';

export const metadata: Metadata = {
  title: 'Implementation Hizmeti — GeoSerra',
  description: 'cPanel veya VPS erişiminizi paylaşın, teknik SEO değişikliklerini sizin için uygulayalım. 4-8 saat içinde teslim.',
  alternates: { canonical: 'https://geoserra.com/implementation' },
  openGraph: {
    title: 'GeoSerra Implementation Hizmeti',
    description: 'Teknik GEO/SEO değişikliklerini sizin sunucunuzda doğrudan uyguluyoruz.',
    url: 'https://geoserra.com/implementation',
    siteName: 'GeoSerra',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'GeoSerra Implementation Hizmeti — Teknik GEO/SEO Uygulama' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GeoSerra Implementation Hizmeti',
    description: 'Rapor sonrası teknik uygulamaları uzman ekiple tamamlayın.',
    images: ['/og-image.png'],
  },
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: 'https://geoserra.com' },
    { '@type': 'ListItem', position: 2, name: 'Implementation Hizmeti', item: 'https://geoserra.com/implementation' },
  ],
};

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': 'https://geoserra.com/implementation#service',
  name: 'GEO/SEO Implementation Hizmeti',
  description: 'cPanel veya VPS erişiminizi paylaşın, raporunuzdaki teknik GEO/SEO aksiyonlarını sizin sunucunuzda doğrudan uygulayalım.',
  url: 'https://geoserra.com/implementation',
  provider: {
    '@type': 'Organization',
    '@id': 'https://geoserra.com/#org',
    name: 'GeoSerra',
  },
  areaServed: { '@type': 'Country', name: 'Turkey' },
  offers: {
    '@type': 'Offer',
    name: 'Implementation Hizmeti',
    price: '99',
    priceCurrency: 'USD',
    url: 'https://geoserra.com/implementation',
    availability: 'https://schema.org/InStock',
  },
  serviceType: 'Technical SEO Implementation',
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Implementation Hizmetleri',
    itemListElement: [
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'robots.txt ve llms.txt oluşturma' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'JSON-LD schema markup ekleme' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Nginx / .htaccess güvenlik header\'ları' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Canonical URL ve hreflang yapılandırması' } },
    ],
  },
};

export default function ImplementationPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <ImplementationClient />
    </>
  );
}
