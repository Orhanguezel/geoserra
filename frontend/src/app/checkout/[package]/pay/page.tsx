import type { Metadata } from 'next';
import { StripePayPage } from '@/components/checkout/stripe-pay-page';

export const metadata: Metadata = { title: 'Ödeme — GeoSerra' };

export default function PayPage() {
  return <StripePayPage />;
}
