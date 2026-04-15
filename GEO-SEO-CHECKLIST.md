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
- [ ] **E-E-A-T: Hakkımızda sayfasına kurucu bilgisi ekle** — Orhan Güzel için `Person` schema, LinkedIn linki, fotoğraf `+5 puan`
- [ ] **Thin content — /analyze genişlet** — 500+ kelime: 'Ne ölçülür', 'Nasıl çalışır', örnek sonuç blokları `+4 puan`
- [ ] **Thin content — /iletisim genişlet** — adres, saatler, SLA, süreçler (14 kelimeden kurtul)
- [ ] **Thin content — /implementation genişlet** — gerçekleme süreci, SLA, örnekler
- [x] **HSTS + CSP + Permissions-Policy header** — next.config.ts headers'a HSTS + CSP + Permissions-Policy eklendi `+2 puan`

---

## 🟡 ORTA — Bu Ay

- [ ] **Canonical URL** — tüm sayfalara `metadata.alternates.canonical` ile `+1 puan`
- [ ] **BreadcrumbList schema** — tüm alt sayfalara JSON-LD + UI breadcrumb `+1 puan`
- [ ] **Image alt text + og:image** — homepage görsellerine `alt` tag, `og:image` tek kaynakta sabitle `+1 puan`
- [ ] **Hakkımızda 800+ kelimeye çıkar** — misyon, teknoloji stack, değerler, basın bağlantıları + `Person` schema `+2 puan`
- [ ] **Blog altyapısı kur** — `/blog` dizini, MDX, `Article` schema + author `Person` + FAQPage `+4 puan`
- [ ] **LinkedIn Company Page aç** `+5 puan (sosyal paket)`
- [ ] **X/Twitter hesabı aç** `+5 puan (sosyal paket)`
- [ ] **YouTube kanalı aç** `+5 puan (sosyal paket)`
- [ ] **Müşteri testimonial'ları doğrulanabilir yap** — tam isim + şirket + LinkedIn + `Review` schema `+3 puan`
- [ ] **i18n routing altyapısı** — `/tr` ve `/en` URL yapısı, `hreflang` hazırlığı `+2 puan`
- [ ] **Ekran görüntüleri + demo içerik** — product screenshot, örnek rapor, interaktif demo `+2 puan`

---

## 🔵 DÜŞÜK — Mümkün Oldukça

- [ ] **Cache-Control ayarla** — `s-maxage=31536000` → `s-maxage=3600, stale-while-revalidate=86400` `+0.5 puan`
- [ ] **OG image tek kaynağa sabitle** — statik `/og-image.png` ile Next.js dynamic çakışması gider `+0.5 puan`
- [ ] **Favicon seti** — `favicon-16.png`, `favicon-32.png`, `apple-touch-icon-180.png`, `icon-512.png` `+0.5 puan`
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
