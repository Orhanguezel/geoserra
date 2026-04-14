# GeoSerra — Proje Planı & Geliştirme Çeklistesi

> **Siteye:** https://geoserra.com  
> **Dizin:** `vps-guezel/geoserra/`  
> **Oluşturulma:** 2026-04-14  
> **Durum:** Planlama → Geliştirme aşamasına geçiş

---

## 1. İş Modeli Kararları (KESİNLEŞTİ)

| Karar | Seçim |
|-------|-------|
| Ödeme sistemi | Stripe + PayPal |
| Kullanıcı hesabı | Zorunlu değil (email yeterli) |
| Ücretsiz analiz limiti | 1 analiz / domain (tekrar analiz engellenir) |
| Ücretsiz kısıtlama | 4 kategori, genel skor, top 5 sorun — PDF yok |
| Ücretli çıktı | Detaylı PDF rapor (email ile gönderim) |
| Aylık hizmet | Dashboard + aylık yeniden analiz + delta raporu |
| Implementation hizmeti | Manuel — müşteri form ile talep gönderir, siz yaparsınız |
| Para birimi | USD baz, TR / EUR otomatik dönüşüm (ExchangeRate API) |
| Dil | TR + EN başlangıç, dinamik i18n (genişletilebilir) |
| Admin paneli | Var — analiz yönetimi, müşteri listesi, manuel PDF gönderim |

---

## 2. Fiyatlandırma (USD Baz)

### Tek Seferlik Raporlar

| Paket | Fiyat | Kapsam |
|-------|-------|--------|
| **Starter Report** | $29 | 8 kategori tam analiz, PDF rapor, 30 aksiyon maddesi |
| **Pro Report** | $59 | Starter + Schema JSON-LD oluşturma, AI visibility tam analiz, rakip karşılaştırma |
| **Expert Report** | $99 | Pro + 1 saatlik implementation (robots.txt, sitemap, temel schema kurulumu) |

### Aylık Abonelikler

| Paket | Fiyat/Ay | Kapsam |
|-------|----------|--------|
| **Monitor** | $39/ay | Aylık yeniden analiz + delta raporu + email özet |
| **Growth** | $79/ay | Monitor + aylık 2 saat implementation + öncelikli destek |
| **Agency** | $149/ay | Growth + 3 site, haftalık tarama, custom marka raporlama |

> Not: TL ve EUR karşılığı sayfada ExchangeRate API ile gerçek zamanlı gösterilecek. Ödeme USD olarak alınır.

---

## 3. Analiz Motorları (geo-seo-claude'dan)

Mevcut Python scriptler backend'de çağrılacak:

| Script | Görev | Ücretsiz | Ücretli |
|--------|-------|----------|---------|
| `lighthouse_checker.py` | Performance, Core Web Vitals | ✓ skor | ✓ detay |
| `fetch_page.py` | HTML crawl, meta, headings | ✓ sınırlı | ✓ tam |
| `dns_checker.py` | SPF, DMARC, HTTPS | ✓ | ✓ |
| `performance_analyzer.py` | Kaynak analizi, hız | — | ✓ |
| `citability_scorer.py` | AI citability skoru | — | ✓ |
| `brand_scanner.py` | Marka mention analizi | — | ✓ |
| `keyword_analyzer.py` | Anahtar kelime tutarlılığı | — | ✓ |
| `llmstxt_generator.py` | AI crawler erişim analizi | — | ✓ |
| `generate_pdf_report.py` | ReportLab PDF üretimi | — | ✓ |

**Analiz akışı:**
```
Frontend (URL + email)
  → Backend /api/analyze endpoint
  → Python scriptler sırayla çalışır (child_process veya Bun.spawn)
  → Sonuçlar MySQL'e kaydedilir
  → Ücretsiz: kısıtlı JSON response
  → Ücretli: ödeme sonrası tam analiz + PDF üretimi + email gönderim
```

---

## 4. Teknik Mimari

### Dizin Yapısı

```
vps-guezel/geoserra/
├── frontend/          # Next.js 16, Tailwind v4, Shadcn UI
├── backend/           # Fastify 5, Drizzle ORM, MySQL
├── admin/             # Next.js 16 (admin paneli)
└── PLAN.md            # Bu dosya
```

### Portlar (VPS)

| Servis | Port |
|--------|------|
| Frontend | 3071 |
| Backend | 8095 |
| Admin | 3072 |

### Paylaşılan Paketler (workspace:*)

