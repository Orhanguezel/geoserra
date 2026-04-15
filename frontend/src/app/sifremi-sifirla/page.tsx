import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ResetPasswordClient } from './reset-client';

export const metadata: Metadata = {
  title: 'Şifre Sıfırla — GeoSerra',
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[calc(100vh-64px)] items-center justify-center"><span className="text-white/50">Yükleniyor…</span></div>}>
      <ResetPasswordClient />
    </Suspense>
  );
}
