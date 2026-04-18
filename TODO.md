# GeoSerra — TODO / Roadmap

Son oturumda tamamlanan işler ve sonraki sprint için yapılacaklar listesi.

---

## ✅ Tamamlandı — Faz 1 (Analiz Altyapısı)

- [x] **62.5 placeholder bug** — `extractFreeData()` artık 0.5 fallback kullanmıyor, gerçek veri döndürüyor
- [x] **PSI API key** — backend `.env`'e eklendi (`GOOGLE_PSI_API_KEY`), Lighthouse çalışıyor
- [x] **HTTPS detection** — `fetch_page.py`'a `is_https` + `final_url` alanları eklendi
- [x] **6-boyutlu skorlama** — `ai_citability`, `brand_authority`, `content_eeat`, `technical`, `schema`, `platform_optimization`
- [x] **Lighthouse path normalize** — `strategies.mobile.categories` → flat `categories` (backend uyumu)
- [x] **Score scale fix** — `lhNorm()` helper (0-100 vs 0-1 otomatik normalize)
- [x] **AI Platform Readiness** — 5 platform (Google AIO, ChatGPT, Perplexity, Gemini, Bing Copilot) skoru dimensions'tan türetiliyor
- [x] **FREE_ANALYSIS_DOMAIN_LOCK env flag** — test için bypass, prod'da `true` olacak

## ✅ Tamamlandı — Faz 2 (PDF Rapor Pipeline)

- [x] **Crawler access helper** — `fetch_page.py robots` → 14 AI bot × platform × status × öneri
- [x] **PDF data builder** — `generate_pdf_report.py` şemasına map
- [x] **Groq prompts (v1)** — `executive_summary`, `findings`, `quick_wins`/`medium_term`/`strategic`
- [x] **Groq prompts (v2)** — Türkçe + gerçek veri referanslı (title, h1, word count, missing schema types)
- [x] **Brand Authority score** — Wikipedia/Wikidata sinyalleri ile skor üretimi (GitHub/LinkedIn test: 25)
- [x] **Rule-based findings fallback** — Groq başarısız olursa kural tabanlı bulgu üretimi
- [x] **PDF download redirect** — `/api/v1/analyze/:id/download` → 302 → `/reports/<file>.pdf`
- [x] **Frontend `/report/[id]`** — 6 boyutlu bar + 5 platform readiness + PDF download butonu
- [x] **Frontend `/hesabim`** — PDF butonu label'lı, `target="_blank"`

---

## ⏸️ Pending — Küçük İşler

- [ ] **Production domain lock** — `FREE_ANALYSIS_DOMAIN_LOCK=true` yap (VPS backend `.env`)
  ```bash
  ssh guezelwebdesign
  sed -i 's/FREE_ANALYSIS_DOMAIN_LOCK=false/FREE_ANALYSIS_DOMAIN_LOCK=true/' /var/www/geoserra/backend/.env
  pm2 restart geoserra-backend
  ```

- [x] **VPS test-full.ts temizlik** — dev script'leri silindi (2026-04-18)

---

## 🎯 SONRAKİ OTURUM — Başla Buradan

**Durum (oturum sonu 2026-04-18):**
- Fiyatlama yeni yapıda canlı: Basic $5 / Standart $15 / Premium $50 ✅
- Free tier: Groq yok, rule-based, $0 maliyet ✅
- Örnek PDF paylaşımı aktif: https://geoserra.com/assets/sample-report.pdf ✅
- Analiz pipeline + delta compare + robustness tam ✅

**Sonraki sprint için sıralı plan:**

### 1️⃣ Implementation Paketleri — PRIORITY 1 (~1.5 saat)

Kullanıcı açıkça istedi, mevcut `implementation` modülü form-bazlı ama tier yok. 5 tier eklenecek:

| Paket | Tip | Fiyat | Süre | Kapsam |
|---|---|---|---|---|
| **Quick Fix** | One-time | $49 | 1-2 saat | robots.txt + meta tags + temel schema + HTTPS |
| **Essential** | One-time | $199 | 3-5 gün | Critical/high findings + schema paketi (5 tip) + security headers + sitemap + llms.txt |
| **Kapsamlı** | One-time | $499 | 2 hafta | Essential + ana sayfa + 5 alt sayfa content rewrite + 30 gün takip |
| **Aylık Bakım** | Abonelik | $99/ay (3ay min) | — | Aylık re-scan + 48h critical fix + trend raporu |
| **Full Retainer** | Abonelik | $499/ay | — | Haftalık check-in + sınırsız fix + content/schema updates |

