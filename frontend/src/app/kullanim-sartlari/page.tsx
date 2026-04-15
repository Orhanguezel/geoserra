import type { Metadata } from 'next';
import { TermsClient } from './terms-client';

export const metadata: Metadata = {
  title: 'Kullanım Şartları — GeoSerra',
  description: 'GeoSerra hizmet kapsamı, ücretsiz analiz limiti, ödeme ve iade şartları.',
  alternates: {
    canonical: 'https://geoserra.com/kullanim-sartlari',
  },
};

export default function TermsPage() {
  return <TermsClient />;
}
