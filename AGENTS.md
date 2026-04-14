# GeoSerra — AGENTS.md (Codex İçin)

> Bu dosya Codex tarafından okunur. Görev atamaları ve kurallar burada.

## Proje Özeti

GeoSerra bir GEO + SEO analiz SaaS platformu.
- **Frontend:** Next.js 16, Tailwind v3, Framer Motion — port 3071
- **Backend:** Fastify 5, Drizzle ORM, MySQL — port 8095
- **Admin:** Next.js 16 — port 3072
- **Referans tasarım:** `geoserra-landing.html` (projenin kökünde)

---

## Codex Kuralları

1. Değişiklikler yalnızca `geoserra/frontend/` veya `geoserra/admin/` altında
2. TypeScript strict — hatasız olmalı
3. `bun run dev` bozulmamalı
4. **ALTER TABLE yasak** — DB şeması değiştirilmez
5. Framer Motion ile animasyon yaz, raw CSS keyframe kullanma (globals.css'deki temel utility'ler dışında)
6. i18n: `import { t } from '@/lib/t'` + `useLocaleStore((s) => s.locale)`
7. Shadcn/Radix bileşenlerini tercih et
8. Her `'use client'` bileşeninde hook kullanımı doğru olmalı

---

## Renk Paleti (Emerald/Cyan — Landing HTML'den)

```
Primary (Emerald):  #10b981  → --accent-1
Secondary (Cyan):   #0ea5e9  → --accent-3
Accent-2 (Teal):    #06d6a0  → --accent-2
Accent-4 (Indigo):  #818cf8  → --accent-4
Warn (Amber):       #f59e0b  → --accent-warn

Background:         #06090f  → --bg-primary
Card:               #0f1420  → --bg-card
Card hover:         #141a28  → --bg-card-hover
Elevated:           #181f30  → --bg-elevated

Text primary:       #f0f2f5
Text secondary:     #8892a4
Text muted:         #4a5568
Text accent:        #34d399
```

---

## COD-1 — Design System Migration [ÖNCE YAP]

**Dosyalar:**
- `frontend/src/app/globals.css`
- `frontend/src/app/layout.tsx`
- `frontend/tailwind.config.ts`

### globals.css değişiklikleri

```css
/* Mevcut violet/blue palatini BU ile değiştir */
:root {
  --background:     220 47% 4%;    /* #06090f */
  --foreground:     220 15% 95%;   /* #f0f2f5 */
  --card:           222 40% 8%;    /* #0f1420 */
  --card-foreground: 220 15% 95%;
  --primary:        160 84% 39%;   /* #10b981 emerald */
  --primary-foreground: 0 0% 100%;
  --secondary:      199 89% 48%;   /* #0ea5e9 cyan */
  --secondary-foreground: 0 0% 100%;
  --muted:          222 38% 11%;   /* #141a28 */
  --muted-foreground: 220 12% 55%; /* #8892a4 */
  --accent:         199 89% 48%;
  --accent-foreground: 0 0% 100%;
  --border:         222 38% 11%;
  --input:          222 38% 11%;
  --ring:           160 84% 39%;   /* emerald ring */
  --radius:         0.5rem;
  --destructive:    0 72% 51%;
  --destructive-foreground: 0 0% 100%;
  --font-mono-var: var(--font-jetbrains);
}
```

**Eklenecek utility CSS:**

