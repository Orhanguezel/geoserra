# GeoSerra — AGENTS.md
# Codex ve Antigravity için görev talimatları

> Bu dosyayı **Codex** ve **Antigravity** okur.  
> Claude (Mimar) → CLAUDE.md okur.  
> Detaylı sprint planı: SPRINT-2.md

---

## CODEX GÖREVLERİ — Sprint 2

### ⚙️ Genel Kurallar (Codex için)
- Tüm değişiklikler `geoserra/frontend/` veya `geoserra/admin/` altında
- TypeScript strict mode — tip hatası bırakma
- `'use client'` direktifi interaktif bileşenlerde zorunlu
- Tailwind emerald/cyan paleti: `emerald-500 (#10b981)`, `cyan-500 (#0ea5e9)`
- i18n için `t(key, {}, locale)` kullan, `useLocaleStore((s) => s.locale)` ile locale al
- Her görev sonunda: `bun run build` hatasız geçmeli

---

### COD-10 Sitemap & Robots [BLOK B-1]

```
Dosya: geoserra/frontend/src/app/sitemap.ts  (YENİ)
Dosya: geoserra/frontend/src/app/robots.ts   (YENİ)
```

**sitemap.ts:**
```ts
import type { MetadataRoute } from 'next';
const base = 'https://geoserra.com';
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: base,                    lastModified: new Date(), changeFrequency: 'weekly',  priority: 1 },
    { url: `${base}/analyze`,       lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/pricing`,       lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/implementation`,lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/hakkimizda`,    lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/iletisim`,      lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ];
}
```

**robots.ts:**
```ts
import type { MetadataRoute } from 'next';
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/checkout', '/report', '/thank-you', '/api/'] },
      { userAgent: ['GPTBot', 'Google-Extended', 'PerplexityBot', 'ClaudeBot'], allow: '/' },
    ],
    sitemap: 'https://geoserra.com/sitemap.xml',
  };
}
```

---

### COD-11 JSON-LD Schema Markup [BLOK B-3]

```
Dosya: geoserra/frontend/src/app/layout.tsx  (GÜNCELLE)
```

`<head>` içine script ekle:
```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://geoserra.com/#org",
        "name": "GeoSerra",
        "url": "https://geoserra.com",
        "logo": { "@type": "ImageObject", "url": "https://geoserra.com/logo-small.png" },
        "description": "AI destekli GEO ve SEO görünürlük analiz platformu",
        "sameAs": ["https://github.com/Orhanguezel/geoserra"]
      },
      {
        "@type": "WebSite",
        "@id": "https://geoserra.com/#website",
        "url": "https://geoserra.com",
        "name": "GeoSerra",
        "publisher": { "@id": "https://geoserra.com/#org" },
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://geoserra.com/analyze?url={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      }
    ]
  })}}
/>
```

---

### COD-12 Her Sayfa için Metadata [BLOK B-2]

```
Dosya: geoserra/frontend/src/app/analyze/page.tsx       (GÜNCELLE)
Dosya: geoserra/frontend/src/app/hakkimizda/page.tsx    (GÜNCELLE)
Dosya: geoserra/frontend/src/app/iletisim/page.tsx      (GÜNCELLE)
Dosya: geoserra/frontend/src/app/implementation/page.tsx (GÜNCELLE)
```

Her sayfaya `export const metadata: Metadata = { ... }` ekle.

**Örnek (analyze):**
```ts
export const metadata: Metadata = {
  title: 'Ücretsiz GEO SEO Analizi — URL Gir, Skoru Gör',
  description: 'Web sitenizin ChatGPT, Gemini ve Perplexity görünürlüğünü saniyeler içinde analiz et. Ücretsiz, kayıt gerekmez.',
  openGraph: { title: 'Ücretsiz GEO SEO Analizi', description: '...', url: 'https://geoserra.com/analyze' },
};
```

NOT: `'use client'` olan sayfalarda metadata export çalışmaz.
Bunun için `page.tsx` ayrı bir server component wrapper yapısına geçirilmeli:
```
app/analyze/
  page.tsx         ← metadata export, imports AnalyzeClient
  analyze-client.tsx ← 'use client'
```

---

### COD-13 Gizlilik & Kullanım Şartları Sayfaları [BLOK B-4]

```
Dosya: geoserra/frontend/src/app/gizlilik/page.tsx         (YENİ)
Dosya: geoserra/frontend/src/app/kullanim-sartlari/page.tsx (YENİ)
```

**gizlilik/page.tsx** içeriği:
- Başlık: "Gizlilik Politikası"
- Bölümler: Toplanan Veriler, Kullanım Amacı, Veri Güvenliği, KVKK Hakları, İletişim
- Emerald aksan renklerle stillendir, PLAN.md'den içerik alabilirsin

**kullanim-sartlari/page.tsx** içeriği:
- Başlık: "Kullanım Şartları"
- Bölümler: Hizmet Kapsamı, Ücretsiz Analiz Limiti, Ödeme & İade, Sorumluluk Reddi

---

### COD-14 OG Image [BLOK B-5]

```
Dosya: geoserra/frontend/public/og-image.png  (OLUŞTUR — 1200×630)
```

