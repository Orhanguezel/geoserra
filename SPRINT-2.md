# GeoSerra — Sprint 2 Çeklistesi
# Test · İçerik · SEO · VPS Deploy

> **Başlangıç:** 2026-04-15  
> **Hedef:** geoserra.com canlıya açılsın, ödeme akışı çalışsın, kaliteli içerik hazır olsun  
> **Aktif Ajanlar:** Claude (Test & Altyapı), Codex (İçerik & SEO), Antigravity (UI Doğrulama)

---

## 🔴 BLOK A — Uçtan Uca Test & Fix (Claude)

### A-1 Backend Başlatma & Sağlık Kontrolü
- [ ] `python3 -m venv backend/python/venv && pip install -r backend/python/requirements.txt`
- [ ] `.env` içindeki `PYTHON_BIN=./python/venv/bin/python` doğrula
- [ ] `bun run dev` ile backend başlat, `/health` endpoint yanıt veriyor mu?
- [ ] `bun run db:seed:fresh` — DB tablolarını ve logo ayarlarını kur

### A-2 Ücretsiz Analiz Uçtan Uca
- [ ] `curl -X POST localhost:8095/api/v1/analyze/free -H "Content-Type: application/json" -d '{"url":"https://geoserra.com","email":"test@test.com"}'`
- [ ] Python scriptleri çalışıyor mu? (lighthouse_checker, fetch_page, dns_checker)
- [ ] DB'ye `analyses` tablosuna kayıt düşüyor mu?
- [ ] Response `{ geo_score, performance_score, top_issues }` içeriyor mu?
- [ ] Domain lock: aynı URL'ye 2. istek engelleniyor mu?

### A-3 PDF Üretim Testi
- [ ] Tam analiz tetikle (admin panelinden veya direkt DB insert ile)
- [ ] `generate_pdf_report.py` çalışıyor mu?
- [ ] `storage/reports/` altında PDF oluşuyor mu?
- [ ] PDF içinde GeoSerra logo var mı? (PDF branding fix gerekiyorsa A-4)

### A-4 PDF GeoSerra Markalaması
- [ ] `backend/python/generate_pdf_report.py` içinde logo path güncelle
  → `storage/assets/logo.png` → PDF başlığına ekle
- [ ] Report başlığını "GEO-SEO Audit Report" → "GeoSerra — GEO SEO Raporu" yap
- [ ] Renk şemasını `#10b981` emerald ile güncelle (başlık, vurgu çizgiler)

### A-5 Admin Login & Panel Testi
- [ ] `localhost:3072/login` → admin@geoserra.com ile giriş
- [ ] Dashboard stats endpoint çalışıyor mu?
- [ ] Analiz listesi görünüyor mu?
- [ ] PDF resend butonu — email gidiyor mu? (SMTP test modunda)
- [ ] Settings → Marka Görselleri → logo preview görünüyor mu?

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
- [ ] Frontend'i başlat, browser console'da `t()` missing key uyarılarını listele
- [ ] `tr.json` ve `en.json` eksik key'leri tamamla
- [ ] Özellikle: `nav.*`, `footer.*`, `about.*`, `contact.*` kontrol et

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
- [ ] `https://geoserra.com` açılışında gecikmesiz logo görünüyor mu?
- [ ] Hero section: floating metric cards hizalı, animasyonlar çalışıyor
- [ ] Trust bar rakamları okunuyor, mobilde tek satır mı?
- [ ] Report preview: score ring animasyonu çalışıyor mu?
- [ ] Testimonials: scroll reveal animation tetikleniyor mu?
- [ ] Pricing: tab switcher (Tek Seferlik / Aylık) geçişi akıcı mı?
- [ ] Footer: logo + linkler düzgün, gizlilik/kullanım sayfaları açılıyor mu?

### D-2 Analiz Akışı UX
- [ ] `/analyze` → URL gir → yükleniyor skeleton → skor kartları animasyonlu açılıyor
- [ ] Score ring sayaç animasyonu (0'dan skora doğru)
- [ ] Kilitli kategoriler: blur overlay + "Kilidi Aç" butonu tıklanabilir
- [ ] "Top 5 Sorun" listesi okunuyor
- [ ] CTA buton → `/checkout/starter` yönlendirir

### D-3 Checkout Akışı
- [ ] `/checkout/starter` → Stripe card elementi yükleniyor
- [ ] PayPal butonu render oluyor
- [ ] Hata durumu: geçersiz kart mesajı görünüyor
- [ ] Başarılı ödeme → `/thank-you` sayfasına yönlendirme

### D-4 Admin Panel Audit
- [ ] Login: hatalı giriş → hata mesajı
- [ ] Dashboard: stat kartları yükleniyor (skeleton sonra veri)
- [ ] Analyses tablosu: pagination çalışıyor
- [ ] Settings > Marka Görselleri: 3 logo önizleme görünüyor
- [ ] Upload: yeni logo seç → preview anında güncelleniyor

### D-5 Responsive & Performance
- [ ] 360px (Galaxy S) — hero, pricing, analyze form bozulmuyor
- [ ] 768px (tablet) — 2 kolon düzeni doğru
- [ ] Lighthouse (Chrome DevTools): Performance ≥ 80, SEO ≥ 90
- [ ] First Contentful Paint < 2s
- [ ] CLS < 0.1 (logo/font yüklenmesinde layout kayması yok mu?)

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
