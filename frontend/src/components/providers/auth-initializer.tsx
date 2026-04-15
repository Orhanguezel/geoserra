'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';

export function AuthInitializer() {
  const { user, refreshMe } = useAuthStore();

  useEffect(() => {
    // Persisted token varsa /auth/user ile doğrula
    if (user) refreshMe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
