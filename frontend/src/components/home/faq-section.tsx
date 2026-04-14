'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { t } from '@/lib/t';
import { useLocaleStore } from '@/stores/locale-store';

const FAQ_KEYS = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6'];

export function FaqSection() {
  const locale = useLocaleStore((s) => s.locale);
  const [open, setOpen] = useState<string | null>(null);

  return (
    <section className="py-20 md:py-28">
      <div className="container">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-3xl font-bold md:text-4xl">{t('faq.title', {}, locale)}</h2>
          <p className="mt-3 text-muted-foreground">{t('faq.subtitle', {}, locale)}</p>
        </div>

        <div className="mx-auto max-w-2xl space-y-3">
          {FAQ_KEYS.map((key) => {
            const isOpen = open === key;
            return (
              <div
                key={key}
                className="rounded-xl border border-border bg-card overflow-hidden"
              >
                <button
                  onClick={() => setOpen(isOpen ? null : key)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left font-medium transition-colors hover:bg-muted/30"
                >
                  <span>{t(`faq.${key}_q`, {}, locale)}</span>
                  <ChevronDown
                    size={16}
                    className={`shrink-0 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <p className="px-5 pb-4 text-sm text-muted-foreground">
                        {t(`faq.${key}_a`, {}, locale)}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
