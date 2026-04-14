'use client';

import { motion } from 'framer-motion';
import { Quote, ArrowRight } from 'lucide-react';
import { t } from '@/lib/t';
import { useLocaleStore } from '@/stores/locale-store';

const TESTIMONIALS = [
  {
    name: 'Ayşe K.',
    company: 'E-ticaret Girişimcisi',
    text: "GeoSerra sayesinde Perplexity'de ilk sayfada görünmeye başladım. Organik trafiğim 3 ayda %40 arttı.",
    before: 34,
    after: 81,
  },
  {
    name: 'Mehmet D.',
    company: 'Digital Ajans Kurucusu',
    text: 'Müşterilerime sunduğum en değerli araç. Schema ve AI visibility raporları gerçekten işe yarıyor.',
    before: 48,
    after: 76,
  },
  {
    name: 'Selin Ö.',
    company: 'SaaS Kurucu',
    text: 'Expert raporu aldık, implementation ile birlikte ChatGPT aramalarında marka adımız çıkmaya başladı.',
    before: 29,
    after: 88,
  },
];

export function TestimonialsSection() {
  const locale = useLocaleStore((s) => s.locale);

  return (
    <section className="py-24 md:py-32 relative overflow-hidden bg-[#06090f]">
      <div className="container px-4">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <div className="section-eyebrow mb-4">Başarı Hikayeleri</div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
            Kullanıcılarımız <span className="text-gradient">Ne Diyor?</span>
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {TESTIMONIALS.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="relative flex flex-col rounded-3xl border border-white/5 bg-[#0f1420] p-8 hover:border-emerald-500/30 transition-all group"
            >
              <Quote className="text-emerald-500/20 mb-6 group-hover:text-emerald-500/40 transition-colors" size={40} />
              
              <p className="text-white/80 text-lg leading-relaxed mb-8 flex-1 italic">
                "{item.text}"
              </p>

              {/* Score comparison */}
              <div className="mb-8 flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase opacity-60">Önce</span>
                  <span className="text-xl font-bold text-red-400">{item.before}</span>
                </div>
                <ArrowRight size={16} className="text-white/20" />
                <div className="flex flex-col text-right">
                  <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase opacity-60">Sonra</span>
                  <span className="text-xl font-bold text-emerald-400">{item.after}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 border-t border-white/5 pt-6">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-xl font-bold text-white/50">
                  {item.name[0]}
                </div>
                <div>
                  <div className="font-bold text-white">{item.name}</div>
                  <div className="text-xs text-muted-foreground font-mono">{item.company}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