```css
/* Grain overlay */
body::after {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9999;
  opacity: 0.025;
  background-image: url("data:image/svg+xml,..."); /* SVG noise */
}

/* Hero grid */
.hero-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(16,185,129,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(16,185,129,0.03) 1px, transparent 1px);
  background-size: 60px 60px;
  mask-image: radial-gradient(ellipse 60% 50% at 50% 50%, black, transparent);
}

/* Float animation */
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12px); }
}
.animate-float { animation: float 6s ease-in-out infinite; }
.animate-float-delayed { animation: float 6s ease-in-out -2s infinite; }

/* Pulse ring */
@keyframes pulse-ring {
  0% { transform: scale(1); opacity: 0.4; }
  100% { transform: scale(1.8); opacity: 0; }
}

/* Gradient text — emerald/cyan */
.text-gradient {
  background: linear-gradient(135deg, #10b981, #0ea5e9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Hero background */
.hero-mesh {
  background:
    radial-gradient(ellipse 600px 600px at -10% -10%, rgba(16,185,129,0.15), transparent),
    radial-gradient(ellipse 500px 500px at 105% 85%, rgba(14,165,233,0.12), transparent),
    radial-gradient(ellipse 300px 300px at 80% 30%, rgba(129,140,248,0.06), transparent),
    #06090f;
}
```

### layout.tsx font değişikliği

```tsx
import { Outfit, JetBrains_Mono } from 'next/font/google';

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  variable: '--font-jetbrains',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

// body className:
// className={`${outfit.variable} ${jetbrains.variable} font-sans antialiased`}
```

### tailwind.config.ts eklentileri

```ts
extend: {
  colors: {
    emerald: colors.emerald,    // import colors from 'tailwindcss/colors'
    cyan: colors.cyan,
  },
  fontFamily: {
    sans: ['var(--font-outfit)', 'system-ui', 'sans-serif'],
    mono: ['var(--font-jetbrains)', 'monospace'],
  },
  animation: {
    float: 'float 6s ease-in-out infinite',
    'float-delayed': 'float 6s ease-in-out -2s infinite',
    'pulse-ring': 'pulse-ring 2s infinite',
  },
}
```

---

## COD-2 — Hero Section Tam Yeniden Yazım

**Dosya:** `frontend/src/components/home/hero-section.tsx`

### Yapı

```
<section className="hero-mesh relative min-h-screen flex items-center overflow-hidden">
  <div className="hero-grid" />                    ← arka plan grid

  {/* Sol floating cards */}
  <FloatCards side="left" />

  {/* Merkez içerik */}
  <div className="container relative z-10 text-center">
    <Badge />          ← "● GEO + SEO + Lighthouse — Tek Platform"
    <Heading />        ← h1, clamp(42px → 72px), font-weight: 800
    <Subtitle />       ← max-w-[560px] metin
    <UrlInputBox />    ← monospace input + "Analiz Et" btn inline
    <HeroNote />       ← "Ücretsiz · 1 analiz/domain · Kredi kartı gerekmez"
    <PlatformTags />   ← ChatGPT ● Gemini ● Perplexity ● Google AI ● Bing
  </div>

  {/* Sağ floating cards */}
  <FloatCards side="right" />
</section>
```

### FloatCards — Sol (sol: 5%, top: 50% transform -50%)

```tsx
// Sol kart 1: GEO Skoru
{ label: 'GEO SKORU', value: '94', color: 'green' }  // animate-float

// Sol kart 2: AI Citability
{ label: 'AI CITABILITY', value: '87', color: 'blue', delay: '-2s' }
```

### FloatCards — Sağ (sağ: 5%, top: 50% transform -50%)

```tsx
// Sağ kart 1: Lighthouse
{ label: 'LIGHTHOUSE', value: '91', color: 'green' }

// Sağ kart 2: Sorun sayısı
{ label: 'SORUN TESPİT', value: '23', sub: 'aksiyona hazır', color: 'amber' }
```

### URL Input Box

```tsx
<div className="mx-auto max-w-[580px] rounded-2xl border border-white/10 bg-[#0f1420] p-1.5
                focus-within:border-emerald-500 focus-within:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]">
  <div className="flex">
    <input
      type="url"
      placeholder="https://siteniz.com"
      className="flex-1 bg-transparent font-mono text-[15px] px-4 py-3.5 outline-none
                 text-white placeholder-[#4a5568]"
    />
    <button className="rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600
                       px-7 py-3.5 font-semibold text-sm text-white hover:-translate-y-px
                       hover:shadow-[0_6px_24px_rgba(16,185,129,0.35)] transition-all">
      Analiz Et →
    </button>
  </div>
</div>
```

