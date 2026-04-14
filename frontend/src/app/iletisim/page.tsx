import type { Metadata } from 'next';
import { ContactClient } from './contact-client';

export const metadata: Metadata = {
  title: 'İletişim — GeoSerra',
  description: 'GeoSerra ile iletişime geçin. GEO SEO raporları, implementation ve iş birliği konuları için bize yazın.',
  openGraph: {
    title: 'GeoSerra İletişim',
    description: 'Rapor, implementation ve iş birliği konuları için bize ulaşın.',
    url: 'https://geoserra.com/iletisim',
    siteName: 'GeoSerra',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GeoSerra İletişim',
    description: 'Rapor, implementation ve iş birliği konuları için bize ulaşın.',
  },
};

export default function IletisimPage() {
  return <ContactClient />;
}
