# GeoSerra — Sprint 1 Planı
# Tasarım Uyumu + Eksik Özellikler + Backend Entegrasyonu

> **Referans:** `geoserra-landing.html`  
> **Tarih:** 2026-04-15  
> **Aktif Ajanlar:** Claude (Mimar), Codex (Uygulayıcı), Antigravity (UI/UX Doğrulama)

---

## Analiz: Landing HTML vs Mevcut Frontend — Fark Raporu

### 🎨 1. Tasarım Sistemi Farkları (KRİTİK)

| Özellik | Landing HTML | Mevcut Frontend | Öncelik |
|---------|-------------|-----------------|---------|
| Renk paleti | Emerald/Cyan (`#10b981`, `#0ea5e9`) | Violet/Blue (`#7C3AED`, `#3B82F6`) | 🔴 KRİTİK |
| Font | Outfit + JetBrains Mono | Inter | 🟡 ORTA |
| Arka plan | `#06090f` + grain overlay + grid lines + orbs | Basit dark | 🔴 KRİTİK |
| Hero girdi | Monospace URL input (tek satır, inline btn) | Basit input | 🟡 ORTA |

### 📐 2. Eksik Bölümler (Frontend'de Yok)

| Bölüm | Landing'de Var? | Mevcut Frontend'de? |
|-------|----------------|---------------------|
| Floating metric cards (hero yanları) | ✅ | ❌ |
| Trust bar (stat row: 2400+ analiz, vb.) | ✅ | Kısmen (hero içinde) |
| Rapor önizlemesi (score cards mockup) | ✅ | ❌ |
| Testimonials / sosyal kanıt | ✅ | ❌ |
| Sample score breakdown mockup | ✅ | ❌ |
| Fiyatlandırma tab'ı (Tek Seferlik / Aylık) | ✅ | Kısmen |
| Mobile menu | ✅ | ❌ |

### ⚙️ 3. Backend Eksikleri

| Özellik | Durum |
|---------|-------|
| Python scriptleri kopyalanmadı (`setup-python.sh` çalıştırılmadı) | ❌ |
| `AnalysisService.runFreeAnalysis()` gerçek Python çağırıyor mu? | ❓ Doğrulanmadı |
| PDF üretim testi | ❓ Test edilmedi |
| Stripe/PayPal webhook lokal test | ❌ |
| Swagger dokümantasyonu | ❌ |
| Admin `/settings` sayfası | ❌ |

---

## Sprint 1 — Öncelikli Görevler

### 🔴 FAZ A — Tasarım Sistemi Geçişi
**Emerald paleti, fontlar, arka plan efektleri**

### 🟡 FAZ B — Eksik Bölümler
**Trust bar, floating cards, rapor önizlemesi, testimonials**

### 🟢 FAZ C — Backend Entegrasyonu
**Python scriptler, analiz servisi doğrulama, PDF testi**

### 🔵 FAZ D — Admin Tamamlama
**Settings sayfası, fiyat güncelleme, email şablonları**

---

## Görev Listesi — Agent Atamaları

---

### 🤖 CLAUDE (Mimar & Stratejist)

#### C-1 Tasarım Token Mimarisi [YAP ŞIMDI]
- [ ] `globals.css` → Emerald/Cyan paleti ile yeniden yaz
- [ ] CSS custom properties'i landing HTML ile eşleştir
- [ ] `tailwind.config.ts` → Emerald renk tokens ekle
- [ ] `hero-mesh` → orb + grid lines + grain overlay ekle

#### C-2 Backend Entegrasyon Doğrulama
- [ ] `backend/src/services/analysis.service.ts` oku → Python bridge gerçekten çalışıyor mu?
- [ ] `setup-python.sh` çalıştır → `backend/python/` dizinini doldur
- [ ] `analysis.service.ts` → eksikse Bun.spawn çağrılarını tamamla
- [ ] PDF servisi entegrasyon testi yaz

#### C-3 Admin Settings Sayfası Tasarımı
- [ ] `GET/PUT /api/v1/admin/site-settings` endpoint'i doğrula
- [ ] Settings sayfası için bileşen yapısını belirle
- [ ] Fiyat güncelleme + email şablonu alanları tasarımı

#### C-4 Git Commit & Push (her faz sonunda)
- [ ] Faz A sonrası commit
- [ ] Faz B sonrası commit
- [ ] Faz C sonrası commit

---

### 💻 CODEX (Uygulayıcı — Toplu Kod Yazma)

