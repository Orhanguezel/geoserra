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

export function Header() {
  const [open, setOpen] = useState(false);
  const locale = useLocaleStore((s) => s.locale);

  return (
    <header className="sticky top-0 z-50 glass border-b border-border/50">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo-dark.png" alt="GeoSerra" width={140} height={36} className="h-8 w-auto" priority />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {t(link.key, {}, locale)}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="hidden items-center gap-3 md:flex">
          <LanguageSwitcher />
          <Link
            href="/analyze"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            {t('nav.start_free', {}, locale)}
          </Link>
        </div>

        {/* Mobile Menu */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {open && (
        <div className="border-t border-border bg-background px-4 pb-4 md:hidden">
          <nav className="flex flex-col gap-1 pt-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={() => setOpen(false)}
              >
                {t(link.key, {}, locale)}
              </Link>
            ))}
            <div className="mt-2 flex items-center gap-3 px-3">
              <LanguageSwitcher />
              <Link
                href="/analyze"
                className={cn('flex-1 rounded-lg bg-primary py-2 text-center text-sm font-semibold text-primary-foreground')}
                onClick={() => setOpen(false)}
              >
                {t('nav.start_free', {}, locale)}
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
