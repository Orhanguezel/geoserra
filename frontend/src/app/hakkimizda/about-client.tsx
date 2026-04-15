'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Bot, Target, Zap, Sparkles, Github, Linkedin, Code2, ShieldCheck, BarChart3, Globe, Users, Lightbulb } from 'lucide-react';
import { t } from '@/lib/t';
import { useLocaleStore } from '@/stores/locale-store';

const TECH_STACK = [
  'Next.js 16', 'React 19', 'TypeScript', 'Tailwind CSS',
  'Fastify 5', 'Bun Runtime', 'MySQL 8', 'Drizzle ORM',
  'Python 3', 'Groq LLM', 'Stripe', 'PayPal',
];

const VALUE_ICONS = [ShieldCheck, BarChart3, Users, Lightbulb];
const VALUE_COLORS = ['text-emerald-400', 'text-cyan-400', 'text-amber-400', 'text-violet-400'];
const VALUE_KEYS = ['v1', 'v2', 'v3', 'v4'] as const;

const MEASURE_KEYS = ['m1', 'm2', 'm3', 'm4', 'm5', 'm6'] as const;
const MEASURE_WEIGHTS = ['25%', '20%', '20%', '15%', '10%', '10%'];

export function AboutClient() {
  const locale = useLocaleStore((s) => s.locale);

  return (
    <main className="min-h-screen py-20 md:py-28">
      <div className="container max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-16"
        >
          {/* Hero */}
          <div className="text-center">
            <h1 className="text-3xl font-bold md:text-4xl">{t('about.title', {}, locale)}</h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">{t('about.intro', {}, locale)}</p>
          </div>

          {/* Üç Sütun */}
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: Bot, key: 'ai', color: 'text-cyan-400' },
              { icon: Target, key: 'mission', color: 'text-emerald-400' },
              { icon: Zap, key: 'speed', color: 'text-amber-400' },
            ].map(({ icon: Icon, key, color }) => (
              <div key={key} className="rounded-2xl border border-border bg-card p-5 space-y-2">
                <div className={`inline-flex rounded-lg bg-muted p-2.5 ${color}`}><Icon size={20} /></div>
                <h3 className="font-semibold">{t(`about.${key}_title`, {}, locale)}</h3>
                <p className="text-sm text-muted-foreground">{t(`about.${key}_desc`, {}, locale)}</p>
              </div>
            ))}
          </div>

          {/* Platform Hikayesi */}
          <div className="rounded-2xl border border-border bg-card p-8">
            <h2 className="mb-4 text-xl font-semibold">{t('about.story_title', {}, locale)}</h2>
            <div className="space-y-4 text-muted-foreground leading-8">
              <p>{t('about.body', {}, locale)}</p>
              <p>{t('about.story2', {}, locale)}</p>
              <p>{t('about.story3', {}, locale)}</p>
              <p>{t('about.vision_desc', {}, locale)}</p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-300">
              {TECH_STACK.map((item) => (
                <span key={item} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 font-mono text-xs">
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Teknoloji Yaklaşımı */}
          <div className="rounded-2xl border border-border bg-card p-8">
            <div className="mb-4 inline-flex rounded-lg bg-muted p-2.5 text-cyan-400">
              <Code2 size={20} />
            </div>
            <h2 className="mb-4 text-xl font-semibold">{t('about.tech_title', {}, locale)}</h2>
            <div className="space-y-4 text-muted-foreground leading-8">
              <p>{t('about.tech1', {}, locale)}</p>
              <p>{t('about.tech2', {}, locale)}</p>
              <p>{t('about.tech3', {}, locale)}</p>
            </div>
          </div>

          {/* Kurucu + Değerler */}
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            {/* Kurucu Profili */}
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8">
              <div className="mb-5 inline-flex rounded-full bg-emerald-500/10 p-3">
                <Sparkles size={20} className="text-emerald-400" />
              </div>
              <h2 className="text-xl font-semibold">{t('about.founder_title', {}, locale)}</h2>

              <div className="mt-5 flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xl font-bold text-emerald-400">
                  OG
                </div>
                <div>
                  <p className="font-semibold text-foreground">Orhan Güzel</p>
                  <p className="text-sm text-muted-foreground">{t('about.founder_role', {}, locale)}</p>
                  <div className="mt-2 flex gap-3">
                    <a
                      href="https://github.com/Orhanguezel"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Orhan Güzel GitHub"
                      className="text-muted-foreground transition hover:text-foreground"
                    >
                      <Github size={16} />
                    </a>
                    <a
                      href="https://www.linkedin.com/in/orhanguezel"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Orhan Güzel LinkedIn"
                      className="text-muted-foreground transition hover:text-foreground"
                    >
                      <Linkedin size={16} />
                    </a>
                    <a
                      href="https://geoserra.com"
                      aria-label="GeoSerra"
                      className="text-muted-foreground transition hover:text-foreground"
                    >
                      <Globe size={16} />
                    </a>
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-3 text-sm leading-7 text-muted-foreground">
                <p>{t('about.founder_bio1', {}, locale)}</p>
                <p>{t('about.founder_bio2', {}, locale)}</p>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {['Next.js', 'Fastify', 'GEO/SEO', 'LLM Integration', 'DevOps'].map((skill) => (
                  <span key={skill} className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
                    {skill}
                  </span>
                ))}
              </div>

              <Link
                href="/iletisim"
                className="mt-6 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
              >
                {t('about.cta', {}, locale)}
              </Link>
            </div>

            {/* Değerler */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">{t('about.values_title', {}, locale)}</h2>
              {VALUE_KEYS.map((key, i) => {
                const Icon = VALUE_ICONS[i];
                return (
                  <div key={key} className="rounded-2xl border border-border bg-card p-5">
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 shrink-0 ${VALUE_COLORS[i]}`}>
                        <Icon size={18} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">{t(`about.${key}_title`, {}, locale)}</h3>
                        <p className="mt-1 text-xs leading-6 text-muted-foreground">{t(`about.${key}_desc`, {}, locale)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* GEO Skor Tablosu - Platform İddiası */}
          <div className="rounded-2xl border border-border bg-card p-8">
            <h2 className="mb-4 text-xl font-semibold">{t('about.measures_title', {}, locale)}</h2>
            <p className="mb-6 text-muted-foreground leading-7">{t('about.measures_desc', {}, locale)}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {MEASURE_KEYS.map((key, i) => (
                <div key={key} className="flex items-start gap-3 rounded-xl border border-border bg-muted/30 p-4">
                  <span className="shrink-0 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-400 font-mono">
                    {MEASURE_WEIGHTS[i]}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{t(`about.${key}_label`, {}, locale)}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{t(`about.${key}_desc`, {}, locale)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8 text-center">
            <h2 className="text-xl font-semibold">{t('about.cta_title', {}, locale)}</h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">{t('about.cta_desc', {}, locale)}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <Link
                href="/analyze"
                className="rounded-xl bg-emerald-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-800"
              >
                {t('about.cta_analyze', {}, locale)}
              </Link>
              <Link
                href="/iletisim"
                className="rounded-xl border border-border px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
              >
                {t('about.cta_contact', {}, locale)}
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