### Platform Tags

```tsx
const platforms = ['ChatGPT', 'Gemini', 'Perplexity', 'Google AI', 'Bing'];
// Her biri: <span>● {name}</span> — font-mono text-xs text-muted
```

---

## COD-3 — Trust Bar [YENİ BİLEŞEN]

**Dosya:** `frontend/src/components/home/trust-bar.tsx`  
**Konum:** `page.tsx`'de `<HeroSection />` ile `<HowItWorksSection />` arasına ekle

```tsx
const stats = [
  { num: '2.400+', lbl: 'Analiz Tamamlandı' },
  { num: '48.000+', lbl: 'Sorun Tespit Edildi' },
  { num: '+32%', lbl: 'Ortalama Skor Artışı' },
  { num: '4.8/5', lbl: 'Müşteri Memnuniyeti' },
];
// border-t border-b border-white/6 py-14
// flex gap-12 justify-center items-center flex-wrap
// Aralarına 1px dikey çizgi ekle (hidden sm:block)
```

---

## COD-4 — Report Preview Section [YENİ BİLEŞEN]

**Dosya:** `frontend/src/components/home/report-preview-section.tsx`  
**Konum:** PricingSection'dan önce

### Sol taraf (metin)
```
Eyebrow: "ÖRNEK RAPOR" (mono, emerald, uppercase letter-spacing)
H2: "Sitenizin Tam Resmini Görün"
P: "GeoSerra raporu 8 kategoride detaylı analiz sunar..."
CTA: "Ücretsiz Analizimi Başlat →" (emerald btn)
```

### Sağ taraf (mockup kart)

```tsx
// Kart: bg-[#0f1420] border border-white/8 rounded-2xl p-6
// Üst: "GeoSerra Raporu — example.com"

// Score circles (SVG ring):
<ScoreRing score={78} label="GEO" color="#10b981" />
<ScoreRing score={85} label="SEO" color="#0ea5e9" />
<ScoreRing score={91} label="LH"  color="#f59e0b" />

// Kategori listesi (kısmi):
[
  { name: 'AI Citability', score: 72, color: 'emerald' },
  { name: 'Schema Markup', score: 45, color: 'red' },  // kötü → kırmızı
  { name: 'Teknik SEO', score: 88, color: 'emerald' },
  { name: 'Core Web Vitals', score: 91, color: 'emerald' },
]
// Alt: "🔒 +4 kategori daha — Rapor satın al"
```

---

## COD-5 — Testimonials Section [YENİ BİLEŞEN]

**Dosya:** `frontend/src/components/home/testimonials-section.tsx`

```tsx
const testimonials = [
  {
    name: 'Ayşe K.',
    company: 'E-ticaret Girişimcisi',
    text: 'GeoSerra sayesinde Perplexity\'de ilk sayfada görünmeye başladım. Organik trafiğim 3 ayda %40 arttı.',
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
// Her kart: Skor before → after oklu gösterim
// Framer Motion: whileInView, once:true
```

---

## COD-6 — Pricing Section Güncelleme

**Dosya:** `frontend/src/components/home/pricing-section.tsx`

### Tab switcher ekle

```tsx
const [tab, setTab] = useState<'once' | 'monthly'>('once');
// "Tek Seferlik" | "Aylık Abonelik" tab butonları
// bg-[#0f1420] border rounded-lg p-1 — tab:active → bg-[#181f30]
```

### Tek Seferlik paketler (tab='once')
- Starter $29 → `/checkout/starter`
- Pro $59 → `/checkout/pro` — **featured**
- Expert $99 → `/checkout/expert`

