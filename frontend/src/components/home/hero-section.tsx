'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Globe, Zap, Shield, BarChart3 } from 'lucide-react';
import { t } from '@/lib/t';
import { useLocaleStore } from '@/stores/locale-store';

export function HeroSection() {
  const locale = useLocaleStore((s) => s.locale);
  const router = useRouter();
  const [url, setUrl] = useState('');
  const heroNote = useMemo(
    () => (locale === 'tr' ? 'Ucretsiz · 1 analiz/domain · Kredi karti gerekmez' : 'Free · 1 analysis/domain · No credit card required'),
    [locale],
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = url.trim();
    router.push(q ? `/analyze?url=${encodeURIComponent(q)}` : '/analyze');
  }

  return (
    <section className="hero-mesh relative flex min-h-screen items-center overflow-hidden pt-20">
      <div className="hero-grid" />

      <div className="absolute left-[5%] top-1/2 z-20 hidden -translate-y-1/2 flex-col gap-8 xl:flex">
        <FloatCard
          label="GEO SKORU"
          value="94"
          icon={<Globe className="text-emerald-500" size={18} />}
          sub=""
          className="animate-float"
        />
        <FloatCard
          label="AI CITABILITY"
          value="87"
          icon={<Zap className="text-cyan-500" size={18} />}
          sub=""
          className="animate-float-delayed"
        />
      </div>

      <div className="absolute right-[5%] top-1/2 z-20 hidden -translate-y-1/2 flex-col gap-8 xl:flex">
        <FloatCard
          label="LIGHTHOUSE"
          value="91"
          icon={<BarChart3 className="text-emerald-500" size={18} />}
          sub=""
          className="animate-float"
        />
        <FloatCard
          label="SORUN TESPIT"
          value="23"
          icon={<Shield className="text-amber-500" size={18} />}
          sub="aksiyona hazir"
          className="animate-float-delayed"
        />
      </div>

      <div className="container relative z-10 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-border bg-muted/50 px-4 py-2 backdrop-blur-md"
        >
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500">
            <span className="animate-pulse-ring absolute inset-0 rounded-full bg-emerald-500" />
          </span>
          <span className="text-xs font-mono font-medium uppercase tracking-wide text-foreground/70">
            {t('hero.badge', {}, locale)}
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mx-auto mb-6 max-w-4xl text-5xl font-extrabold tracking-tight text-foreground md:text-7xl"
        >
          {t('hero.title', {}, locale)}{' '}<span className="text-gradient">{t('hero.title_highlight', {}, locale)}</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl"
        >
          {t('hero.description', {}, locale)}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mx-auto mb-6 max-w-[620px]"
        >
          <div className="rounded-2xl border border-border bg-card p-1.5 backdrop-blur-xl transition-all focus-within:border-emerald-500/50 focus-within:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]">
            <form className="flex flex-col gap-2 sm:flex-row" onSubmit={handleSubmit}>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={t('analyze.url_placeholder', {}, locale)}
                className="flex-1 bg-transparent px-4 py-4 font-mono text-[15px] text-foreground outline-none placeholder:text-muted-foreground"
              />
              <button
                type="submit"
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 px-8 py-4 text-sm font-bold text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(16,185,129,0.35)]"
              >
                {t('hero.cta_primary', {}, locale)} <ArrowRight size={16} />
              </button>
            </form>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-12 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground"
        >
          {heroNote}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 border-t border-border pt-8"
        >
          {['ChatGPT', 'Gemini', 'Perplexity', 'Google AI', 'Bing'].map((platform) => (
            <span
              key={platform}
              className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground/80"
            >
              <span className="h-1 w-1 rounded-full bg-emerald-500/40" /> {platform}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function FloatCard({
  label,
  value,
  icon,
  sub,
  className,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  sub: string;
  className: string;
}) {
  return (
    <div className={`min-w-[210px] rounded-2xl border border-border bg-card p-5 shadow-md backdrop-blur ${className}`}>
      <div className="mb-4 flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-muted/50">
          {icon}
        </div>
        <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
      </div>
      <div className="mt-4 flex items-end gap-2">
        <div className="text-4xl font-bold tracking-tight text-foreground">{value}</div>
        {sub ? <div className="pb-1 text-[9px] font-medium uppercase text-muted-foreground">{sub}</div> : null}
      </div>
    </div>
  );
}
