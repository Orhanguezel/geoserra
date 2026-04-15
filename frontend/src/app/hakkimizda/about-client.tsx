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

const VALUES = [
  {
    icon: ShieldCheck,
    title: 'Şeffaflık',
    desc: 'Her metrik nasıl hesaplandığını açıklıyoruz. Kara kutu skor yok — her puan arkasında somut bir kontrol var.',
    color: 'text-emerald-400',
  },
  {
    icon: BarChart3,
    title: 'Veri Odaklılık',
    desc: 'Tavsiyelerimiz gerçek crawler verisi, Lighthouse metrikleri ve schema doğrulama sonuçlarına dayanır. Tahmin değil, ölçüm.',
    color: 'text-cyan-400',
  },
  {
    icon: Users,
    title: 'Erişilebilirlik',
    desc: 'Büyük ajansların kullandığı AI görünürlük araçlarını KOBİ\'ler ve freelancer\'lar için de erişilebilir kılmak temel hedefimiz.',
    color: 'text-amber-400',
  },
  {
    icon: Lightbulb,
    title: 'Uygulanabilir Aksiyon',
    desc: 'Raporlarımız salt veri değil, öncelik sırasına göre düzenlenmiş, elle tutulur adımlar sunar. Okuyup bırakılmayan raporlar.',
    color: 'text-violet-400',
  },
];

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
              <p>
                2025 yılı itibarıyla Google aramaların yaklaşık %30&apos;u artık AI Overviews ile başlıyor.
                ChatGPT, Perplexity ve Bing Copilot ise milyonlarca kullanıcıya web sayfalarından derlenen
                yanıtlar sunuyor. Bu tabloda bir web sitesinin &quot;sıralamada olması&quot; yetmiyor —
                AI sistemlerinin o içeriği <em>alıntılayabilmesi</em> gerekiyor.
              </p>
              <p>
                GeoSerra tam bu noktada devreye giriyor: Sitenizin teknik sağlığını (Lighthouse, Core Web Vitals),
                yapısal veri kalitesini (JSON-LD schema), brand authority sinyallerini (sameAs, sosyal varlık)
                ve AI citability skorunu tek bir raporda birleştiriyoruz. Her kategori için somut, önceliklendirilmiş
                aksiyon maddeleri sunuyoruz.
              </p>
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
            <h2 className="mb-4 text-xl font-semibold">Teknoloji Yaklaşımımız</h2>
            <div className="space-y-4 text-muted-foreground leading-8">
              <p>
                GeoSerra&apos;nın analiz motoru Python tabanlı scriptler üzerine kuruludur. Her analiz
                kategorisi bağımsız bir modüldür: <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono text-foreground">lighthouse_checker.py</code>,{' '}
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono text-foreground">dns_checker.py</code>,{' '}
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono text-foreground">brand_scanner.py</code>,{' '}
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono text-foreground">citability_scorer.py</code>.
                Bu modüler yapı, her kategoriyi bağımsız olarak geliştirmemizi ve test etmemizi sağlar.
              </p>
              <p>
                Backend tarafında <strong>Fastify 5</strong> ve <strong>Bun runtime</strong> kullanıyoruz.
                Bun&apos;ın hızlı başlatma süresi ve Fastify&apos;ın düşük overhead&apos;i sayesinde API
                yanıt süreleri 50ms altında kalıyor. Veritabanı katmanında <strong>MySQL 8</strong> ve
                type-safe sorgular için <strong>Drizzle ORM</strong> tercih ettik.
              </p>
              <p>
                Ücretli analizlerde <strong>Groq</strong> üzerinden çalışan Llama 4 modeli devreye giriyor.
                Bu model, ham metriklerden insan tarafından okunabilir, bağlamsal öneriler üretiyor.
                Ücretsiz analizlerde AI katmanı devre dışı — böylece API maliyetleri kullanıcıya yansımıyor.
              </p>
            </div>
          </div>

          {/* Kurucu + Değerler */}
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            {/* Kurucu Profili */}
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8">
              <div className="mb-5 inline-flex rounded-full bg-emerald-500/10 p-3">
                <Sparkles size={20} className="text-emerald-400" />
              </div>
              <h2 className="text-xl font-semibold">Kurucu</h2>

              <div className="mt-5 flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xl font-bold text-emerald-400">
                  OG
                </div>
                <div>
                  <p className="font-semibold text-foreground">Orhan Güzel</p>
                  <p className="text-sm text-muted-foreground">Kurucu &amp; Baş Geliştirici</p>
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
                <p>
                  Full-stack geliştirici. Next.js, Fastify ve yapay zeka entegrasyonu konularında
                  beş yılı aşkın deneyimi olan Orhan, web performansı ve arama görünürlüğü alanında
                  20+ projeyi canlıya almıştır.
                </p>
                <p>
                  GeoSerra&apos;yı, kendi müşterilerinin &quot;neden ChatGPT bizi görmüyor?&quot; sorusuna
                  yanıt ararken geliştirdi. Mevcut araçların AI citability kavramını yeterince ele
                  almadığını fark edince platformu sıfırdan inşa etmeye karar verdi.
                </p>
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
              <h2 className="text-xl font-semibold">Değerlerimiz</h2>
              {VALUES.map(({ icon: Icon, title, desc, color }) => (
                <div key={title} className="rounded-2xl border border-border bg-card p-5">
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 shrink-0 ${color}`}>
                      <Icon size={18} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{title}</h3>
                      <p className="mt-1 text-xs leading-6 text-muted-foreground">{desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* GEO Skor Tablosu - Platform İddiası */}
          <div className="rounded-2xl border border-border bg-card p-8">
            <h2 className="mb-4 text-xl font-semibold">GeoSerra Ne Ölçer?</h2>
            <p className="mb-6 text-muted-foreground leading-7">
              Analizimiz altı ana kategori üzerine kurulu. Her kategori bağımsız olarak skorlanır ve
              ağırlıklı toplamıyla genel GEO skorunuzu oluşturur.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { label: 'AI Citability & Visibility', weight: '%25', desc: 'ChatGPT, Gemini, Perplexity, Bing Copilot alıntılanabilirliği' },
                { label: 'Brand Authority Signals', weight: '%20', desc: 'sameAs, sosyal varlık, Wikipedia, backlink profili' },
                { label: 'Content Quality & E-E-A-T', weight: '%20', desc: 'İçerik derinliği, yazar uzmanlığı, güvenilirlik sinyalleri' },
                { label: 'Technical Foundations', weight: '%15', desc: 'TTFB, Core Web Vitals (LCP/CLS/INP), SSR kalitesi' },
                { label: 'Structured Data', weight: '%10', desc: 'JSON-LD schema doğruluğu, FAQPage, Product, Organization' },
                { label: 'Platform Optimization', weight: '%10', desc: 'robots.txt, llms.txt, sitemap, canonical, hreflang' },
              ].map(({ label, weight, desc }) => (
                <div key={label} className="flex items-start gap-3 rounded-xl border border-border bg-muted/30 p-4">
                  <span className="shrink-0 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-400 font-mono">
                    {weight}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{label}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8 text-center">
            <h2 className="text-xl font-semibold">Sitenizin GEO Skorunu Öğrenin</h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Her domain için 1 ücretsiz analiz. Kredi kartı gerekmez. 2 dakikada sonuç.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <Link
                href="/analyze"
                className="rounded-xl bg-emerald-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-800"
              >
                Ücretsiz Analiz Yap
              </Link>
              <Link
                href="/iletisim"
                className="rounded-xl border border-border px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
              >
                İletişime Geç
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
