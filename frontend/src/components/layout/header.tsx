'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LanguageSwitcher } from './language-switcher';
import { useLocaleStore } from '@/stores/locale-store';
import { t } from '@/lib/t';

const NAV_LINKS = [
  { key: 'nav.analyze', href: '/analyze' },
  { key: 'nav.pricing', href: '/pricing' },
  { key: 'nav.about', href: '/hakkimizda' },
  { key: 'nav.contact', href: '/iletisim' },
];

import { motion, AnimatePresence } from 'framer-motion';

export function Header() {
  const [open, setOpen] = useState(false);
  const locale = useLocaleStore((s) => s.locale);

  return (
    <header className="sticky top-0 z-50 glass border-b border-white/5">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <Image src="/logo-dark.png" alt="GeoSerra" width={140} height={36} className="h-8 w-auto" priority />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs font-mono uppercase tracking-[0.1em] text-muted-foreground transition-colors hover:text-white"
            >
              {t(link.key, {}, locale)}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="hidden items-center gap-6 lg:flex">
          <LanguageSwitcher />
          <Link
            href="/analyze"
            className="rounded-lg bg-emerald-500 px-5 py-2 text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-emerald-600 hover:shadow-[0_4px_12px_rgba(16,185,129,0.3)]"
          >
            {t('nav.start_free', {}, locale)}
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="lg:hidden text-white/80 hover:text-white transition-colors"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="absolute top-full left-0 right-0 bg-[#06090f]/98 backdrop-blur-xl border-b border-white/5 overflow-hidden lg:hidden"
          >
            <nav className="container flex flex-col gap-1 py-8 px-6">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="py-3 text-lg font-medium text-white/80 hover:text-emerald-400 transition-colors border-b border-white/5"
                  onClick={() => setOpen(false)}
                >
                  {t(link.key, {}, locale)}
                </Link>
              ))}
              <div className="mt-6 flex flex-col gap-4">
                <div className="flex items-center justify-between px-1">
                  <span className="text-sm text-muted-foreground uppercase tracking-widest font-mono">Dil Seçimi</span>
                  <LanguageSwitcher />
                </div>
                <Link
                  href="/analyze"
                  className="rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 py-4 text-center text-sm font-bold text-white uppercase tracking-widest shadow-lg shadow-emerald-500/10"
                  onClick={() => setOpen(false)}
                >
                  {t('nav.start_free', {}, locale)}
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
