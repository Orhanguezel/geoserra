'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
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

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const locale = useLocaleStore((s) => s.locale);

  return (
    <header className="sticky top-0 z-50 glass border-b border-white/5">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="group flex items-center gap-2">
          <Image src="/logo-small.png" alt="GeoSerra" width={140} height={36} className="h-8 w-auto" priority unoptimized />
        </Link>

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

        <div className="hidden items-center gap-6 lg:flex">
          <LanguageSwitcher />
          <Link
            href="/analyze"
            className="rounded-lg bg-emerald-500 px-5 py-2 text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-emerald-600 hover:shadow-[0_4px_12px_rgba(16,185,129,0.3)]"
          >
            {t('nav.start_free', {}, locale)}
          </Link>
        </div>

        <button
          className="text-white/80 transition-colors hover:text-white lg:hidden"
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
            className="absolute left-0 right-0 top-full overflow-hidden border-b border-white/6 bg-[#06090f]/95 px-6 py-6 backdrop-blur-xl lg:hidden"
          >
            <nav className="container flex flex-col gap-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-xl px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-white/[0.04] hover:text-white"
                  onClick={() => setMenuOpen(false)}
                >
                  {t(link.key, {}, locale)}
                </Link>
              ))}
              <div className="mt-2 flex items-center gap-3">
                <LanguageSwitcher />
                <Link
                  href="/analyze"
                  className={cn('flex-1 rounded-xl bg-primary py-2.5 text-center text-sm font-semibold text-primary-foreground')}
                  onClick={() => setMenuOpen(false)}
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
