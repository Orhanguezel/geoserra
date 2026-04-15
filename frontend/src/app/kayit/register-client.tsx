'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, Chrome, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth-store';
import { authGoogleLogin, authSignup } from '@/lib/api';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '';

export function RegisterClient() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rulesAccepted, setRulesAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const passwordStrength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthColors = ['', 'bg-red-500', 'bg-amber-500', 'bg-emerald-500'];
  const strengthLabels = ['', 'Zayıf', 'Orta', 'Güçlü'];

  async function handleGoogleClick() {
    if (!GOOGLE_CLIENT_ID) {
      toast.error('Google OAuth henüz yapılandırılmadı');
      return;
    }
    // Trigger google one-tap or redirect
    setGoogleLoading(true);
    try {
      // dynamically load google accounts script
      await new Promise<void>((resolve, reject) => {
      if (window.google?.accounts) { resolve(); return; }
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Google script yüklenemedi'));
        document.head.appendChild(script);
      });
      window.google!.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (resp: { credential: string }) => {
          try {
            const res = await authGoogleLogin(resp.credential);
            setAuth(res.user, res.access_token);
            toast.success('Google ile kayıt olundu');
            router.push('/hesabim');
          } catch (err: any) {
            toast.error(err?.message ?? 'Google kaydı başarısız');
          }
        },
      });
      window.google!.accounts.id.prompt();
    } catch (err: any) {
      toast.error(err?.message ?? 'Google servisi başlatılamadı');
    } finally {
      setGoogleLoading(false);
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (!rulesAccepted) {
      toast.error('Kullanım koşullarını kabul etmelisiniz');
      return;
    }
    try {
      setLoading(true);
      const res = await authSignup({ full_name: fullName, email, password, rules_accepted: true });
      setAuth(res.user, res.access_token);
      toast.success('Hesabınız oluşturuldu');
      router.push('/hesabim');
    } catch (err: any) {
      toast.error(err?.message ?? 'Kayıt başarısız');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-16 overflow-hidden">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 bg-background">
        <div className="absolute left-1/4 top-0 h-72 w-72 rounded-full bg-emerald-500/10 blur-[100px]" />
        <div className="absolute right-1/4 bottom-0 h-64 w-64 rounded-full bg-cyan-500/8 blur-[80px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-md"
      >
        {/* Card */}
        <div className="rounded-2xl border border-white/[0.08] bg-card/90 p-8 shadow-2xl backdrop-blur-xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30">
              <Check size={22} strokeWidth={2.5} />
            </div>
            <h1 className="text-2xl font-bold text-white">Üye Ol</h1>
            <p className="mt-2 text-sm text-white/50">
              Zaten hesabınız var mı?{' '}
              <Link href="/giris" className="font-medium text-emerald-400 hover:text-emerald-300 transition-colors">
                Giriş Yap
              </Link>
            </p>
          </div>

          {/* Google Button */}
          {GOOGLE_CLIENT_ID ? (
            <button
              type="button"
              onClick={handleGoogleClick}
              disabled={googleLoading}
              className="mb-5 flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-white/80 transition-all hover:border-white/20 hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {googleLoading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )}
              Google ile Üye Ol
            </button>
          ) : (
            <div className="mb-5 flex w-full items-center justify-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 text-sm text-white/30">
              <Chrome size={18} />
              Google OAuth yapılandırılmadı
            </div>
          )}

          {/* Divider */}
          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/[0.08]" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-card px-3 text-[11px] font-mono uppercase tracking-widest text-white/30">
                veya e-posta ile
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label htmlFor="fullName" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/50">
                Ad Soyad
              </label>
              <input
                id="fullName"
                type="text"
                autoComplete="name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-all focus:border-emerald-500/50 focus:bg-white/[0.06] focus:ring-1 focus:ring-emerald-500/20"
                placeholder="Adınız Soyadınız"
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/50">
                E-posta
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-all focus:border-emerald-500/50 focus:bg-white/[0.06] focus:ring-1 focus:ring-emerald-500/20"
                placeholder="ornek@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/50">
                Şifre
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 pr-11 text-sm text-white placeholder-white/20 outline-none transition-all focus:border-emerald-500/50 focus:bg-white/[0.06] focus:ring-1 focus:ring-emerald-500/20"
                  placeholder="En az 8 karakter"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {/* Strength bar */}
              {password.length > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex flex-1 gap-1">
                    {[1, 2, 3].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          passwordStrength >= level ? strengthColors[passwordStrength] : 'bg-white/10'
                        }`}
                      />
                    ))}
                  </div>
                  <span className={`text-[10px] font-mono font-medium ${passwordStrength === 1 ? 'text-red-400' : passwordStrength === 2 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {strengthLabels[passwordStrength]}
                  </span>
                </div>
              )}
            </div>

            {/* Checkbox */}
            <label className="flex cursor-pointer items-start gap-3 pt-1">
              <div className="relative mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center">
                <input
                  type="checkbox"
                  checked={rulesAccepted}
                  onChange={(e) => setRulesAccepted(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="h-4 w-4 rounded border border-white/20 bg-white/5 transition-all peer-checked:border-emerald-500 peer-checked:bg-emerald-500" />
                {rulesAccepted && (
                  <Check size={10} strokeWidth={3} className="absolute text-white" />
                )}
              </div>
              <span className="text-[13px] leading-relaxed text-white/50">
                <Link href="/kullanim-sartlari" className="text-emerald-400 hover:text-emerald-300 transition-colors">
                  Kullanım Şartları
                </Link>
                {' '}ve{' '}
                <Link href="/gizlilik" className="text-emerald-400 hover:text-emerald-300 transition-colors">
                  Gizlilik Politikası
                </Link>
                'nı okudum ve kabul ediyorum.
              </span>
            </label>

            <button
              type="submit"
              disabled={loading || !rulesAccepted}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:-translate-y-0.5 hover:shadow-emerald-500/35 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <>Üye Ol <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" /></>
              )}
            </button>
          </form>

          {/* Footer note */}
          <p className="mt-6 text-center text-[11px] text-white/25">
            Üye olarak{' '}
            <Link href="/kullanim-sartlari" className="hover:text-white/50 transition-colors">kullanım şartlarını</Link>
            {' '}kabul etmiş olursunuz.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
