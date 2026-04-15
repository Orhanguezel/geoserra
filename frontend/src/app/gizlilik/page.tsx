import type { Metadata } from 'next';
import { PrivacyClient } from './privacy-client';

export const metadata: Metadata = {
  title: 'Gizlilik Politikası — GeoSerra',
  description: 'GeoSerra gizlilik politikası, toplanan veriler, kullanım amacı ve KVKK/GDPR hakları.',
  alternates: {
    canonical: 'https://geoserra.com/gizlilik',
  },
};

export default function PrivacyPage() {
  return <PrivacyClient />;
}
