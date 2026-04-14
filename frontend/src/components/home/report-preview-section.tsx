'use client';

import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Lock } from 'lucide-react';
import { t } from '@/lib/t';
import { useLocaleStore } from '@/stores/locale-store';

function ScoreRing({ score, label, color }: { score: number; label: string; color: string }) {
  const r = 36;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-20 w-20">
        <svg className="h-full w-full" viewBox="0 0 88 88">
          <circle cx="44" cy="44" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
          <circle 
            cx="44" cy="44" r={r} fill="none" stroke={color} strokeWidth="6" 
            strokeDasharray={c} strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-white tracking-tighter">{score}</span>
        </div>
      </div>
      <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider">{label}</span>
    </div>
  );
}

const CATEGORIES = [
  { name: 'AI Citability', score: 72, state: 'good' },
  { name: 'Schema Markup', score: 45, state: 'error' },
  { name: 'Teknik SEO', score: 88, state: 'good' },
  { name: 'Core Web Vitals', score: 91, state: 'good' },
];

export function ReportPreviewSection() {
  const locale = useLocaleStore((s) => s.locale);

  return (
    <section className="py-24 md:py-32 relative overflow-hidden bg-[#06090f]">
      <div className="container px-4">
        <div className="grid gap-16 lg:grid-cols-2 items-center">
          
          {/* Left Side: Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="section-eyebrow mb-6">Örnek Rapor</div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
              Sitenizin Tam Resmini <span className="text-gradient">360 Derece</span> Görün
            </h2>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              GeoSerra raporu 8 kategoride detaylı analiz sunar. Sadece teknik hataları değil, 
              yapay zeka platformlarının sitenizi nasıl "okuduğunu" ve "alıntıladığını" da keşfedersiniz.
            </p>
            
            <ul className="mb-10 space-y-4">
              {['AI Görünürlük Skoru', 'Schema & Metadata Analizi', 'Lighthouse Performans Testi', 'E-E-A-T Değerlendirmesi'].map((item) => (
                <li key={item} className="flex items-center gap-3 text-white/80">
                  <CheckCircle2 size={18} className="text-emerald-500" />
                  <span className="font-medium">{item}</span>
                </li>
              ))}
            </ul>

            <button className="rounded-xl bg-emerald-500 px-8 py-4 font-bold text-white hover:bg-emerald-600 transition-all flex items-center gap-2">
              Ücretsiz Analizimi Başlat <ArrowRight size={18} />
            </button>
          </motion.div>

          {/* Right Side: Mockup Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="group relative"
          >
            {/* Background Glow */}
            <div className="absolute -inset-4 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-[2.5rem] blur-2xl opacity-50 group-hover:opacity-75 transition-opacity" />
            
            <div className="relative bg-[#0f1420] border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl">
              <div className="flex items-center justify-between mb-10 pb-6 border-b border-white/5">
                <div className="font-mono text-xs text-muted-foreground tracking-widest">
                  GEOSERRA RAPORU — <span className="text-white">example.com</span>
                </div>
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>

              {/* Score Rings */}
              <div className="grid grid-cols-3 gap-8 mb-12">
                <ScoreRing score={78} label="GEO" color="#10b981" />
                <ScoreRing score={85} label="SEO" color="#0ea5e9" />
                <ScoreRing score={91} label="LH"  color="#f59e0b" />
              </div>

              {/* Categories */}
              <div className="space-y-4 mb-4">
                {CATEGORIES.map((cat) => (
                  <div key={cat.name} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className={`h-2 w-2 rounded-full ${cat.state === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`} />
                      <span className="text-sm font-medium text-white/90">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="h-1.5 w-32 bg-white/5 rounded-full overflow-hidden hidden sm:block">
                        <motion.div 
                          initial={{ width: 0 }}
                          whileInView={{ width: `${cat.score}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className={`h-full ${cat.state === 'error' ? 'bg-red-500/50' : 'bg-emerald-500/50'}`}
                        />
                      </div>
                      <span className={`text-sm font-mono font-bold ${cat.state === 'error' ? 'text-red-400' : 'text-emerald-400'}`}>
                        {cat.score}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Locked footer */}
              <div className="relative mt-6 pt-6 border-t border-white/5 flex flex-col items-center">
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f1420] via-[#0f1420]/80 to-transparent bottom-0" />
                <div className="relative z-10 flex flex-col items-center gap-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                    <Lock size={12} /> +4 kategori daha kilitli
                  </div>
                  <button className="text-emerald-400 text-sm font-bold hover:underline">
                    Rapor Satın Al
                  </button>
                </div>
              </div>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
