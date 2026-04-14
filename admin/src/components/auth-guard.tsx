'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { authApi } from '@/lib/api';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, setUser } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) {
      authApi.me()
        .then((res) => setUser(res.data))
        .catch(() => router.replace('/login'));
    }
  }, [isLoggedIn, setUser, router]);

  if (!isLoggedIn) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
