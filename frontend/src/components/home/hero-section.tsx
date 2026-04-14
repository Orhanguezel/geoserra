'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Search, Globe, Zap, Shield, BarChart3, Lock } from 'lucide-react';
import { t } from '@/lib/t';
import { useLocaleStore } from '@/stores/locale-store';

export function HeroSection() {
  const locale = useLocaleStore((s) => s.locale);
  const [url, setUrl] = useState('');

  return (
    <section className="hero-mesh relative min-h-screen flex items-center overflow-hidden pt-20">
      {/* Background elements */}
      <div className="hero-grid" />
      
      {/* Sol Floating Cards */}
      <div className="absolute left-[5%] top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-8 z-20">
        <FloatCard 
          label="GEO SKORU" 
          value="94" 
          icon={<Globe className="text-emerald-500" size={18} />}
          color="emerald" 
          className="animate-float"
        />
        <FloatCard 
          label="AI CITABILITY" 
          value="87" 
          icon={<Zap className="text-cyan-500" size={18} />}
          color="cyan" 
          className="animate-float-delayed"
        />
      </div>

      {/* Sağ Floating Cards */}
      <div className="absolute right-[5%] top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-8 z-20">
        <FloatCard 
          label="LIGHTHOUSE" 
          value="91" 
          icon={<BarChart3 className="text-emerald-500" size={18} />}
          color="emerald" 
          className="animate-float"
        />
        <FloatCard 
          label="SORUN TESPİT" 
          value="23" 
          sub="aksiyona hazır"
          icon={<Shield className="text-amber-500" size={18} />}
          color="amber" 
          className="animate-float-delayed"
        />
      </div>

      <div className="container relative z-10 text-center px-4">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-pulse-ring absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-mono font-medium tracking-wide text-white/80 uppercase">
            {t('hero.badge_text', { defaultValue: 'GEO + SEO + Lighthouse — Tek Platform' }, locale)}
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mx-auto max-w-4xl text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6"
        >
          {t('hero.title_start', { defaultValue: 'Web Sitenizin' }, locale)}{' '}
          <span className="text-gradient">
            {t('hero.title_accent', { defaultValue: 'AI Görünürlüğünü' }, locale)}
          </span>{' '}
          {t('hero.title_end', { defaultValue: 'Keşfedin' }, locale)}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mx-auto max-w-2xl text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed font-sans"
        >
          {t('hero.subtitle', { 
            defaultValue: 'GeoSerra, sitenizin ChatGPT, Gemini ve Perplexity gibi platformlardaki performansını analiz eder. GEO skorunuzu yükseltin ve yapay zeka aramalarında markanızı öne çıkarın.' 
          }, locale)}
        </motion.p>

        {/* URL Input Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mx-auto max-w-[620px] mb-6"
        >
          <div className="group relative rounded-2xl border border-white/10 bg-[#0f1420]/80 p-1.5 backdrop-blur-xl transition-all focus-within:border-emerald-500/50 focus-within:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]">
            <form className="flex flex-col sm:flex-row gap-2" onSubmit={(e) => { e.preventDefault(); /* Handle analysis */ }}>
              <div className="relative flex-1">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Search size={18} />
                </div>
                <input
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder={t('hero.input_placeholder', { defaultValue: 'https://siteniz.com' }, locale)}
                  className="w-full bg-transparent font-mono text-[15px] pl-11 pr-4 py-4 outline-none text-white placeholder-muted-foreground"
                />
              </div>
              <button 
                type="submit"
                className="rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 px-8 py-4 font-bold text-sm text-white hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(16,185,129,0.35)] transition-all flex items-center justify-center gap-2"
              >
                {t('hero.cta_analyze', { defaultValue: 'Analiz Et' }, locale)} <ArrowRight size={16} />
              </button>
            </form>
          </div>
        </motion.div>

        {/* Hero Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-xs text-muted-foreground mb-12 flex items-center justify-center gap-4"
        >
          <span className="flex items-center gap-1.5 font-mono"><Zap size={12} className="text-emerald-500" /> Ücretsiz</span>
          <span className="text-white/10">|</span>
          <span className="font-mono">1 analiz/domain</span>
          <span className="text-white/10">|</span>
          <span className="flex items-center gap-1.5 font-mono"><Lock size={12} className="text-emerald-500/60" /> Kredi kartı gerekmez</span>
        </motion.p>

        {/* Platform Tags */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 pt-8 border-t border-white/5"
        >
          {['ChatGPT', 'Gemini', 'Perplexity', 'Google AI', 'Bing'].map((p) => (
            <span key={p} className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2 hover:text-white/80 transition-colors">
              <span className="h-1 w-1 rounded-full bg-emerald-500/40" /> {p}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function FloatCard({ label, value, sub, icon, color, className }: any) {
  const glowClass = color === 'emerald' ? 'glow-emerald' : color === 'cyan' ? 'glow-cyan' : 'glow-amber';
  
  return (
    <div className={`float-card min-w-[210px] flex items-center gap-4 ${glowClass} ${className}`}>
      <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
        {icon}
      </div>
      <div className="flex-1">
        <div className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider mb-0.5">{label}</div>
        <div className="flex items-baseline gap-1.5">
          <div className="text-2xl font-bold text-white tracking-tight">{value}</div>
          {sub && <div className="text-[9px] text-muted-foreground font-medium uppercase">{sub}</div>}
        </div>
      </div>
    </div>
  );
}
