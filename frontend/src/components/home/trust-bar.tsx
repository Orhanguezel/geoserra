'use client';

import { motion } from 'framer-motion';
import { t } from '@/lib/t';
import { useLocaleStore } from '@/stores/locale-store';

const stats = [
  { num: '2.400+', lbl: 'trust.analyses' },
  { num: '48.000+', lbl: 'trust.issues' },
  { num: '+32%', lbl: 'trust.score' },
  { num: '4.8/5', lbl: 'trust.satisfaction' },
];

export function TrustBar() {
  const locale = useLocaleStore((s) => s.locale);

  return (
    <section className="border-y border-border bg-background py-14">
      <div className="container">
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.lbl}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className="flex items-center gap-8"
            >
              <div className="text-center">
                <div className="text-3xl font-extrabold text-foreground">{stat.num}</div>
                <div className="mt-1 text-sm text-muted-foreground">{t(stat.lbl, {}, locale)}</div>
              </div>
              {index < stats.length - 1 ? <div className="hidden h-12 w-px bg-border sm:block" /> : null}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
