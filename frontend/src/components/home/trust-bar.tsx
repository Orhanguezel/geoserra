'use client';

import { motion } from 'framer-motion';
import { t } from '@/lib/t';
import { useLocaleStore } from '@/stores/locale-store';

const STATS = [
  { num: '2.400+', lbl: 'Analiz Tamamlandı' },
  { num: '48.000+', lbl: 'Sorun Tespit Edildi' },
  { num: '+32%', lbl: 'Ortalama Skor Artışı' },
  { num: '4.8/5', lbl: 'Müşteri Memnuniyeti' },
];

export function TrustBar() {
  const locale = useLocaleStore((s) => s.locale);

  return (
    <div className="border-t border-b border-white/5 bg-[#06090f] py-16">
      <div className="container px-4">
        <div className="flex flex-wrap justify-between items-center gap-y-12">
          {STATS.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="flex flex-col items-center text-center flex-1 min-w-[200px] relative"
            >
              <div className="text-3xl md:text-4xl font-extrabold text-white mb-2 font-sans tracking-tight">
                {stat.num}
              </div>
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-mono font-medium">
                {t(`trust_bar.stat_${idx}`, { defaultValue: stat.lbl }, locale)}
              </div>
              
              {/* Divider for desktop */}
              {idx < STATS.length - 1 && (
                <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 h-12 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
