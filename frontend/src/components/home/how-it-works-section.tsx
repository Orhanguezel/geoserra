'use client';
import { motion } from 'framer-motion';
import { LinkIcon, ScanLine, Download } from 'lucide-react';
import { t } from '@/lib/t';
import { useLocaleStore } from '@/stores/locale-store';

const STEPS = [
  { icon: LinkIcon, num: '01', title: 'step1_title', desc: 'step1_desc' },
  { icon: ScanLine, num: '02', title: 'step2_title', desc: 'step2_desc' },
  { icon: Download, num: '03', title: 'step3_title', desc: 'step3_desc' },
];

export function HowItWorksSection() {
  const locale = useLocaleStore((s) => s.locale);

  return (
    <section className="border-y border-border bg-card/30 py-20 md:py-28">
      <div className="container">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-3xl font-bold md:text-4xl">{t('how_it_works.title', {}, locale)}</h2>
        </div>

        <div className="relative grid gap-8 md:grid-cols-3">
          {/* Connector line (desktop) */}
          <div className="absolute left-0 right-0 top-8 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent md:block" />

          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="relative flex flex-col items-center text-center"
              >
                <div className="relative z-10 mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-background shadow-lg">
                  <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {step.num}
                  </span>
                  <Icon size={24} className="text-primary" />
                </div>
                <h3 className="mb-2 font-semibold">{t(`how_it_works.${step.title}`, {}, locale)}</h3>
                <p className="text-sm text-muted-foreground">{t(`how_it_works.${step.desc}`, {}, locale)}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