#### COD-1 Design System Migration [İLK ÖNCE]
```
Dosya: geoserra/frontend/src/app/globals.css
Görev: Tüm CSS custom properties'i landing HTML ile eşleştir
```
- [ ] Renk değişkenlerini emerald/cyan'a çevir
- [ ] `--bg-primary: #06090f`, `--accent-1: #10b981`, `--accent-3: #0ea5e9`
- [ ] Grain overlay (body::after ile SVG noise)
- [ ] Font: Inter'den Outfit + JetBrains Mono'ya geç (next/font)
- [ ] `hero-mesh` → orb + grid + scan-line animasyonları

#### COD-2 Hero Section — Komple Yeniden Yaz
```
Dosya: geoserra/frontend/src/components/home/hero-section.tsx
```
- [ ] Sol/sağ floating metric cards (score: 94, AI Visibility: 78, vb.)
- [ ] Monospace URL input + inline "Analiz Et" butonu
- [ ] Pulse-ring animasyonu badge'e ekle
- [ ] Animated orb background efekti
- [ ] Platform tags (ChatGPT ● Gemini ● Perplexity ● Google AI ● Bing)

#### COD-3 Trust Bar Bileşeni [YENİ]
```
Dosya: geoserra/frontend/src/components/home/trust-bar.tsx
Konum: Hero ile How-it-works arasına ekle
```
- [ ] `2.400+` Analiz Tamamlandı
- [ ] `48.000+` Sorun Tespit Edildi
- [ ] `+32%` Ortalama Skor Artışı
- [ ] `4.8/5` Müşteri Memnuniyeti
- [ ] page.tsx'e ekle

#### COD-4 Report Preview Section [YENİ]
```
Dosya: geoserra/frontend/src/components/home/report-preview-section.tsx
```
- [ ] 2 kolonlu layout: sol metin, sağ mockup kart
- [ ] Score kartları mockup: GEO skoru daire progress bar, SEO skoru, Lighthouse skoru
- [ ] Kategori breakdown listesi (AI Citability, Schema, Teknik SEO, vb.)
- [ ] "Ücretsiz Analiz Başlat" CTA
- [ ] page.tsx'de PricingSection'dan önce ekle

#### COD-5 Testimonials Section [YENİ]
```
Dosya: geoserra/frontend/src/components/home/testimonials-section.tsx
```
- [ ] 3 kart: müşteri adı + şirket + yorum + önceki/sonraki skor
- [ ] Framer Motion scroll reveal
- [ ] page.tsx'e ekle

#### COD-6 Pricing Section — Yeniden Yaz
```
Dosya: geoserra/frontend/src/components/home/pricing-section.tsx
```
- [ ] Tek Seferlik / Aylık tab switcher ekle
- [ ] "En Popüler" featured kart üst bandı (emerald)
- [ ] Fiyat kartlarına landing'deki tüm özellikleri ekle
- [ ] Fiyat butonu → checkout sayfasına yönlendir

#### COD-7 Mobile Menu
```
Dosya: geoserra/frontend/src/components/layout/header.tsx
```
- [ ] Hamburger toggle (lg:hidden)
- [ ] Slide-down mobile nav panel
- [ ] Backdrop overlay

#### COD-8 Analyze Page — Sonuç Ekranı Geliştirme
```
Dosya: geoserra/frontend/src/components/analyze/analyze-client.tsx
```
- [ ] Score daire (SVG ring progress) — ücretsiz genel skor
- [ ] 4 kategori kartı (kısıtlı önizleme, kilit ikonlu)
- [ ] "Top 5 Sorun" listesi
- [ ] Ücretli rapor CTA (blur overlay + unlock butonu)
- [ ] "PDF rapor için ödeme yap" butonu → checkout'a yönlendir

#### COD-9 Admin Settings Sayfası
```
Dosya: geoserra/admin/src/app/(main)/settings/page.tsx
```
- [ ] Fiyat güncelleme formu ($29/$59/$99 input)
- [ ] Email şablonu önizleme/düzenleme alanı
- [ ] Site settings CRUD (site adı, SMTP test)
- [ ] Admin şifre değiştirme

---

### 🎨 ANTIGRAVITY (UI/UX Doğrulama)

#### AG-1 Ana Sayfa Visual Audit
- [ ] `geoserra.com` açılışında landing HTML ile karşılaştır
- [ ] Hero section: floating cards hizalama, input odak efekti
- [ ] Trust bar: responsive davranış mobilde
- [ ] Fiyatlandırma: hover state, featured kart bandı görünümü
- [ ] Report preview: skor daireleri animasyonu
- [ ] Renk tutarlılığı: emerald vurgu, tüm sayfalarda aynı mı?

