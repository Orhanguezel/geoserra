'use client';
import { motion } from 'framer-motion';
import { Bot, Gauge, Code2, FileText, ListChecks, Wrench } from 'lucide-react';
import { t } from '@/lib/t';
import { useLocaleStore } from '@/stores/locale-store';

const FEATURES = [
  { icon: Bot, key: 'f1', color: 'text-violet-400' },
  { icon: Gauge, key: 'f2', color: 'text-blue-400' },
  { icon: Code2, key: 'f3', color: 'text-cyan-400' },
  { icon: FileText, key: 'f4', color: 'text-emerald-400' },
  { icon: ListChecks, key: 'f5', color: 'text-amber-400' },
  { icon: Wrench, key: 'f6', color: 'text-rose-400' },
];

export function FeaturesSection() {
  const locale = useLocaleStore((s) => s.locale);

  return (
    <section className="py-20 md:py-28">
      <div className="container">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-3xl font-bold md:text-4xl">{t('features.title', {}, locale)}</h2>
          <p className="mt-3 text-muted-foreground">{t('features.subtitle', {}, locale)}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                className="card-gradient-border rounded-xl p-6"
              >
                <div className={`mb-4 inline-flex rounded-lg bg-muted p-2.5 ${feature.color}`}>
                  <Icon size={20} />
                </div>
                <h3 className="mb-2 font-semibold">{t(`features.${feature.key}_title`, {}, locale)}</h3>
                <p className="text-sm text-muted-foreground">{t(`features.${feature.key}_desc`, {}, locale)}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
