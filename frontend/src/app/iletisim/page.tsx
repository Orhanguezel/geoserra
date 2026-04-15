import type { Metadata } from 'next';
import { ContactClient } from './contact-client';

export const metadata: Metadata = {
  title: 'İletişim — GeoSerra',
  description: 'GeoSerra ile iletişime geçin. GEO SEO raporları, implementation ve iş birliği konuları için bize yazın.',
  alternates: { canonical: 'https://geoserra.com/iletisim' },
  openGraph: {
    title: 'GeoSerra İletişim',
    description: 'Rapor, implementation ve iş birliği konuları için bize ulaşın.',
    url: 'https://geoserra.com/iletisim',
    siteName: 'GeoSerra',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'GeoSerra — İletişim' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GeoSerra İletişim',
    description: 'Rapor, implementation ve iş birliği konuları için bize ulaşın.',
    images: ['/og-image.png'],
  },
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: 'https://geoserra.com' },
    { '@type': 'ListItem', position: 2, name: 'İletişim', item: 'https://geoserra.com/iletisim' },
  ],
};

const contactSchema = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  '@id': 'https://geoserra.com/#service',
  name: 'GeoSerra',
  url: 'https://geoserra.com',
  email: 'info@geoserra.com',
  areaServed: { '@type': 'Country', name: 'Turkey' },
  openingHours: 'Mo-Fr 09:00-18:00',
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    email: 'info@geoserra.com',
    availableLanguage: ['Turkish', 'English'],
    hoursAvailable: { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday'], opens: '09:00', closes: '18:00' },
  },
};

export default function IletisimPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactSchema) }}
      />
      <ContactClient />
    </>
  );
}
