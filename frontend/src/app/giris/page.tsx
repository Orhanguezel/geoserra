import type { Metadata } from 'next';
import { LoginClient } from './login-client';

export const metadata: Metadata = {
  title: 'Giriş Yap — GeoSerra',
  description: 'GeoSerra hesabınıza Google veya e-posta ile giriş yapın.',
};

export default function LoginPage() {
  return <LoginClient />;
}
