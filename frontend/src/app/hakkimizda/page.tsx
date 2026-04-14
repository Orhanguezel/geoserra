import type { Metadata } from 'next';
import { AboutClient } from './about-client';

export const metadata: Metadata = {
  title: 'Hakkımızda — GeoSerra',
  description: 'GeoSerra’nın misyonu, teknoloji yaklaşımı ve AI görünürlük odaklı SEO vizyonu.',
  openGraph: {
    title: 'GeoSerra Hakkında',
    description: 'AI görünürlük odaklı SEO platformu GeoSerra’nın hikayesi ve yaklaşımı.',
    url: 'https://geoserra.com/hakkimizda',
    siteName: 'GeoSerra',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GeoSerra Hakkında',
    description: 'GeoSerra’nın misyonu, teknoloji yaklaşımı ve AI görünürlük vizyonu.',
  },
};

export default function HakkimizdaPage() {
  return <AboutClient />;
}
