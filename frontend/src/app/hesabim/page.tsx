import type { Metadata } from 'next';
import { AccountClient } from './account-client';

export const metadata: Metadata = {
  title: 'Hesabım — GeoSerra',
  description: 'Geçmiş analizlerinizi görüntüleyin ve hesabınızı yönetin.',
};

export default function AccountPage() {
  return <AccountClient />;
}