| Paket | Kullanım |
|-------|---------|
| `@vps/shared-backend` | `authPlugin`, `mysql`, `mail`, `swagger`, `i18n-locale` |
| `@vps/shared-backend/modules/checkout` | Stripe + PayPal ödeme akışı |
| `@vps/shared-backend/modules/mail` | PDF email gönderimi |
| `@vps/shared-backend/modules/pricing` | Paket fiyatlandırma CRUD |
| `@vps/shared-backend/modules/seo` | SEO metadata yönetimi |
| `@vps/shared-backend/modules/dashboard` | Admin dashboard istatistikler |
| `@vps/shared-types` | Ortak TypeScript tipleri |
| `@vps/shared-ui` | Ortak React bileşenler |
| `@vps/shared-config` | Tailwind tokens, TSConfig |

---

## 5. Veritabanı Şeması (MySQL)

### Tablolar

```sql
-- Analiz talepleri
analyses
  id, domain, email, status (free|pending_payment|completed|failed),
  free_data JSON, full_data JSON, pdf_path,
  payment_provider, payment_id, package_slug,
  created_at, completed_at

-- Domain engel listesi (ücretsiz 1 analiz/domain kuralı)
domain_locks
  id, domain (UNIQUE), first_analyzed_at, analysis_count

-- Aylık abonelikler (ileride)
subscriptions
  id, email, package_slug, stripe_subscription_id, paypal_subscription_id,
  status, next_billing_at, created_at

-- Implementation talepleri
implementation_requests
  id, email, domain, package_slug, notes,
  cpanel_host, cpanel_user (şifreli, nullable),
  status (pending|in_progress|done), admin_notes,
  created_at, updated_at

-- Admin kullanıcılar
admins
  id, email, password_hash, name, role, created_at
```

---

## 6. API Kontratları (Backend)

### Analiz Endpointleri

```
POST /api/analyze/free
  body: { url, email }
  → domain lock kontrolü
  → hızlı analiz çalıştır (lighthouse + fetch + dns)
  → kısıtlı sonuç döndür + kaydet

POST /api/analyze/paid
  body: { url, email, package }
  → ödeme başlat (Stripe/PayPal intent)
  → analysis_id döndür

POST /api/analyze/webhook/stripe
POST /api/analyze/webhook/paypal
  → ödeme doğrula
  → tam analiz kuyruğa al
  → PDF üret
  → email gönder

GET /api/analyze/:id/status
  → analiz durumu sorgula (polling veya SSE)

GET /api/analyze/:id/download
  → PDF download (geçici token ile)
```

### Implementation Talepleri

```
POST /api/implementation/request
  body: { email, domain, package, notes, cpanel? }
```

### Admin Endpointleri

```
POST   /api/admin/auth/login
GET    /api/admin/analyses         # Tüm analizler, filtrelenebilir
GET    /api/admin/analyses/:id     # Detay + ham JSON
POST   /api/admin/analyses/:id/resend-pdf
GET    /api/admin/implementation-requests
PATCH  /api/admin/implementation-requests/:id
GET    /api/admin/stats            # Dashboard metrikleri
```

---

## 7. Frontend Sayfaları

### Genel Site (geoserra.com)

| Sayfa | Rota | Açıklama |
|-------|------|---------|
| Ana Sayfa | `/` | Hero + nasıl çalışır + özellikler + fiyatlandırma + referanslar |
| Ücretsiz Analiz | `/analyze` | URL + email formu, sonuç gösterimi |
| Fiyatlandırma | `/pricing` | Paketler, TL/EUR toggle |
| Ödeme | `/checkout/[packageSlug]` | Stripe + PayPal checkout |
| Analiz Sonucu | `/report/[id]` | Analiz durumu + ücretsiz önizleme |
| Implementation Talebi | `/implementation` | Form sayfası |
| Teşekkür | `/thank-you` | Ödeme sonrası yönlendirme |
| Hakkımızda | `/about` | |
| İletişim | `/contact` | |

### Admin Paneli (admin.geoserra.com)

| Sayfa | Açıklama |
|-------|---------|
| `/` | Dashboard — toplam analiz, gelir, bekleyen işler |
| `/analyses` | Tüm analizler tablosu, filtreleme |
| `/analyses/[id]` | Detay görünüm, PDF yeniden gönder, ham JSON |
| `/implementation` | Implementation talepleri, durum güncelleme |
| `/settings` | Fiyat güncelleme, email şablonları |

---

## 8. i18n Yapısı

