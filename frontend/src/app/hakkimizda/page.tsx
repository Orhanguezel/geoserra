'use client';
import { motion } from 'framer-motion';
import { Bot, Target, Zap } from 'lucide-react';
import { t } from '@/lib/t';
import { useLocaleStore } from '@/stores/locale-store';

export default function HakkimizdaPage() {
  const locale = useLocaleStore((s) => s.locale);

  return (
    <main className="min-h-screen py-20 md:py-28">
      <div className="container max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          <div className="text-center">
            <h1 className="text-3xl font-bold md:text-4xl">{t('about.title', {}, locale)}</h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">{t('about.intro', {}, locale)}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: Bot, key: 'ai', color: 'text-violet-400' },
              { icon: Target, key: 'mission', color: 'text-blue-400' },
              { icon: Zap, key: 'speed', color: 'text-amber-400' },
            ].map(({ icon: Icon, key, color }) => (
              <div key={key} className="rounded-2xl border border-border bg-card p-5 space-y-2">
                <div className={`inline-flex rounded-lg bg-muted p-2.5 ${color}`}><Icon size={20} /></div>
                <h3 className="font-semibold">{t(`about.${key}_title`, {}, locale)}</h3>
                <p className="text-sm text-muted-foreground">{t(`about.${key}_desc`, {}, locale)}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-border bg-card p-8 prose prose-invert prose-sm max-w-none">
            <p>{t('about.body', {}, locale)}</p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