#### AG-2 Analyze Sayfası UX Audit
- [ ] Form → yükleniyor → sonuç geçişleri akıcı mı?
- [ ] Score ring animasyonu (count-up efekti)
- [ ] Kilitli kategori blur overlay → CTA butonu tıklanabilirliği
- [ ] Mobile görünümde form ve sonuç ekranı

#### AG-3 Checkout Flow Audit
- [ ] Package seçim sayfası → Stripe formu geçişi
- [ ] PayPal button render
- [ ] Thank-you sayfasına yönlendirme
- [ ] Hata durumları (kart reddedilmesi)

#### AG-4 Admin Panel Audit
- [ ] Login sayfası: form validation mesajları
- [ ] Dashboard: skeleton loading state
- [ ] Analiz listesi: responsive tablo (scroll)
- [ ] Mobile uyumluluk (sidebar collapse)

---

## Çeklisteler — Faz Bazında

### FAZ A — Tasarım Sistemi (Claude + Codex)

```
[ ] C-1:  globals.css → emerald palet
[ ] COD-1: tailwind.config.ts emerald tokens
[ ] COD-1: globals.css grain + orb + grid animasyonlar
[ ] COD-1: Font geçişi (Outfit + JetBrains Mono)
[ ] AG-1:  Renk doğrulama (tüm sayfalarda)
```

**Tahmini süre:** 2-3 saat  
**Test:** `bun run dev:geoserra:fe` → localhost:3071 açılır, emerald tema görünür

---

### FAZ B — Eksik Bölümler (Codex + Antigravity)

```
[ ] COD-2: Hero — floating cards + monospace input
[ ] COD-3: Trust bar bileşeni
[ ] COD-4: Report preview section
[ ] COD-5: Testimonials section
[ ] COD-6: Pricing — tab switcher + featured kart
[ ] COD-7: Mobile menu
[ ] AG-1:  Tüm bölümleri landing ile karşılaştır
[ ] AG-4:  Mobile responsive doğrulama
```

**Tahmini süre:** 1 gün  
**Test:** Tüm home page bölümleri landing HTML'e benziyor

---

### FAZ C — Backend Entegrasyonu (Claude)

```
[ ] scripts/setup-python.sh çalıştır
[ ] analysis.service.ts Python bridge doğrula
[ ] Ücretsiz analiz uçtan uca test et
[ ] PDF üretim testi (örnek domain ile)
[ ] COD-8: Analyze sonuç ekranı (score ring, locked categories)
[ ] AG-2:  Analyze UX flow doğrulama
```

**Test:** `curl -X POST localhost:8095/api/v1/analyze/free -d '{"url":"https://geoserra.com","email":"test@test.com"}'`

---

### FAZ D — Admin Tamamlama (Codex + Claude)

```
[ ] COD-9: Admin settings sayfası
[ ] C-3:   Settings endpoint doğrulama
[ ] AG-4:  Admin panel tam audit
```

---

## Teknik Kararlar

### Renk Geçişi Stratejisi

Mevcut frontend `violet/blue` kullanıyor. Landing `emerald/cyan` kullanıyor.

**Karar:** Landing'i baz al — emerald palette. Sebepler:
- GeoSerra = doğa + teknoloji = emerald uyumlu
- Landing profesyonel ajans tarafından tasarlandı
- Violet → saas/startup klişesi, emerald → daha özgün

**Uygulama:**
```css
/* globals.css değişecek */
--primary: 160 84% 39%;        /* emerald-600 #10b981 */
--primary-foreground: 0 0% 100%;
--secondary: 199 89% 48%;      /* cyan-500  #0ea5e9  */
```

### Font Stratejisi

**Karar:** `next/font/google` ile Outfit + JetBrains Mono ekle, Inter'i kaldır

```tsx
// layout.tsx'de
import { Outfit, JetBrains_Mono } from 'next/font/google';
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });
```

### Animasyon Stratejisi

Landing'deki CSS animasyonlar (`@keyframes orbit`, `scan-line`, `float`) Framer Motion ile karşılanabilir. Mevcut frontend zaten Framer Motion kullanıyor — iyi.

---

## Dosya Değişiklik Haritası

### Claude Değiştirecek
| Dosya | Değişiklik |
|-------|-----------|
| `backend/src/services/analysis.service.ts` | Python bridge doğrulama |
| `backend/src/routes.ts` | Settings endpoint kontrolü |
| `frontend/src/app/globals.css` | Palet token değişikliği |

