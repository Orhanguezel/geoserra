import type { Metadata } from 'next';
import { ReportClient } from '@/components/report/report-client';

export const metadata: Metadata = {
  title: 'Rapor Durumu — GeoSerra',
};

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ReportClient id={id} />;
}
