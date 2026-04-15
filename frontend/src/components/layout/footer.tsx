'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { t } from '@/lib/t';
import { useLocaleStore } from '@/stores/locale-store';

export function Footer() {
  const locale = useLocaleStore((s) => s.locale);
  const year = new Date().getFullYear();
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => { setMounted(true); }, []);

  const logoSrc = mounted && resolvedTheme === 'light'
    ? '/assets/logo-small-light.png'
    : '/assets/logo-small.png';

  return (
    <footer className="border-t border-border bg-card/50 py-12">
      <div className="container">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logoSrc} alt="GeoSerra" className="h-14 w-auto" width={406} height={98} />
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              {t('footer.tagline', {}, locale)}
            </p>
            <p className="mt-4 text-xs text-muted-foreground">
              {t('footer.copyright', { year }, locale)}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-3 text-sm font-semibold">{t('footer.links_title', {}, locale)}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/analyze" className="hover:text-foreground transition-colors">{t('nav.analyze', {}, locale)}</Link></li>
              <li><Link href="/pricing" className="hover:text-foreground transition-colors">{t('nav.pricing', {}, locale)}</Link></li>
              <li><Link href="/implementation" className="hover:text-foreground transition-colors">{t('implementation.title', {}, locale)}</Link></li>
              <li><Link href="/hakkimizda" className="hover:text-foreground transition-colors">{t('nav.about', {}, locale)}</Link></li>
              <li><Link href="/iletisim" className="hover:text-foreground transition-colors">{t('nav.contact', {}, locale)}</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-3 text-sm font-semibold">{t('footer.legal_title', {}, locale)}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/gizlilik" className="hover:text-foreground transition-colors">{t('footer.privacy', {}, locale)}</Link></li>
              <li><Link href="/kullanim-sartlari" className="hover:text-foreground transition-colors">{t('footer.terms', {}, locale)}</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
