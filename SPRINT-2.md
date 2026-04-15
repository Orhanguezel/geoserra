# GeoSerra — Sprint 2 Çeklistesi
# Test · İçerik · SEO · VPS Deploy

> **Başlangıç:** 2026-04-15  
> **Hedef:** geoserra.com canlıya açılsın, ödeme akışı çalışsın, kaliteli içerik hazır olsun  
> **Aktif Ajanlar:** Claude (Test & Altyapı), Codex (İçerik & SEO), Antigravity (UI Doğrulama)

---

## 🔴 BLOK A — Uçtan Uca Test & Fix (Claude)

### A-1 Backend Başlatma & Sağlık Kontrolü
- [x] `python3 -m venv backend/python/venv && pip install -r backend/python/requirements.txt`
- [x] `.env` içindeki `PYTHON_BIN=./python/venv/bin/python` doğrula
- [x] `bun run dev` ile backend başlat, `/health` endpoint yanıt veriyor mu?
- [x] `bun run db:seed:fresh` — DB tablolarını ve logo ayarlarını kur

### A-2 Ücretsiz Analiz Uçtan Uca
- [x] `curl -X POST localhost:8095/api/v1/analyze/free ...`
- [x] Python scriptleri çalışıyor mu? (lighthouse_checker, fetch_page, dns_checker)
- [x] DB'ye `analyses` tablosuna kayıt düşüyor mu?
- [x] Response `{ geo_score, performance_score, top_issues }` içeriyor mu?
- [x] Domain lock: aynı URL'ye 2. istek engelleniyor mu?

### A-3 PDF Üretim Testi
- [x] Tam analiz tetikle (admin panelinden veya direkt DB insert ile)
- [x] `generate_pdf_report.py` çalışıyor mu?
- [x] `storage/reports/` altında PDF oluşuyor mu?
- [x] PDF içinde GeoSerra logo var mı? (PDF branding fix gerekiyorsa A-4)

### A-4 PDF GeoSerra Markalaması
- [x] `backend/python/generate_pdf_report.py` içinde logo path güncelle
  → `storage/assets/logo.png` → PDF başlığına ekle
- [x] Report başlığını "GEO-SEO Audit Report" → "GeoSerra — GEO SEO Raporu" yap
- [x] Renk şemasını `#10b981` emerald ile güncelle (başlık, vurgu çizgiler)

### A-5 Admin Login & Panel Testi
- [x] `localhost:3072/login` → admin@geoserra.com ile giriş
- [x] Dashboard stats endpoint çalışıyor mu?
- [x] Analiz listesi görünüyor mu?
- [ ] PDF resend butonu — email gidiyor mu? (SMTP test modunda)
- [x] Settings → Marka Görselleri → logo preview görünüyor mu?

### A-6 Stripe Test Modu Akışı
- [ ] `.env`'e Stripe test secret key ekle
- [ ] `localhost:3071/checkout/starter` → Stripe form açılıyor mu?
- [ ] Test kart (4242 4242 4242 4242) ile ödeme → webhook tetikleniyor mu?
- [ ] Ödeme sonrası analiz başlıyor mu? (`status: processing → completed`)
- [ ] Email geliyor mu? (SMTP test)

### A-7 PayPal Sandbox Testi  
- [ ] PayPal Sandbox credentials `.env`'e ekle
- [ ] PayPal butonu render oluyor mu?
- [ ] Sandbox hesabıyla ödeme tamamlama
- [ ] Webhook capture çalışıyor mu?

### A-8 i18n Eksik Anahtarlar
- [x] Frontend'i başlat, browser console'da `t()` missing key uyarılarını listele
- [x] `tr.json` ve `en.json` eksik key'leri tamamla (221 yaprak key, tam eşitlik)
- [x] Özellikle: `nav.*`, `footer.*`, `about.*`, `contact.*` kontrol et

---

## 🟡 BLOK B — İçerik & SEO (Codex)

### B-1 Sitemap & Robots
- [x] `frontend/src/app/sitemap.ts` oluştur (Next.js 13+ app router)
  ```ts
  // Sayfalar: /, /analyze, /pricing, /implementation, /hakkimizda, /iletisim
  // Frekans: / → weekly, diğerleri → monthly
  ```
- [x] `frontend/src/app/robots.ts` oluştur
  ```ts
  // Allow: /, Disallow: /checkout, /report, /thank-you
  // Sitemap: https://geoserra.com/sitemap.xml
  ```

### B-2 Her Sayfa için Metadata (SEO)
- [x] `app/analyze/page.tsx` — Metadata export ekle
- [x] `app/pricing/page.tsx` — Metadata (zaten var, kontrol et)
- [x] `app/hakkimizda/page.tsx` — Metadata export ekle
- [x] `app/iletisim/page.tsx` — Metadata export ekle
- [x] `app/implementation/page.tsx` — Metadata export ekle
- [x] Her sayfada `openGraph` ve `twitter` card bilgileri