### Codex Değiştirecek
| Dosya | Değişiklik |
|-------|-----------|
| `frontend/src/app/globals.css` | Grain + orb animasyonları |
| `frontend/src/app/layout.tsx` | Font geçişi |
| `frontend/tailwind.config.ts` | Emerald tokens |
| `frontend/src/components/home/hero-section.tsx` | Tam yeniden yaz |
| `frontend/src/components/home/trust-bar.tsx` | YENİ |
| `frontend/src/components/home/report-preview-section.tsx` | YENİ |
| `frontend/src/components/home/testimonials-section.tsx` | YENİ |
| `frontend/src/components/home/pricing-section.tsx` | Tab switcher + featured kart |
| `frontend/src/components/layout/header.tsx` | Mobile menu |
| `frontend/src/components/analyze/analyze-client.tsx` | Score ring + locked cards |
| `frontend/src/app/page.tsx` | Yeni bileşenler ekle |
| `admin/src/app/(main)/settings/page.tsx` | YENİ |

### Antigravity Doğrulayacak
| Sayfa | Kontrol Noktaları |
|-------|------------------|
| `localhost:3071/` | Landing vs Frontend karşılaştırma |
| `localhost:3071/analyze` | Form + sonuç ekranı UX |
| `localhost:3071/checkout/starter` | Ödeme flow |
| `localhost:3072/` | Admin dashboard |
| Mobil görünüm | Header, hero, pricing, analyze |

---

## AGENTS.md — Codex İçin Talimatlar

> Bu bölüm `geoserra/AGENTS.md` dosyasına kopyalanacak (Codex okur)

### Codex Kuralları

1. Tüm değişiklikler `geoserra/frontend/` veya `geoserra/admin/` altında
2. `bun run dev` çalışıyor olmalı — TypeScript hatası bırakma
3. Emerald palet: `#10b981` (primary), `#0ea5e9` (secondary/accent)
4. Framer Motion kullan — CSS animasyon yazmaktan kaçın
5. Shadcn/Radix UI bileşenlerini kullan
6. Her bileşen `'use client'` direktifi ile başlamalı (eğer interaktifse)
7. `t(key, {}, locale)` fonksiyonunu i18n için kullan
8. `useLocaleStore((s) => s.locale)` ile locale al

### Öncelik Sırası (Codex için)

1. **COD-1** → Design system (globals.css + tailwind) → Diğerleri buna bağlı
2. **COD-2** → Hero section
3. **COD-3** → Trust bar
4. **COD-4** → Report preview
5. **COD-6** → Pricing tabs
6. **COD-7** → Mobile menu
7. **COD-5** → Testimonials
8. **COD-8** → Analyze sonuç ekranı
9. **COD-9** → Admin settings

---

## Başarı Kriterleri

Sprint 1 tamamlandığında:

- [ ] `geoserra.com` landing page, `geoserra-landing.html` ile %90+ görsel benzerlik
- [ ] Ücretsiz analiz uçtan uca çalışıyor (URL gir → skor gör)
- [ ] Ücretli analiz → Stripe checkout → analiz başlıyor
- [ ] PDF email olarak gönderiliyor
- [ ] Admin paneli tüm analizleri görüyor, PDF resend çalışıyor
- [ ] Mobile responsive (360px'de bozulmuyor)
- [ ] Lighthouse score ≥ 85 (Performance)

---

## Sıradaki Adım: Codex Görevi Başlatma

Codex'e verilecek ilk prompt:

```
GeoSerra frontend'in tasarım sistemini geoserra-landing.html'e uyumlu hale getir.

1. geoserra/frontend/src/app/globals.css → Emerald/Cyan palet:
   primary: #10b981, secondary: #0ea5e9, bg: #06090f
   Grain overlay (body::after SVG noise, opacity 0.025)
   Grid lines (.hero-grid)
   Float animation (@keyframes float, 6s ease-in-out)

2. geoserra/frontend/src/app/layout.tsx → Font değiştir:
   Outfit (400/600/700/800) + JetBrains Mono (400/600)
   Inter'i kaldır

3. geoserra/frontend/tailwind.config.ts → Emerald color tokens ekle

4. geoserra/frontend/src/components/home/hero-section.tsx → Tam yeniden yaz:
   - 3 floating metric card (sol + sağ)
   - Monospace URL input inline btn
   - Platform tags (ChatGPT, Gemini, Perplexity, Google AI, Bing)
   - Pulse-ring badge animasyonu

CLAUDE.md kuralları: ALTER TABLE yasak, bun tercih et
```
