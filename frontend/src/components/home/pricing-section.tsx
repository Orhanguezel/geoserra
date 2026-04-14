'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Sparkles, ArrowRight } from 'lucide-react';
import { t } from '@/lib/t';
import { useLocaleStore } from '@/stores/locale-store';
import { useCurrencyStore } from '@/stores/currency-store';
import { formatCurrency } from '@/lib/utils';
import { CurrencyToggle } from './currency-toggle';

const ONCE_PACKAGES = [
  { slug: 'starter', price: 29, features: ['Technical SEO tam analiz', 'Performance & Core Web Vitals', 'On-Page SEO', 'Schema markup', 'AI crawler analizi', '30+ aksiyon', 'PDF rapor'] },
  { slug: 'pro', price: 59, popular: true, features: ["Starter'daki her şey", 'AI Citability skoru', 'Marka mention analizi', 'Schema JSON-LD önerileri', 'Keyword analizi', 'Rakip karşılaştırması', 'E-E-A-T değerlendirmesi'] },
  { slug: 'expert', price: 99, features: ["Pro'daki her şey", '1 saat implementasyon', 'robots.txt optimizasyonu', 'Sitemap güncelleme', 'Temel schema kurulumu', 'Öncelikli destek'] },
];

const MONTHLY_PACKAGES = [
  { slug: 'monitor', price: 39, features: ['Haftalık otomatik tarama', 'Email bildirimleri', 'Performance tracking', 'Keyword takibi (5)', 'AI visibility monitoring'] },
  { slug: 'growth', price: 79, popular: true, features: ['Günlük otomatik tarama', 'Rakip takibi (3)', 'Keyword takibi (20)', 'Öncelikli raporlama', 'Aylık uzman görüşü'] },
  { slug: 'agency', price: 149, features: ['Sınırsız proje (5)', 'Agency white-label PDF', 'API erişimi', 'Özel destek hattı', 'Ekiplerle paylaşım'] },
];

export function PricingSection() {
  const locale = useLocaleStore((s) => s.locale);
  const { currency, rates } = useCurrencyStore();
  const [tab, setTab] = useState<'once' | 'monthly'>('once');

  const activePackages = tab === 'once' ? ONCE_PACKAGES : MONTHLY_PACKAGES;

  return (
    <section id="pricing" className="py-24 md:py-32 relative overflow-hidden">
      <div className="container relative z-10 px-4">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <div className="section-eyebrow mb-4">Fiyatlandırma</div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
            Sizin İçin En Uygun Paketi Seçin
          </h2>
          <p className="text-muted-foreground text-lg">
            Kısa süreli ihtiyaçlarınız için tek seferlik analizler veya sürekli takip için abonelik modelleri.
          </p>
        </div>

        {/* Tab Switcher & Currency Toggle Row */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-16">
          <div className="bg-[#0f1420] border border-white/10 rounded-xl p-1 flex">
            <button
              onClick={() => setTab('once')}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${tab === 'once' ? 'bg-[#181f30] text-emerald-400 border border-emerald-500/20 shadow-lg' : 'text-muted-foreground hover:text-white'}`}
            >
              Tek Seferlik
            </button>
            <button
              onClick={() => setTab('monthly')}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${tab === 'monthly' ? 'bg-[#181f30] text-emerald-400 border border-emerald-500/20 shadow-lg' : 'text-muted-foreground hover:text-white'}`}
            >
              Aylık Abonelik
            </button>
          </div>
          <div className="hidden md:block w-px h-8 bg-white/10" />
          <CurrencyToggle />
        </div>

        <div className="grid gap-8 md:grid-cols-3 relative">
          <AnimatePresence mode="wait">
            <motion.div 
              key={tab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="grid gap-8 md:grid-cols-3 col-span-3"
            >
              {activePackages.map((pkg, i) => (
                <div
                  key={`${tab}-${pkg.slug}`}
                  className={`relative flex flex-col rounded-3xl border border-white/6 p-8 transition-all duration-500 ${
                    pkg.popular 
                      ? 'border-emerald-500/50 bg-gradient-to-b from-emerald-500/10 to-[#0f1420] shadow-[0_20px_60px_-15px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/20' 
                      : 'bg-[#0f1420] hover:border-white/10'
                  }`}
                >
                  {pkg.popular && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-[10px] font-bold uppercase tracking-[0.2em] text-white px-4 py-1.5 rounded-full shadow-lg shadow-emerald-500/20 flex items-center gap-2">
                      <Sparkles size={10} /> En Popüler
                    </div>
                  )}

                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-white mb-2">{t(`pricing.${pkg.slug}.name`, { defaultValue: pkg.slug.toUpperCase() }, locale)}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold text-white tracking-tight">
                        {formatCurrency(pkg.price, currency, rates)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        / {tab === 'once' ? 'rapor' : 'ay'}
                      </span>
                    </div>
                  </div>

                  <ul className="mb-10 flex-1 space-y-4">
                    {pkg.features.map((f) => (
                      <li key={f} className="flex items-start gap-3 text-[13px] text-muted-foreground leading-snug">
                        <div className="mt-1 h-4 w-4 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                          <Check size={10} className="text-emerald-500" />
                        </div>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={`/checkout/${pkg.slug}`}
                    className={`group relative flex items-center justify-center gap-2 w-full rounded-2xl py-4 text-sm font-bold uppercase tracking-widest transition-all ${
                      pkg.popular 
                        ? 'bg-emerald-500 text-white hover:bg-emerald-600 hover:shadow-xl hover:shadow-emerald-500/25' 
                        : 'bg-white/5 text-white hover:bg-white/10'
                    }`}
                  >
                    Paketi Seç
                    <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        <p className="mt-12 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Kredi kartı gerekmez. İstediğiniz zaman iptal edin.
        </p>
      </div>
    </section>
  );
}