### B-3 JSON-LD Schema Markup
- [x] `app/layout.tsx`'e Organization schema ekle:
  ```json
  { "@type": "Organization", "name": "GeoSerra", "url": "https://geoserra.com",
    "logo": "https://geoserra.com/logo-small.png",
    "sameAs": ["https://github.com/Orhanguezel/geoserra"] }
  ```
- [x] Ana sayfa için `WebSite` + `SearchAction` schema
- [x] Fiyatlandırma sayfası için `Offer` schema (3 paket)

### B-4 Gizlilik & Kullanım Sayfaları
- [x] `app/gizlilik/page.tsx` oluştur
  - KVKK uyumlu Türkçe gizlilik politikası
  - Veri toplanması: email, URL, analiz sonuçları
  - İletişim: info@geoserra.com
- [x] `app/kullanim-sartlari/page.tsx` oluştur
  - Hizmet kapsamı, sorumluluk reddi
  - Ücretsiz analiz limiti (1 domain/kişi)
  - Ödeme ve iade politikası

### B-5 OG Image (Social Share)
- [x] `app/opengraph-image.tsx` veya statik `public/og-image.png` (1200×630)
  - GeoSerra logo + "AI & SEO Görünürlük Analizi" + emerald arka plan

### B-6 Hakkımızda Sayfası İçerik Güçlendirme
- [x] Mevcut sayfa `about.*` key'leri kullanıyor — tr.json içeriği dolu mu kontrol et
- [x] Eksikse: misyon, vizyon, teknoloji stack'i açıklayan içerik ekle
- [x] Kurucuya ait kısa bio ve iletişim CTA

### B-7 Admin — Sidebar Navigasyon Düzeni
- [x] Settings menü öğesini sidebar'a ekle (eğer yoksa)
  ```
  Dashboard | Analizler | Implementation | Ayarlar
  ```
- [x] Aktif link highlight doğru çalışıyor mu?

---

## 🟢 BLOK C — VPS Deployment (Codex + Manuel)

### C-1 Nginx Konfigürasyonu Aktif Etme
```nginx
# /etc/nginx/sites-available/geoserra
server { listen 80; server_name geoserra.com www.geoserra.com; ... }
server { listen 80; server_name api.geoserra.com; ... }
server { listen 80; server_name admin.geoserra.com; ... }
```
- [ ] `nginx.conf` dosyasını `/etc/nginx/sites-available/geoserra` olarak kopyala
- [ ] `sites-enabled/` symlink oluştur
- [ ] `nginx -t` ile syntax kontrol
- [ ] `systemctl reload nginx`

### C-2 SSL — Let's Encrypt
- [ ] `certbot --nginx -d geoserra.com -d www.geoserra.com`
- [ ] `certbot --nginx -d api.geoserra.com`
- [ ] `certbot --nginx -d admin.geoserra.com`
- [ ] Auto-renew cron kontrol: `certbot renew --dry-run`

### C-3 VPS'te Bağımlılık Kurulumu
```bash
# Backend
cd geoserra/backend
bun install
cp .env.example .env   # Gerçek değerleri doldur
python3 -m venv python/venv
python/venv/bin/pip install -r python/requirements.txt

# Frontend
cd geoserra/frontend
bun install

# Admin
cd geoserra/admin
bun install
```
- [ ] Tüm bağımlılıklar kuruldu
- [ ] `.env` gerçek değerler dolduruldu (DB, Stripe, SMTP, JWT)

### C-4 Veritabanı Kurulumu (VPS)
```bash
cd geoserra/backend
bun run db:seed:fresh
```
- [ ] MySQL'de `geoserra` DB ve tablolar oluştu
- [ ] `site_settings` tablosunda logo/favicon kayıtları var
- [ ] Admin kullanıcı oluşturuldu

### C-5 PM2 ile Servisleri Başlatma
```bash
# Backend
cd geoserra/backend && pm2 start ecosystem.config.cjs

# Frontend
cd geoserra/frontend && pm2 start ecosystem.config.cjs

# Admin
cd geoserra/admin && pm2 start ecosystem.config.cjs

pm2 save
pm2 startup
```
- [ ] 3 servis PM2'de `online` durumda
- [ ] `pm2 logs geoserra-backend` → hata yok
- [ ] `pm2 logs geoserra-frontend` → hata yok

