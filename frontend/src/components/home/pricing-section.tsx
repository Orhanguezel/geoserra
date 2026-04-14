'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { t } from '@/lib/t';
import { useLocaleStore } from '@/stores/locale-store';
import { useCurrencyStore } from '@/stores/currency-store';
import { formatCurrency } from '@/lib/utils';
import { CurrencyToggle } from './currency-toggle';

const PACKAGES = [
  {
    slug: 'starter',
    price: 29,
    features: { tr: ['Technical SEO tam analiz', 'Performance & Core Web Vitals', 'On-Page SEO', 'DNS / SPF / DMARC', 'Schema markup', 'AI crawler analizi', '30+ aksiyon', 'PDF rapor'], en: ['Technical SEO full audit', 'Performance & Core Web Vitals', 'On-Page SEO', 'DNS / SPF / DMARC', 'Schema markup', 'AI crawler analysis', '30+ actions', 'PDF report'] },
  },
  {
    slug: 'pro',
    price: 59,
    popular: true,
    features: { tr: ['Starter\'daki her şey', 'AI Citability skoru', 'Marka mention analizi', 'Schema JSON-LD önerileri', 'Keyword analizi', 'llms.txt analizi', 'Rakip karşılaştırması', 'E-E-A-T değerlendirmesi'], en: ['Everything in Starter', 'AI Citability score', 'Brand mention analysis', 'Schema JSON-LD suggestions', 'Keyword analysis', 'llms.txt analysis', 'Competitor comparison', 'E-E-A-T evaluation'] },
  },
  {
    slug: 'expert',
    price: 99,
    features: { tr: ['Pro\'daki her şey', '1 saat implementasyon', 'robots.txt optimizasyonu', 'Sitemap güncelleme', 'Temel schema kurulumu', 'Öncelikli destek'], en: ['Everything in Pro', '1h implementation', 'robots.txt optimization', 'Sitemap update', 'Basic schema setup', 'Priority support'] },
  },
];

export function PricingSection() {
  const locale = useLocaleStore((s) => s.locale);
  const { currency, rates } = useCurrencyStore();

  return (
    <section id="pricing" className="py-20 md:py-28">
      <div className="container">
        <div className="mx-auto mb-4 max-w-2xl text-center">
          <h2 className="text-3xl font-bold md:text-4xl">{t('pricing.title', {}, locale)}</h2>
          <p className="mt-3 text-muted-foreground">{t('pricing.subtitle', {}, locale)}</p>
        </div>

        {/* Currency Toggle */}
        <div className="mb-10 flex justify-center">
          <CurrencyToggle />
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {PACKAGES.map((pkg, i) => (
            <motion.div
              key={pkg.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className={`relative flex flex-col rounded-2xl border p-6 ${pkg.popular ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10' : 'border-border bg-card'}`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                    {t('pricing.most_popular', {}, locale)}
                  </span>
                </div>
              )}

              <div className="mb-4">
                <h3 className="text-lg font-bold">{t(`pricing.${pkg.slug}.name`, {}, locale)}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{t(`pricing.${pkg.slug}.desc`, {}, locale)}</p>
              </div>

              <div className="mb-6">
                <span className="text-3xl font-bold">{formatCurrency(pkg.price, currency, rates)}</span>
                <span className="ml-1 text-sm text-muted-foreground">/ {t('pricing.per_report', {}, locale)}</span>
              </div>

              <ul className="mb-6 flex-1 space-y-2.5">
                {(pkg.features[locale] ?? pkg.features.en).map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check size={14} className="mt-0.5 shrink-0 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={`/checkout/${pkg.slug}`}
                className={`block w-full rounded-lg py-2.5 text-center text-sm font-semibold transition-all ${pkg.popular ? 'bg-primary text-primary-foreground hover:opacity-90' : 'border border-border bg-muted hover:bg-muted/80'}`}
              >
                {t('pricing.cta', {}, locale)}
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Free tier note */}
        <p className="mt-8 text-center text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{t('pricing.free_tier', {}, locale)}:</span>{' '}
          {t('pricing.free_tier_desc', {}, locale)} —{' '}
          <Link href="/analyze" className="text-primary hover:underline">{t('nav.analyze', {}, locale)}</Link>
        </p>
      </div>
    </section>
  );
}
