import type { Metadata } from 'next';
import { CompareClient } from '@/components/compare/compare-client';

export const metadata: Metadata = {
  title: 'Analiz Karşılaştırma — GeoSerra',
  description: 'İki analiz arasındaki skor değişimini görüntüleyin',
  robots: { index: false, follow: false },
};

export default async function ComparePage({
  params,
}: {
  params: Promise<{ base: string; current: string }>;
}) {
  const { base, current } = await params;
  return <CompareClient baseId={base} currentId={current} />;
}
