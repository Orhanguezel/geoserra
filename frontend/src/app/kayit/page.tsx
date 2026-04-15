import type { Metadata } from 'next';
import { RegisterClient } from './register-client';

export const metadata: Metadata = {
  title: 'Üye Ol — GeoSerra',
  description: "GeoSerra'ya ücretsiz üye olun. Google veya e-posta ile kayıt yapın.",
};

export default function RegisterPage() {
  return <RegisterClient />;
}