**Yapılacaklar:**
- [ ] `backend/src/modules/implementation/` — `package_slug` kolonu ekle (ENUM: `quick_fix`, `essential`, `kapsamli`, `monthly`, `retainer`)
- [ ] `backend/packages.ts`'e paralel `IMPLEMENTATION_PACKAGES` export'u
- [ ] DB migration (008_implementation_packages.sql)
- [ ] Admin panel: tier filtresi, status workflow (pending → in_progress → done)
- [ ] `frontend/app/implementation/` sayfası: 5 paket kartı + form (mevcut form altında)
- [ ] `/analyze` PDF sonrası "Bu raporu $199'a uygularız" CTA — Essential paketine yönlendir
- [ ] Stripe/PayPal checkout flow'u implementation için (mevcut analyze flow'u generalize et)
- [ ] Abonelik handler (monthly/retainer) — Stripe subscription integration
- [ ] Rapor sayfasında (`/report/[id]`) implementasyon CTA (paid tier kullanıcılar için)

### 2️⃣ Ödeme Akışı Doğrulama — PRIORITY 2 (~1 saat)

Canlı gelir için kritik. Test kartları ile end-to-end doğrula:
- [ ] Stripe test kart (4242...) ile $15 Standart satın al → analiz tetiklensin → PDF gelsin
- [ ] PayPal sandbox ile aynı test
- [ ] Webhook idempotency (aynı olay 2x gelirse duplicate analiz yapmamalı)
- [ ] Fatura e-mail template (şu an email template var mı?)
- [ ] Ödeme başarısız durumu (kart reddi) — kullanıcıya mesaj doğru mu?

### 3️⃣ Admin Paneli — PRIORITY 3 (~2-3 saat)

Operasyonel kontrol için. Route'lar zaten `/api/v1/admin/*` altında var (requireAdmin middleware). Frontend eksik:
- [ ] `admin/app/` workspace'de admin sayfaları (login, analyses, users, settings, stats)
- [ ] Analiz listesi + arama + manuel retry butonu
- [ ] Implementation talepleri tablosu + status update
- [ ] Kullanıcı hesapları (soft delete, role change)
- [ ] Site settings CMS (logo, SMTP, fiyatlar)
- [ ] Groq token kullanım grafiği (bugün/bu ay maliyet)

### 4️⃣ Production Hardening — PRIORITY 4 (~1 saat)

Canlıya tam güvenle geçmek için:
- [ ] `FREE_ANALYSIS_DOMAIN_LOCK=true` yap (yukarıdaki komut)
- [ ] PM2 autostart doğrulama: `pm2 startup && pm2 save`
- [ ] Backup cron: `storage/reports/` + DB günlük → tar.gz
- [ ] Uptime monitoring (UptimeRobot free tier yeterli)
- [ ] Telegram alert webhook (Groq kota %80, backend down, disk %90)

### 5️⃣ Analytics + GTM — PRIORITY 5 (~30 dk)

- [ ] `NEXT_PUBLIC_GTM_ID` set et (GTM container kur)
- [ ] GTM'de GA4 ekle
- [ ] Conversion event'leri: `analyze_submit`, `checkout_start`, `purchase_complete`
- [ ] Funnel görselleştirme

### İkinci Faz — Kalite Kazançları (opsiyonel, sonra)

- [ ] **Citability scorer'ı free tier'a aç** — paid-only olmasına gerek yok, rule-based zaten var
- [ ] **JS rendering (Playwright)** — SPA siteler için daha iyi `has_ssr_content` tespiti
- [ ] **Eksik Python analyzer'ları** — `eeat_analyzer.py`, `schema_validator.py`, `platform_analyzer.py`, `technical_analyzer.py` (heuristic'leri gerçek script'le değiştir)
- [ ] **Multi-page audit** — homepage + 5-10 iç sayfa (Premium paket için)
- [ ] **Rakip analizi implementasyonu** — Premium paket feature'ı, şu an listede ama backend'i yok

---

## Sonraki Oturumda İlk Adım

