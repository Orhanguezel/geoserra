'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { resetPassword } from '@/lib/api';
import { KeyRound, Eye, EyeOff } from 'lucide-react';

export function ResetPasswordClient() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) toast.error('Geçersiz veya eksik token.');
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      toast.error('Şifre en az 8 karakter olmalı.');
      return;
    }
    try {
      setLoading(true);
      await resetPassword(token, password);
      setDone(true);
      setTimeout(() => router.push('/giris'), 2500);
    } catch (err: any) {
      toast.error(err?.response?.data?.error === 'invalid_or_expired_token'
        ? 'Token geçersiz veya süresi dolmuş.'
        : 'Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-xl">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400">
            <KeyRound size={22} />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Yeni Şifre Belirle</h1>
          <p className="mt-2 text-sm text-muted-foreground">En az 8 karakter girin.</p>

          {done ? (
            <div className="mt-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-sm text-emerald-400">
              Şifreniz güncellendi! Giriş sayfasına yönlendiriliyorsunuz…
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="password" className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1.5">
                  Yeni Şifre
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 pr-11 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition"
                    placeholder="En az 8 karakter"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading || !token}
                className="w-full rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-50 transition"
              >
                {loading ? 'Güncelleniyor…' : 'Şifremi Güncelle'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <Link href="/giris" className="text-emerald-400 hover:underline">
              ← Giriş sayfasına dön
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
