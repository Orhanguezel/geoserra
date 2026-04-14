import type { Metadata } from 'next';
import { ImplementationClient } from '@/components/implementation/implementation-client';

export const metadata: Metadata = {
  title: 'Implementation Hizmeti — GeoSerra',
  description: 'cPanel veya VPS erişiminizi paylaşın, teknik SEO değişikliklerini sizin için uygulayalım.',
};

export default function ImplementationPage() {
  return <ImplementationClient />;
}