### Aylık paketler (tab='monthly')
- Monitor $39/ay → `/checkout/monitor`
- Growth $79/ay → `/checkout/growth` — **featured**
- Agency $149/ay → `/checkout/agency`

### Featured kart tasarımı
```tsx
// border-emerald-500 — üstte "EN POPÜLER" band
// background: linear-gradient(180deg, rgba(16,185,129,0.06), #0f1420)
// ::before absolute top-[-12px] rounded-full bg-emerald-500 text-xs
```

---

## COD-7 — Mobile Menu

**Dosya:** `frontend/src/components/layout/header.tsx`

```tsx
const [menuOpen, setMenuOpen] = useState(false);

// Hamburger (lg:hidden):
<button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden">
  {menuOpen ? <X size={24} /> : <Menu size={24} />}
</button>

// Mobile panel:
<AnimatePresence>
  {menuOpen && (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="absolute top-full left-0 right-0 bg-[#06090f]/95 backdrop-blur-xl
                 border-b border-white/6 py-6 px-6 flex flex-col gap-4 lg:hidden"
    >
      {navLinks.map(...)}
      <Link href="/analyze">Ücretsiz Analiz</Link>
    </motion.div>
  )}
</AnimatePresence>
```

---

## COD-8 — Analyze Sonuç Ekranı Geliştirme

**Dosya:** `frontend/src/components/analyze/analyze-client.tsx`

### Mevcut durumu gözlemle, eklentiler:

```tsx
// 1. Score ring (SVG circle progress)
function ScoreRing({ score, label }: { score: number; label: string }) {
  const r = 36;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  return (
    <svg width="88" height="88" viewBox="0 0 88 88">
      <circle cx="44" cy="44" r={r} fill="none" stroke="#1a2035" strokeWidth="8" />
      <circle cx="44" cy="44" r={r} fill="none" stroke="#10b981" strokeWidth="8"
        strokeDasharray={c} strokeDashoffset={offset}
        className="score-ring transition-all duration-1000" />
      <text x="44" y="44" textAnchor="middle" dominantBaseline="middle"
        className="font-bold text-lg fill-white">{score}</text>
    </svg>
  );
}

// 2. Kilitli kategori kartları (4 adet, ücretsiz = kısıtlı)
// Blur overlay üzerinde lock icon + "Rapor Satın Al" CTA

// 3. Top 5 sorun listesi (numbered, kırmızı bullet)

// 4. Upgrade CTA box (emerald gradient border)
// "Tam rapor için $29'dan başlayan paketler →"
```

---

## COD-9 — Admin Settings Sayfası

**Dosya:** `admin/src/app/(main)/settings/page.tsx`

```tsx
// Bölümler:
// 1. Fiyatlandırma (starter/pro/expert USD fiyatları — input)
//    PUT /api/v1/admin/site-settings
// 2. SMTP Test (test email gönder butonu)
// 3. Yönetici Şifre Değiştirme
//    PUT /api/v1/auth/change-password
// 4. Site Bilgileri (site adı, iletişim email)
```

---

## Öncelik Sırası (Codex Çalışma Akışı)

```
1. COD-1  → Design system (globals.css + layout + tailwind)
2. COD-2  → Hero section
3. COD-3  → Trust bar + page.tsx güncelle
4. COD-7  → Mobile menu (hızlı)
5. COD-6  → Pricing tab switcher
6. COD-4  → Report preview section
7. COD-5  → Testimonials
8. COD-8  → Analyze sonuç ekranı
9. COD-9  → Admin settings
```

---

## Test Komutları

```bash
# Frontend başlat
cd geoserra/frontend && bun run dev

# Backend başlat
cd geoserra/backend && bun run dev

# Ücretsiz analiz testi
curl -X POST http://localhost:8095/api/v1/analyze/free \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com","email":"test@test.com"}'

# TypeScript kontrolü
cd geoserra/frontend && bun x tsc --noEmit
```