- `next-intl` kullanılacak (`@vps/shared-config`'e eklenecek)
- Rota yapısı: `/[locale]/...` → `/tr/analyze`, `/en/analyze`
- Başlangıç dilleri: `tr`, `en`
- Çeviri dosyaları: `frontend/messages/tr.json`, `frontend/messages/en.json`
- Yeni dil eklemek: mesaj dosyası + `i18n.config.ts`'e locale ekleme

---

## 9. PDF Rapor

- Mevcut `geo-seo-claude/scripts/generate_pdf_report.py` (ReportLab) kullanılacak
- Backend'den `Bun.spawn(['python3', 'generate_pdf_report.py', jsonPath, outputPath])` ile çağrılır
- PDF'ler `/backend/storage/reports/[analysisId].pdf` konumuna kaydedilir
- Email eki veya geçici URL ile müşteriye iletilir
- GeoSerra markası, logo ve renkleriyle özelleştirilmiş şablon

---

## 10. Ödeme Akışı

### Tek Seferlik (Stripe)
```
Müşteri checkout → Stripe PaymentIntent oluştur → Frontend ödeme formu
→ Webhook: payment_intent.succeeded → Analiz başlat → PDF üret → Email gönder
```

### Tek Seferlik (PayPal)
```
Müşteri checkout → PayPal Order oluştur → PayPal onay sayfası
→ Capture → Analiz başlat → PDF üret → Email gönder
```

### Aylık Abonelik (Stripe Subscription)
```
Müşteri → Stripe Subscription oluştur → İlk analiz hemen
→ Her ay: customer.subscription.renewed webhook → Yeniden analiz → Delta PDF → Email
```

---

## 11. Geliştirme Çeklistesi

### Faz 1 — Backend Altyapı
- [x] `geoserra/backend/` dizin iskeleti ve package.json
- [x] Drizzle şema dosyaları (5 SQL seed dosyası)
- [x] `bun run db:seed:fresh` scripti
- [x] Python analiz scriptlerini wrap eden `AnalysisService`
- [x] `/api/v1/analyze/free` endpoint + domain lock
- [x] `/api/v1/analyze/paid` endpoint (Stripe + PayPal)
- [x] Stripe webhook entegrasyonu
- [x] PayPal webhook + capture entegrasyonu
- [x] PDF üretim servisi (Python bridge via Bun.spawn)
- [x] Email gönderim (Nodemailer)
- [x] Admin JWT auth (@vps/shared-backend/middleware)
- [x] Admin endpointleri (analyses, implementation, siteSettings, users)
- [x] Currency service (open.er-api.com + DB cache)
- [x] Packages tanımları ($29/$59/$99)
- [x] `scripts/setup-python.sh` (geo-seo-claude scriptlerini kopyalar)
- [x] workspace'e eklendi (`bun run dev:geoserra:be`)
- [x] `project.portfolio.json` oluşturuldu
- [ ] `bun install` → bağımlılıkları yükle
- [ ] `scripts/setup-python.sh` çalıştır → Python scriptleri kopyala
- [ ] `.env` oluştur (.env.example'dan)
- [ ] DB oluştur + `bun run db:seed:fresh`
- [ ] `bun run dev` ile test et
- [ ] Swagger dokümantasyonu (opsiyonel — @vps/shared-backend/plugins/swagger)

### Faz 2 — Frontend
- [x] `geoserra/frontend/` Next.js 16 iskeleti (port 3071)
- [x] i18n — özel `t.ts` + `tr.json` + `en.json` (next-intl yerine Zustand locale store)
- [x] Landing page (hero, özellikler, nasıl çalışır, fiyatlandırma, SSS, CTA)
- [x] Ücretsiz analiz formu + domain lock + sonuç ekranı (`/analyze`)
- [x] Ödeme sayfaları — Stripe Elements + PayPal SDK (`/checkout/[package]` + `/checkout/[package]/pay`)
- [x] Analiz durum polling + PDF indirme (`/report/[id]`)
- [x] Currency converter widget (USD/TRY/EUR toggle)
- [x] Implementation talep formu (`/implementation`)
- [x] Thank-you, Hakkımızda, İletişim, Fiyatlandırma sayfaları
- [x] `geoserra/frontend` workspace'e eklendi

### Faz 3 — Admin Paneli
- [x] `geoserra/admin/` Next.js 16 iskeleti (port 3072)
- [x] Login sayfası
- [x] Dashboard istatistikler (stats endpoint + 6 kart)
- [x] Analiz listesi + detay (filtre, sayfalama)
- [x] PDF yeniden gönder butonu + analizi yeniden çalıştır
- [x] Implementation talebi yönetimi (liste + detay + durum güncelleme)
- [x] Backend: `/api/v1/admin/stats` endpoint eklendi

### Faz 4 — DevOps
- [x] `vps-guezel/package.json`'a geoserra/admin workspace eklendi
- [x] `dev:geoserra:admin` scripti eklendi
- [x] PM2 config — `geoserra/admin/ecosystem.config.cjs`
- [x] Nginx config — `geoserra/nginx.conf` (3 subdomain: geoserra.com, api, admin)
- [x] `.env.example` dosyaları (backend + admin)
- [x] `project.portfolio.json` (mevcut)
- [ ] GitHub repo oluştur

### Faz 5 — Sprint 1: Tasarım + Eksik Özellikler + Backend Entegrasyonu

> Detay: `SPRINT-1.md` | Codex talimatları: `AGENTS.md`

#### FAZ A — Tasarım Sistemi (Emerald/Cyan — landing HTML uyumu)
- [ ] `globals.css` → Emerald/Cyan palet (#10b981, #0ea5e9)
- [ ] Font geçişi: Inter → Outfit + JetBrains Mono
- [ ] Grain overlay + hero grid + orb arka plan efektleri
- [ ] `tailwind.config.ts` emerald token'ları

#### FAZ B — Eksik Frontend Bölümleri
- [ ] Hero section — floating metric cards + monospace URL input
- [ ] Trust bar bileşeni (2.400+ analiz, 48K+ sorun, +32% skor, 4.8/5)
- [ ] Report preview section (score ring mockup, kategori breakdown)
- [ ] Testimonials section (3 müşteri kartı, before/after skor)
- [ ] Pricing section — Tek Seferlik / Aylık tab switcher + featured kart
- [ ] Mobile menu (hamburger + slide panel)

#### FAZ C — Backend Entegrasyonu
- [ ] `setup-python.sh` çalıştır → `backend/python/` doldur
- [ ] `analysis.service.ts` Python bridge doğrulama
- [ ] Ücretsiz analiz uçtan uca testi
- [ ] PDF üretim testi
- [ ] Analyze sonuç ekranı: score ring + locked categories + CTA

#### FAZ D — Admin Tamamlama
- [ ] Admin settings sayfası (fiyat güncelleme, SMTP test, şifre değiştirme)

---

## 12. Kesinleşen Kararlar (2026-04-14)

| # | Konu | Karar |
|---|------|-------|
| 1 | Kur dönüşüm API | `open.er-api.com` ücretsiz plan — backend'de 1 saatlik DB cache |
| 2 | Analiz kuyruğu | Basit DB durum takibi: `pending → running → done` |
| 3 | PDF şablonu | Mevcut `geo-seo-claude` ReportLab şablonu — GeoSerra marka güncellemesiyle |
| 4 | Admin adresi | `admin.geoserra.com` (ayrı subdomain, port 3072) |
| 5 | Abonelik zamanlaması | Faz 1'de yok — sadece tek seferlik raporlar |
| 6 | cPanel şifre saklama | DB'ye kaydedilmez — şifreli email ile iletilir, form submit sonrası silinir |

---

## 13. Kur Dönüşüm Mimarisi

```
Backend — CurrencyService
  → Startup + her 1 saatte bir: GET https://open.er-api.com/v6/latest/USD
  → USD/TRY ve USD/EUR kurları DB'ye (site_settings tablosu veya ayrı currency_rates tablosu) kaydedilir
  → Frontend: GET /api/currency/rates → { USD: 1, TRY: 38.50, EUR: 0.92 }
  → Pricing sayfasında toggle: $ | ₺ | €
  → Ödeme DAIMA USD üzerinden alınır — görsel dönüşüm sadece display
```

```sql
-- currency_rates tablosu
currency_rates
  id, base (USD), target (TRY|EUR), rate DECIMAL(10,4),
  fetched_at TIMESTAMP
```

> Not: QuickEcommerce'te manuel kur girişi var; GeoSerra'da otomatik çekim tercih edildi.

---

## 14. Dosya Notları

- `geo-seo-claude/scripts/` → backend'e `geoserra/backend/python/` olarak kopyalanacak (sembolik link veya copy)
- `geo-seo-claude/agents/` → mevcut agent'lar analiz pipeline için kullanılabilir
- Mevcut örnek PDF'ler ve JSON'lar → geliştirme sırasında test verisi olarak kullanılacak
