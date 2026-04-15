'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, ChevronDown, LogOut, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LanguageSwitcher } from './language-switcher';
import { ThemeSwitcher } from './theme-switcher';
import { useLocaleStore } from '@/stores/locale-store';
import { t } from '@/lib/t';
import { useAuthStore } from '@/stores/auth-store';
import { useRouter } from 'next/navigation';
const NAV_LINKS = [
  { key: 'nav.analyze', href: '/analyze' },
  { key: 'nav.pricing', href: '/pricing' },
  { key: 'nav.about', href: '/hakkimizda' },
  { key: 'nav.contact', href: '/iletisim' },
];

function UserMenu() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const locale = useLocaleStore((s) => s.locale);
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <Link href="/giris" className="text-sm font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
          {t('nav.login', {}, locale)}
        </Link>
        <Link href="/kayit" className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-bold uppercase tracking-wider text-white hover:bg-emerald-800 transition-all hover:shadow-[0_4px_12px_rgba(4,120,87,0.3)]">
          {t('nav.register', {}, locale)}
        </Link>
      </div>
    );
  }

  const initials = user.full_name
    ? user.full_name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
    : user.email[0].toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-foreground/80 hover:bg-muted transition-colors"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white">
          {initials}
        </span>
        <span className="hidden sm:block max-w-[120px] truncate text-xs">{user.full_name || user.email}</span>
        <ChevronDown size={14} className={cn('transition-transform', open && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-white/10 bg-card py-1 shadow-xl"
          >
            <Link
              href="/hesabim"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <User size={14} />
              {t('nav.account', {}, locale)}
            </Link>
            <div className="my-1 border-t border-white/10" />
            <button
              onClick={async () => { setOpen(false); await logout(); router.push('/'); }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-red-400 transition-colors"
            >
              <LogOut size={14} />
              {t('nav.logout', {}, locale)}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const locale = useLocaleStore((s) => s.locale);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();
  const { resolvedTheme } = useTheme();

  useEffect(() => { setMounted(true); }, []);

  const logoSrc = mounted && resolvedTheme === 'light'
    ? '/assets/logo-small-light.png'
    : '/assets/logo-small.png';

  return (
    <header className="sticky top-0 z-50 glass border-b border-white/5">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center py-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} alt="GeoSerra" className="h-12 w-auto" width={406} height={98} />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs font-mono uppercase tracking-[0.1em] text-muted-foreground transition-colors hover:text-foreground"
            >
              {t(link.key, {}, locale)}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <LanguageSwitcher />
          <ThemeSwitcher />
          {!user && (
            <Link
              href="/analyze"
              className="rounded-lg bg-emerald-700 px-5 py-2 text-sm font-bold uppercase tracking-wider text-white transition-all hover:bg-emerald-800 hover:shadow-[0_4px_12px_rgba(4,120,87,0.3)]"
            >
              {t('nav.start_free', {}, locale)}
            </Link>
          )}
          <UserMenu />
        </div>

        <button
          className="text-foreground/80 transition-colors hover:text-foreground lg:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute left-0 right-0 top-full overflow-hidden border-b border-white/6 bg-background/95 px-6 py-6 backdrop-blur-xl lg:hidden"
          >
            <nav className="container flex flex-col gap-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-xl px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-white/[0.04] hover:text-foreground"
                  onClick={() => setMenuOpen(false)}
                >
                  {t(link.key, {}, locale)}
                </Link>
              ))}
              <div className="mt-2 flex items-center gap-3">
                <LanguageSwitcher />
                {user ? (
                  <>
                    <Link href="/hesabim" className="flex-1 rounded-xl bg-muted py-2.5 text-center text-sm font-semibold text-foreground" onClick={() => setMenuOpen(false)}>
                      {t('nav.account', {}, locale)}
                    </Link>
                    <button
                      onClick={async () => { setMenuOpen(false); await logout(); router.push('/'); }}
                      className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-red-400"
                    >
                      {t('nav.logout_short', {}, locale)}
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/giris" className="flex-1 rounded-xl border border-border py-2.5 text-center text-sm font-semibold text-foreground" onClick={() => setMenuOpen(false)}>
                      {t('nav.login', {}, locale)}
                    </Link>
                    <Link href="/kayit" className={cn('flex-1 rounded-xl bg-primary py-2.5 text-center text-sm font-semibold text-primary-foreground')} onClick={() => setMenuOpen(false)}>
                      {t('nav.register', {}, locale)}
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
