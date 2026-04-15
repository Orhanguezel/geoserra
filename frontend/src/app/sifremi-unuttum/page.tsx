import type { Metadata } from 'next';
import { ForgotPasswordClient } from './forgot-client';

export const metadata: Metadata = {
  title: 'Şifremi Unuttum — GeoSerra',
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordClient />;
}