**Tahmini süre: 1.5 saat**

```
1. Implementation paketleri yapısını oluştur
2. Admin panel → Implementation talepleri tablosu  
3. /pricing sayfasına ayrı "İmplementasyon" section'ı ekle
4. /analyze sonucunda "Bu raporu uygularız" CTA'sı
```

Başlamak için sadece TODO.md'yi aç ve bu bölüme bakman yeterli — geri kalan tüm geçmiş referans olarak.

---

## 📋 Sprint 3 Kandidatları (Öncelik sırası ayarlanacak)

### A. Ödeme Akışı (Kritik — Gelir için)
- [ ] Stripe checkout flow canlı test (test kart ile)
- [ ] PayPal checkout flow canlı test
- [ ] Webhook handler'ların gerçek event'le test edilmesi
- [ ] Ödeme sonrası `runFullAnalysis` otomatik tetikleniyor mu doğrulama
- [ ] Başarısız ödeme senaryoları (iade, timeout, kart reddi)
- [ ] Fatura email template
- [ ] KDV/VAT hesabı (TR ↔ EU)

### B. Admin Paneli (İç kullanım — Operasyonel)
- [ ] Admin auth flow (zaten `requireAdmin` middleware var)
- [ ] Analiz listesi + arama + filtreleme
- [ ] Manual retry — başarısız analizi yeniden çalıştır
- [ ] Kullanıcı listesi + hesap detayı
- [ ] Site settings CMS (logo, smtp, fiyatlar)
- [ ] İstatistik dashboard (bugünün analizleri, Groq token maliyet takibi)
- [ ] Contact form mesajları yönetimi

### C. Monthly Delta / Karşılaştırma (geoserra-claude'da `geo-compare` skill'i var)
- [x] **Aynı domain'in 2 analizi arasındaki delta hesabı** (backend `/api/v1/analyze/compare` — 2026-04-18)
- [x] **Hangi kategori yükseldi/düştü (renk kodlu)** (frontend `/compare/[base]/[current]` + /hesabim GitCompare butonu)
- [ ] Action item tamamlama takibi ("geçen ay önerilen X, şu an var mı?")
- [ ] Müşteri aylık "ilerleme raporu" (ayrı PDF formatı)
- [ ] Cron: abonelik paketleri için otomatik aylık yeniden analiz

### D. Kullanıcı Dashboard (Hesabım Zenginleştirme)
- [ ] Tüm analizler — sırala/filtrele (domain, tarih, skor)
- [ ] Favori domainler
- [ ] Team workspace (birden fazla kullanıcı aynı domain ailesi için)
- [ ] API key yönetimi (B2B müşteri için programatik erişim)
- [ ] Kullanım limitleri (bu ay kaç analiz yaptın / paket kotan)

### E. Analiz Kalite İyileştirmeleri
- [ ] **Citability scorer'ı free tier'a da ekle** — şu an sadece paid'de
- [ ] **JS rendering (Playwright)** — SPA siteler için `has_ssr_content` false kalıyor
- [ ] **Yaprak sitemeleri** — homepage dışında 5-10 sayfa tarama (paid tier)
- [ ] **Rakip karşılaştırma** — kullanıcı 3 domain girsin, hepsini analiz et, yan yana göster
- [ ] **Historical tracking** — aynı domain'in skoru zamanla nasıl değişti grafiği

### F. Marketing / SEO / Büyüme
- [ ] Landing page A/B test altyapısı (GTM olay tetikleme)
- [ ] Blog içerik üretimi (zaten `/blog` var ama 1 yazı)
- [ ] Referral program (her yönlendirme için kredi)
- [ ] ProductHunt lansmanı hazırlığı
- [ ] OpenGraph image her analiz için dinamik üretim (skor görselli)

### G. Teknik Borçlar / Operasyonel
- [x] **Rate limiting** — `@fastify/rate-limit` zaten wire'lı, TR error mesajı + retry_after eklendi (2026-04-18)
- [x] **Analiz timeout management** — `runPythonScript` 60s timeout + SIGKILL (2026-04-18)
- [x] **Groq fallback** — Rule-based executive summary + tiered plan + findings (2026-04-18)
- [ ] **PM2 autostart** — VPS reboot sonrası otomatik başlatma doğrulaması
- [ ] **Backup stratejisi** — DB + `storage/reports/` günlük backup
- [ ] **Monitoring** — Uptime kontrolü + Telegram/Email alert (backend down, Groq kota dolmuş vs.)
- [ ] **Logs** — Structured logging (pino/winston), log aggregation

