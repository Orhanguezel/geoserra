'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { t } from '@/lib/t';
import { useLocaleStore } from '@/stores/locale-store';
import { useCurrencyStore } from '@/stores/currency-store';
import { formatCurrency } from '@/lib/utils';
import { CurrencyToggle } from './currency-toggle';

const ONCE_PACKAGES = [
  { slug: 'starter', price: 5,  featureKeys: ['pricing_features.once_1', 'pricing_features.once_2', 'pricing_features.once_3', 'pricing_features.once_4'] },
  { slug: 'pro',     price: 15, popular: true, featureKeys: ['pricing_features.pro_1', 'pricing_features.pro_2', 'pricing_features.pro_3', 'pricing_features.pro_4'] },
  { slug: 'expert',  price: 50, featureKeys: ['pricing_features.expert_1', 'pricing_features.expert_2', 'pricing_features.expert_3', 'pricing_features.expert_4'] },
];

const MONTHLY_PACKAGES = [
  { slug: 'monitor', price: 19, featureKeys: ['pricing_features.monitor_1', 'pricing_features.monitor_2', 'pricing_features.monitor_3', 'pricing_features.monitor_4'] },
  { slug: 'growth', price: 49, popular: true, featureKeys: ['pricing_features.growth_1', 'pricing_features.growth_2', 'pricing_features.growth_3', 'pricing_features.growth_4'] },
  { slug: 'agency', price: 129, featureKeys: ['pricing_features.agency_1', 'pricing_features.agency_2', 'pricing_features.agency_3', 'pricing_features.agency_4'] },
];

export function PricingSection() {
  const locale = useLocaleStore((s) => s.locale);
  const { currency, rates } = useCurrencyStore();
  const [tab, setTab] = useState<'once' | 'monthly'>('once');

  const activePackages = tab === 'once' ? ONCE_PACKAGES : MONTHLY_PACKAGES;

  return (
    <section id="pricing" className="relative overflow-hidden py-24 md:py-32">
      <div className="container relative z-10 px-4">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="mb-6 text-3xl font-extrabold tracking-tight text-foreground md:text-5xl">{t('pricing.title', {}, locale)}</h2>
          <p className="text-lg text-muted-foreground">{t('pricing.subtitle', {}, locale)}</p>
        </div>

        <div className="mb-16 flex flex-col items-center justify-center gap-6 md:flex-row">
          <div className="flex rounded-xl border border-border bg-card p-1">
            <button
              onClick={() => setTab('once')}
              className={`rounded-lg px-6 py-2.5 text-sm font-bold transition-all ${tab === 'once' ? 'border border-emerald-500/20 bg-muted text-emerald-500 shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {t('pricing.once', {}, locale)}
            </button>
            <button
              onClick={() => setTab('monthly')}
              className={`rounded-lg px-6 py-2.5 text-sm font-bold transition-all ${tab === 'monthly' ? 'border border-emerald-500/20 bg-muted text-emerald-500 shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {t('pricing.monthly', {}, locale)}
            </button>
          </div>
          <div className="hidden h-8 w-px bg-border md:block" />
          <CurrencyToggle />
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {activePackages.map((pkg, i) => (
            <motion.div
              key={`${tab}-${pkg.slug}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className={`relative flex flex-col rounded-3xl border p-8 transition-all duration-500 ${
                pkg.popular
                  ? 'border-emerald-500/50 bg-gradient-to-b from-emerald-500/5 to-card shadow-[0_20px_60px_-15px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/20'
                  : 'border-border bg-card hover:border-emerald-500/20'
              }`}
            >
              {pkg.popular ? (
                <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-700 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white shadow-lg shadow-emerald-700/20">
                  {t('pricing.most_popular', {}, locale)}
                </div>
              ) : null}

              <div className={pkg.popular ? 'pt-2' : ''}>
                <h3 className="mb-2 text-xl font-bold text-foreground">{t(`pricing.${pkg.slug}.name`, {}, locale)}</h3>
                <p className="text-sm text-muted-foreground">{t(`pricing.${pkg.slug}.desc`, {}, locale)}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold tracking-tight text-foreground">
                    {formatCurrency(pkg.price, currency, rates)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    / {tab === 'once' ? t('pricing.per_report', {}, locale) : t('pricing.per_month', {}, locale)}
                  </span>
                </div>
              </div>

              <ul className="mb-10 mt-8 flex-1 space-y-4">
                {pkg.featureKeys.map((featureKey) => (
                  <li key={featureKey} className="flex items-start gap-3 text-[13px] leading-snug text-muted-foreground">
                    <div className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
                      <Check size={10} className="text-emerald-500" />
                    </div>
                    {t(featureKey, {}, locale)}
                  </li>
                ))}
              </ul>

              <Link
                href={`/checkout/${pkg.slug}`}
                className={`block w-full rounded-2xl py-4 text-center text-sm font-bold uppercase tracking-widest transition-all ${
                  pkg.popular
                    ? 'bg-emerald-700 text-white hover:bg-emerald-800 hover:shadow-xl hover:shadow-emerald-700/25'
                    : 'bg-muted text-foreground hover:bg-muted/80'
                }`}
              >
                {t('pricing.cta', {}, locale)}
              </Link>
            </motion.div>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{t('pricing.free_tier', {}, locale)}:</span>{' '}
          {t('pricing.free_tier_desc', {}, locale)} —{' '}
          <Link href="/analyze" className="text-primary underline underline-offset-2">{t('nav.analyze', {}, locale)}</Link>
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <a
            href="/assets/sample-report.pdf"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-5 py-2.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
          >
            📄 {locale === 'tr' ? 'Örnek PDF Raporunu İndir' : 'Download Sample PDF'}
          </a>
          <span className="text-xs text-muted-foreground">
            {locale === 'tr' ? '(Ücretli paketlerde ne tür rapor alacağınızı görün)' : '(See what paid packages deliver)'}
          </span>
        </div>
      </div>
    </section>
  );
}
