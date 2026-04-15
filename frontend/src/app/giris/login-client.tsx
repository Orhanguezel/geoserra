'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth-store';
import { authGoogleLogin, authLogin } from '@/lib/api';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '';

export function LoginClient() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleGoogleClick() {
    if (!GOOGLE_CLIENT_ID) {
      toast.error('Google OAuth henüz yapılandırılmadı');
      return;
    }
    setGoogleLoading(true);
    try {
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
            toast.success('Google ile giriş yapıldı');
            router.push('/hesabim');
          } catch (err: any) {
            toast.error(err?.message ?? 'Google girişi başarısız');
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

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    try {
      setLoading(true);
      const res = await authLogin(email, password);
      setAuth(res.user, res.access_token);
      toast.success('Giriş yapıldı');
      router.push('/hesabim');
    } catch (err: any) {
      toast.error(err?.message ?? 'E-posta veya şifre hatalı');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-16 overflow-hidden">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 bg-background">
        <div className="absolute right-1/4 top-0 h-72 w-72 rounded-full bg-emerald-500/10 blur-[100px]" />
        <div className="absolute left-1/4 bottom-0 h-64 w-64 rounded-full bg-cyan-500/8 blur-[80px]" />
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
              <LogIn size={20} strokeWidth={2.5} />
            </div>
            <h1 className="text-2xl font-bold text-white">Giriş Yap</h1>
            <p className="mt-2 text-sm text-white/50">
              Hesabınız yok mu?{' '}
              <Link href="/kayit" className="font-medium text-emerald-400 hover:text-emerald-300 transition-colors">
                Üye Ol
              </Link>
            </p>
          </div>

          {/* Google Button */}
          <button
            type="button"
            onClick={handleGoogleClick}
            disabled={googleLoading || !GOOGLE_CLIENT_ID}
            title={!GOOGLE_CLIENT_ID ? 'Google OAuth yapılandırılmadı' : undefined}
            className="mb-5 flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-white/80 transition-all hover:border-white/20 hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
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
            {GOOGLE_CLIENT_ID ? 'Google ile Giriş Yap' : 'Google OAuth yapılandırılmadı'}
          </button>

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
          <form onSubmit={handleEmailLogin} className="space-y-4">
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
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="password" className="text-xs font-medium uppercase tracking-wider text-white/50">
                  Şifre
                </label>
                <Link href="/sifremi-unuttum" className="text-[11px] text-emerald-400 hover:text-emerald-300 transition-colors">
                  Şifremi Unuttum
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 pr-11 text-sm text-white placeholder-white/20 outline-none transition-all focus:border-emerald-500/50 focus:bg-white/[0.06] focus:ring-1 focus:ring-emerald-500/20"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:-translate-y-0.5 hover:shadow-emerald-500/35 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <>Giriş Yap <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" /></>
              )}
            </button>
          </form>

          {/* Social proof footer */}
          <p className="mt-6 text-center font-mono text-[10px] uppercase tracking-widest text-white/20">
            GeoSerra — AI & SEO Analiz Platformu
          </p>
        </div>
      </motion.div>
    </div>
  );
}