### H. Faz 3 — Eksik Python Scriptleri (Gerçek 6-Boyut)
Şu an bazı boyutlar heuristic — gerçek script'lerle daha doğru hale gelebilir:
- [ ] `eeat_analyzer.py` — Author/organization schema + bio content analizi
- [ ] `schema_validator.py` — JSON-LD validation + missing schema önerisi + generator
- [ ] `platform_analyzer.py` — Her AI platform için spesifik checklist puanlama
- [ ] `technical_analyzer.py` — Crawlability deep-dive (robots, indexability, SSR, JS dependency)

---

## 🐛 Bilinen Sorunlar / Gözlemler

- **LinkedIn testinde Groq sessiz fail oldu** (2026-04-18) — sadece 1 rule-based finding çıktı. Sebep bilinmiyor, muhtemelen prompt uzunluğu + LinkedIn'in anti-scraping önlemleri. İzlenmeli.
- **Schema score 0** — Site gerçekten JSON-LD içermese bile 0 yerine "tespit edilemedi" statüsü daha dürüst olur
- **Performance score'u normalize ederken** bazen `null` bazen `0` dönüyor — UI'da "—" vs "0" tutarsızlığı var

---

## 🔐 Environment Variables Referansı

Üretim için gerekli:

| Variable | Değer | Not |
|---|---|---|
| `GOOGLE_PSI_API_KEY` | ✅ Set | PageSpeed Insights |
| `GROQ_API_KEY` | ✅ Set | AI insights |
| `GROQ_MODEL` | `llama-3.3-70b-versatile` | |
| `GOOGLE_CLIENT_ID` | ✅ Set | OAuth |
| `STRIPE_SECRET_KEY` | ⚠️ Test mode olabilir | Canlı çekilmeden önce kontrol |
| `FREE_ANALYSIS_DOMAIN_LOCK` | `false` (şu an) | Prod'da `true` yapılacak |
| `NEXT_PUBLIC_GTM_ID` | ⚠️ Set değilse analitik yok | GTM container ID |

---

## 📊 Maliyet Takibi (Production Gidişi)

- Groq LLM: ~$0.004/rapor (3200 token ortalama, llama-3.3-70b)
- PSI API: Ücretsiz (25k/gün limit)
- Stripe: %2.9 + 0.30€
- PayPal: %3.4 + 0.35€
- VPS (paylaşımlı): guezelwebdesign ile birlikte

Ayda 1000 ücretli rapor = ~$4 LLM + %3-4 ödeme komisyonu.

---

## 📦 Son Commit Durumu

- Branch: `main`
- Son commit: `c1e1cd4` — "chore: gitignore .claude/"
- VPS senkron: ✅
- PM2 durumu: `geoserra-backend` (online), `geoserra-frontend` (online)

**Sprint içi eklenenler (2026-04-18):**
- `bdbdd3f` robustness: timeout + rate limit TR + Groq fallback
- `9546b1f` monthly delta / analysis comparison
- `7a7550f` pricing restructure: Basic $5 / Standart $15 / Premium $50
  - Örnek rapor paylaşımı (pricing + home + analyze)
  - Free tier: rule-based AI, $0 maliyet
  - 3-paket preview card in /analyze upsell
  - storage/assets/sample-report.pdf kalıcı

---

## 🔗 Referans Linkler

- **Canlı:** https://geoserra.com
- **API:** https://geoserra.com/api/v1
- **Örnek rapor (GitHub, iyi kalite):** https://geoserra.com/report/1a93e5d4-a8c7-4c2d-9008-97dd633c1452
- **Örnek PDF:** https://geoserra.com/api/v1/analyze/1a93e5d4-a8c7-4c2d-9008-97dd633c1452/download
- **Repo:** https://github.com/Orhanguezel/geoserra
- **Referans PDF (baştan beri hedef):** `geo-seo-claude/GEO-REPORT-guezelwebdesign.pdf`

---

*Son güncelleme: 2026-04-18 (Faz 2 tamamlandı, Sprint 3 planlaması bekliyor)*
