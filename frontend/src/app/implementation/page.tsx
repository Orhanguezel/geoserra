import type { Metadata } from 'next';
import { ImplementationClient } from '@/components/implementation/implementation-client';

export const metadata: Metadata = {
  title: 'Implementation Hizmeti — GeoSerra',
  description: 'cPanel veya VPS erişiminizi paylaşın, teknik SEO değişikliklerini sizin için uygulayalım.',
  openGraph: {
    title: 'GeoSerra Implementation Hizmeti',
    description: 'Teknik SEO değişikliklerini sizin için uygulayalım.',
    url: 'https://geoserra.com/implementation',
    siteName: 'GeoSerra',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GeoSerra Implementation Hizmeti',
    description: 'Rapor sonrası teknik uygulamaları uzman ekiple tamamlayın.',
  },
};

export default function ImplementationPage() {
  return <ImplementationClient />;
}
