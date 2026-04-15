'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { forgotPassword } from '@/lib/api';
import { Mail } from 'lucide-react';

export function ForgotPasswordClient() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setLoading(true);
      await forgotPassword(email);
      setSent(true);
    } catch {
      toast.error('Bir hata oluştu, lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-xl">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400">
            <Mail size={22} />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Şifremi Unuttum</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            E-posta adresinizi girin, şifre sıfırlama bağlantısı gönderelim.
          </p>

          {sent ? (
            <div className="mt-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-sm text-emerald-400">
              E-posta gönderildi! Gelen kutunuzu kontrol edin. (Spam klasörünü de kontrol edin.)
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="email" className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1.5">
                  E-posta
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition"
                  placeholder="ornek@email.com"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-50 transition"
              >
                {loading ? 'Gönderiliyor…' : 'Sıfırlama Bağlantısı Gönder'}
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
