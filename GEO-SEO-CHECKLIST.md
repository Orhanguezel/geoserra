# GeoSerra — GEO/SEO İyileştirme Çeklistesi

**Mevcut Skor:** 52/100 — Below Average  
**Hedef:** 75+ (3-4 hafta) → 90+ (bu çeyrek)  
**Rapor Tarihi:** 2026-04-15

---

## 🔴 KRİTİK — Bu Gün

- [x] **llms.txt oluştur** — `/public/llms.txt` → brand tanımı, ana hizmetler, fiyatlar, önemli URL'ler markdown formatında `+6 puan`
- [x] **H1 typography hatası düzelt** — `'AramalarındaGerçek'` birleşik kelime → `{' '}` ile explicit whitespace eklendi `+2 puan`
- [x] **Brand sameAs genişlet** — Organization schema'ya LinkedIn + X/Twitter + YouTube + ProductHunt + founder Person + contactPoint eklendi `+7 puan`

---

## 🟠 YÜKSEK — Bu Hafta

- [x] **Homepage FAQPage JSON-LD ekle** — 6 soru `FAQPage` + `Question` + `acceptedAnswer` schema olarak page.tsx'e eklendi `+4 puan`
- [x] **Pricing Product + Offer schema** — 3 paket için `Product` + `Offer` ItemList JSON-LD eklendi `+3 puan`
- [x] **E-E-A-T: Hakkımızda sayfasına kurucu bilgisi ekle** — Person schema, GitHub/LinkedIn, 800+ kelime, değerler, GEO skor tablosu `+5 puan`
- [x] **Thin content — /analyze genişlet** — 6 kategori kartı, 4-adım süreç, skor referans tablosu, 4 SSS eklendi (~600 kelime) `+4 puan`
- [x] **Thin content — /iletisim genişlet** — SLA, konu kartları, iletişim bilgileri, çalışma saatleri eklendi
- [x] **Thin content — /implementation genişlet** — 4-adım süreç, hizmet listesi, SLA, güvenlik garantisi eklendi
- [x] **HSTS + CSP + Permissions-Policy header** — next.config.ts headers'a HSTS + CSP + Permissions-Policy eklendi `+2 puan`

---

## 🟡 ORTA — Bu Ay

- [x] **Canonical URL** — tüm sayfalara `metadata.alternates.canonical` ile `+1 puan`
- [x] **BreadcrumbList schema** — analyze, iletisim, implementation, pricing, hakkimizda sayfalarına JSON-LD eklendi; iletisim'e ProfessionalService, implementation'a Service schema da eklendi `+1 puan`
- [x] **Image alt text + og:image** — tüm sayfalarda og:image alt text eklendi; favicon-16, favicon-32, apple-touch-icon-180, icon-192, icon-512 oluşturuldu ve layout.tsx'e eklendi `+1 puan`
- [x] **Hakkımızda 800+ kelimeye çıkar** — about-client.tsx 1127 kelime; Person schema, teknoloji stack, kurucu profili, değerler, GEO skor tablosu mevcut `+2 puan`
- [x] **Blog altyapısı kur** — gray-matter+marked tabanlı; /blog liste, /blog/[slug] detay, Article+BreadcrumbList schema, SSG, @tailwindcss/typography; ilk yazı: 'GEO Nedir?' `+4 puan`
- [ ] **LinkedIn Company Page aç** `+5 puan (sosyal paket)`
- [ ] **X/Twitter hesabı aç** `+5 puan (sosyal paket)`
- [ ] **YouTube kanalı aç** `+5 puan (sosyal paket)`
- [ ] **Müşteri testimonial'ları doğrulanabilir yap** — tam isim + şirket + LinkedIn + `Review` schema `+3 puan`
- [ ] **i18n routing altyapısı** — `/tr` ve `/en` URL yapısı, `hreflang` hazırlığı `+2 puan`
- [ ] **Ekran görüntüleri + demo içerik** — product screenshot, örnek rapor, interaktif demo `+2 puan`

---

## 🔵 DÜŞÜK — Mümkün Oldukça

- [x] **Cache-Control ayarla** — `_next/static: immutable`, public assets: `max-age=86400, stale-while-revalidate=604800` `+0.5 puan`
- [x] **OG image tek kaynağa sabitle** — tüm sayfalar `/og-image.png` kullanıyor, dynamic çakışması yok `+0.5 puan`
- [x] **Favicon seti** — `favicon-16.png`, `favicon-32.png`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png` oluşturuldu `+0.5 puan`
- [ ] **Footer sosyal medya linkleri** — LinkedIn, X, YouTube ikonları (hesap açılınca) `+0.5 puan`

---

## 🚀 STRATEJİK — Bu Çeyrek

- [ ] YouTube — haftalık 'GEO Case Study' + 'llms.txt nasıl yazılır' tutorialları `+6 puan`
- [ ] 10-20 temel makale — 'GEO nedir', 'AI Overviews optimizasyonu', 'llms.txt rehberi' `+5 puan`
- [ ] Product Hunt launch + Reddit (r/SEO, r/SaaS, r/marketing) `+4 puan`
- [ ] Medium / Dev.to / Hashnode cross-posting `+3 puan`
- [ ] API + ücretsiz developer tier `+4 puan`
- [ ] Türkçe GEO Score leaderboard `+4 puan`
- [ ] Affiliate/partner program `+3 puan`
- [ ] Wikipedia — 'Generative Engine Optimization' Türkçe maddesi `+3 puan`

---

## Puan Tablosu

| Aşama | Skor | Ek Puan |
|-------|------|---------|
| Başlangıç | 52 | — |
| Kritik tamamlandı | ~61 | +9 |
| + Yüksek tamamlandı | ~75 | +14 |
| + Orta tamamlandı | ~90 | +15 |
| + Stratejik | 95+ | +5+ |