Alternatif olarak `app/opengraph-image.tsx` dynamic OG image:
```tsx
import { ImageResponse } from 'next/og';
export const size = { width: 1200, height: 630 };
export default function OGImage() {
  return new ImageResponse(
    <div style={{ background: '#06090f', display: 'flex', ... }}>
      <img src="https://geoserra.com/logo.png" />
      <h1 style={{ color: '#10b981' }}>AI & SEO Görünürlük Platformu</h1>
    </div>
  );
}
```

---

### COD-15 Admin Sidebar Kontrolü [BLOK B-7]

```
Dosya: geoserra/admin/src/components/layout/sidebar.tsx (GÜNCELLE)
```

- "Ayarlar" menü öğesi var mı kontrol et
- Yoksa ekle: `{ href: '/settings', label: 'Ayarlar', icon: Settings2 }`
- Aktif rota highlight: `usePathname()` ile mevcut sayfayı belirle

---

## ANTİGRAVİTY GÖREVLERİ — Sprint 2

> Codex görevi bitince başla. Önce frontend build al, sonra Antigravity başlat.

### AG-5 Ana Sayfa Tam Visual Audit [BLOK D-1]

**Kontrol URL:** `https://geoserra.com` (veya `localhost:3071`)

Karşılaştırma referansı: `geoserra/geoserra-landing.html`

| Bölüm | Kontrol Noktası |
|-------|----------------|
| Header | Logo görünüyor, nav linkleri çalışıyor |
| Hero | Floating cards hizalı, URL input monospace, badge pulse-ring animasyonu |
| Trust bar | 4 stat rakamı görünüyor, mobilde tek satır |
| How it works | 3 adım kartı, numaralar emerald renkli |
| Report preview | Score ring animasyonu, kategori listesi |
| Testimonials | 3 kart, before/after skor |
| Pricing | Tab switcher çalışıyor, featured kart vurgulanmış |
| Footer | Logo, linkler, gizlilik/kullanım sayfaları |

---

### AG-6 Analiz Akışı UX Audit [BLOK D-2]

**Kontrol URL:** `localhost:3071/analyze`

1. Geçerli URL gir → "Analiz Et" → yükleniyor skeleton görünüyor
2. Sonuç ekranı: GEO skor dairesi animasyonlu açılıyor (sayaç 0'dan skora)
3. 4 kategori kartı: ücretsiz açık, 4+ kilitli (blur overlay)
4. "Kilidi Aç — Tam Raporu Al" butonu → checkout'a yönlendirir
5. Geçersiz URL girişi → hata mesajı
6. Daha önce analiz edilmiş domain → "Bu domain analiz edildi" mesajı
7. Mobil (360px): form ve skor kartları üst üste gelmeden okunuyor

---

### AG-7 Checkout & Ödeme Akışı [BLOK D-3]

**Kontrol URL:** `localhost:3071/checkout/starter`

1. Sayfa yüklendiğinde Stripe Elements formu render oluyor
2. PayPal buton görünüyor (sandbox logo)
3. Test kart: `4242 4242 4242 4242` → başarılı mesaj
4. Test kart: `4000 0000 0000 9995` → "Kart reddedildi" hatası
5. Başarılı ödeme → `/thank-you` redirect
6. Thank-you sayfası: "Analiz başlatıldı" mesajı + analiz ID'si

---

### AG-8 Admin Panel Tam Audit [BLOK D-4]

**Kontrol URL:** `localhost:3072`

1. `/login` → yanlış şifre → hata mesajı (kırmızı)
2. `/login` → doğru giriş → dashboard redirect
3. Dashboard: 6 stat kartı loading skeleton → gerçek veri
4. `/analyses` → tablo pagination çalışıyor, search filter
5. `/analyses/[id]` → detay sayfası, "PDF Gönder" butonu
6. `/implementation` → liste, durum dropdown çalışıyor
7. `/settings` → Marka Görselleri section görünüyor
8. Upload test: logo-small.png yükle → preview anında güncelleniyor

---

### AG-9 Lighthouse & Responsive Audit [BLOK D-5]

**Araçlar:** Chrome DevTools Lighthouse, Mobile viewport

| Test | Hedef |
|------|-------|
| Lighthouse Performance | ≥ 80 |
| Lighthouse SEO | ≥ 90 |
| Lighthouse Accessibility | ≥ 85 |
| FCP (First Contentful Paint) | < 2s |
| CLS (Layout Shift) | < 0.1 |
| 360px viewport | Bozulma yok |
| 768px viewport | 2 kolon düzeni doğru |

Lighthouse raporu sonuçlarını not et ve kritik sorunları Claude'a bildir.

---

## Tamamlanma Sinyali

Her ajan görevi bitirdiğinde buraya işaret et:

| Görev | Ajan | Durum |
|-------|------|-------|
| SPRINT-2 A-1..A-8 | Claude | [ ] |
| COD-10 Sitemap/Robots | Codex | [x] |
| COD-11 JSON-LD Schema | Codex | [x] |
| COD-12 Sayfa Metadata | Codex | [x] |
| COD-13 Gizlilik/Kullanım | Codex | [x] |
| COD-14 OG Image | Codex | [x] |
| COD-15 Admin Sidebar | Codex | [x] |
| AG-5 Ana Sayfa Audit | Antigravity | [x] |
| AG-6 Analiz Akışı | Antigravity | [x] |
| AG-7 Checkout | Antigravity | [x] |
| AG-8 Admin Panel | Antigravity | [x] |
| AG-9 Lighthouse | Antigravity | [x] |