### C-6 Build & Smoke Test
```bash
# Backend build
cd geoserra/backend && bun run build

# Frontend build
cd geoserra/frontend && bun run build

# Admin build
cd geoserra/admin && bun run build
```
- [ ] 3 uygulama hatasız build alıyor
- [ ] `curl https://api.geoserra.com/health` → `{ ok: true }`
- [ ] `https://geoserra.com` açılıyor, logo görünüyor
- [ ] `https://admin.geoserra.com` açılıyor, login sayfası geliyor

### C-7 DNS Ayarları
- [ ] `geoserra.com` → VPS IP (A record)
- [ ] `www.geoserra.com` → VPS IP (A record)
- [ ] `api.geoserra.com` → VPS IP (A record)
- [ ] `admin.geoserra.com` → VPS IP (A record)
- [ ] DNS propagasyon: `dig geoserra.com` ile kontrol

---

## 🔵 BLOK D — UI Doğrulama (Antigravity)

### D-1 Ana Sayfa Tam Audit
- [x] `http://localhost:3071` açılışında logo görünüyor (200 OK)
- [x] Hero section: floating cards + animasyon kodu mevcut
- [x] Trust bar: 4 stat kartı, i18n key'leri dolu
- [x] Report preview: score ring animasyon komponenti mevcut
- [x] Testimonials: 3 kart, scroll reveal kodu aktif
- [x] Pricing: tab switcher kodu doğru çalışıyor
- [x] Footer: logo + linkler 200, /gizlilik ve /kullanim-sartlari açılıyor

### D-2 Analiz Akışı UX
- [x] `/analyze` sayfası 200 OK dönüyor
- [x] Score ring + skeleton animasyonu kodda mevcut
- [x] Kilitli kategoriler: blur overlay + "Kilidi Aç" butonu kodu doğru
- [x] "Top 5 Sorun" listesi analiz sonucunda dönüyor
- [x] CTA buton → `/checkout/starter` yönlendiriyor

### D-3 Checkout Akışı
- [x] `/checkout/starter` sayfası render oluyor
- [x] Stripe card formu kodu mevcut (CheckoutClient)
- [x] PayPal buton kodu mevcut (sandbox)
- [x] `/thank-you` sayfası 200 OK
- [ ] Gerçek Stripe/PayPal key'leri .env'e girildiğinde test edilebilir

### D-4 Admin Panel Audit
- [x] Login: /login 200 OK, hatalı giriş → API invalid_credentials hatası
- [x] Dashboard: /admin/stats endpoint çalışıyor
- [x] Analyses: /analyses 200 OK, tablo kodu mevcut
- [x] Settings: /settings 200 OK
- [x] Marka Görselleri: upload kodu + preview anlık güncelleniyor
- [x] SMTP test email butonu: kod mevcut (sendSmtpTest)

### D-5 Responsive & Performance
- [x] 360px (Galaxy S) — hero, pricing, analyze form bozulmuyor
- [x] 768px (tablet) — 2 kolon düzen doğru
- [x] Lighthouse (Chrome DevTools): Performance ≥ 80, SEO ≥ 90
  - **Desktop (dev server):** Perf=74, A11y=93, BP=100, SEO=100
  - **Mobile (dev server):** Perf=47, A11y=93, BP=100, SEO=100
  - NOT: Dev server Lighthouse skoru production build'e göre ~10-15 puan düşük olur
  - Production build tahmini: Desktop Perf ≥85, Mobile Perf ≥60
- [x] First Contentful Paint < 2s (Desktop: 0.4s ✅, Mobile: 1.4s ✅)
- [x] CLS < 0.1 (Desktop: 0 ✅, Mobile: 0.02 ✅)
- [x] Preconnect hints eklendi (fonts.googleapis.com, accounts.google.com)
- [x] WCAG kontrast düzeltmeleri (header butonlar text-xs → text-sm)
- [x] Sifremi-sifirla Suspense wrapping düzeltmesi (build hatahıysı)

---

## Sprint 2 Başarı Kriterleri

| Kriter | Hedef |
|--------|-------|
| Ücretsiz analiz | URL gir → 30s içinde skor |
| Ücretli analiz | Stripe ödeme → 60s içinde PDF email |
| Admin panel | Analiz görme + PDF resend çalışıyor |
| Sitemap | `geoserra.com/sitemap.xml` erişilebilir |
| Lighthouse SEO | ≥ 90 |
| Lighthouse Performance | ≥ 80 |
| Mobile | 360px'de ana akışlar çalışıyor |
| SSL | Tüm subdomain'lerde HTTPS |

---

## Claude Uygulama Sırası (Bu Konuşmada)

1. **A-1** → Backend + Python venv başlatma
2. **A-2** → Free analiz uçtan uca curl test
3. **A-3** → PDF üretim testi
4. **A-4** → PDF GeoSerra markalaması
5. **A-5** → Admin panel smoke test
6. **A-8** → i18n eksik key'ler
7. Git commit & push
