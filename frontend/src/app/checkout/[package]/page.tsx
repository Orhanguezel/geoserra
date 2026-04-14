import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CheckoutClient } from '@/components/checkout/checkout-client';

const VALID_PACKAGES = ['starter', 'pro', 'expert', 'monitor', 'growth', 'agency'];

export async function generateMetadata({ params }: { params: Promise<{ package: string }> }): Promise<Metadata> {
  const { package: pkg } = await params;
  return {
    title: `${pkg.charAt(0).toUpperCase() + pkg.slice(1)} Paketi — GeoSerra`,
  };
}

export default async function CheckoutPage({ params }: { params: Promise<{ package: string }> }) {
  const { package: pkg } = await params;
  if (!VALID_PACKAGES.includes(pkg)) notFound();

  return <CheckoutClient packageSlug={pkg as 'starter' | 'pro' | 'expert' | 'monitor' | 'growth' | 'agency'} />;
}
