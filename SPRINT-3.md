# GeoSerra — Sprint 3 Çeklistesi
# UI Polish · Ödeme · VPS Deploy · İçerik

> **Başlangıç:** 2026-04-15
> **Hedef:** Canlı deploy + ödeme akışı + UI tam kaliteli
> **Not:** Codex token limiti doldu. Sprint 2 Blok B işleri Claude'a devredildi.

---

## ✅ TAMAMLANDI (Sprint 1 + Sprint 2)

### Backend
- [x] Fastify 5 backend port 8095
- [x] MySQL DB + seed (6 tablo: auth, analyses, impl_requests, currency_rates, site_settings, oauth_providers)
- [x] JWT auth (login, signup, refresh, me, logout)
- [x] Google OAuth `/auth/google` — tokeninfo verify, oauth_providers tablosu
- [x] Free analiz endpoint `/analyze/free`
- [x] Python scriptleri (lighthouse, fetch, dns, pdf)
- [x] PDF GeoSerra markalaması (emerald palette, logo)
- [x] `/assets/` statik servis (logo, favicon)
- [x] Site settings DB + admin routes

### Frontend
- [x] Next.js 16 — tüm sayfalar
- [x] Transparent logo (arka plan kaldırıldı, trim edildi)
- [x] Header: nav + UserMenu (giriş/çıkış) + ThemeSwitcher + LanguageDropdown
- [x] Dark/Light mode (next-themes, CSS variables)
- [x] Dil dropdown — browser otomatik algılama + TR default
- [x] `/giris` — Google + e-posta giriş
- [x] `/kayit` — Google + e-posta kayıt + şifre güç göstergesi
- [x] `/hesabim` — profil sayfası (giriş korumalı)
- [x] Zustand auth store (persist, refreshMe, logout)
- [x] sitemap.ts + robots.ts
- [x] /gizlilik sayfası
- [x] /kullanim-kosullari sayfası
- [x] OG image 1200x630
- [x] i18n tr.json + en.json (221 key eşit)
- [x] Admin panel settings → marka görselleri upload

---

## 🔴 BLOK A — UI Eksikleri & Kalite (Claude — Öncelik)

### A-1 Light Mode Component Audit
- [x] `hero-section.tsx` — hardcoded `bg-[#06090f]` → `bg-background`
- [x] `pricing-section.tsx` — hardcoded dark renkler → CSS variables
- [x] `footer.tsx` — hardcoded dark → CSS variables
- [x] Login/register sayfaları — `bg-[#06090f]` / `bg-[#0f1420]` → CSS variables
- [x] `/hesabim` account-client — hardcoded dark renkler

### A-2 `/hesabim` — Geçmiş Analizler
- [x] `GET /api/v1/analyses/mine` backend endpoint (kullanıcıya ait analizler)
- [x] Frontend'de analiz listesi tablosu (URL, tarih, GEO skoru, durum, PDF link)

### A-3 E-posta Şifre Sıfırlama
- [x] Backend: `POST /auth/forgot-password` → token üret → email gönder
- [x] Backend: `POST /auth/reset-password` → token doğrula → şifre güncelle
- [x] Frontend: `/sifremi-unuttum` sayfası
- [x] Frontend: `/sifremi-sifirla?token=xxx` sayfası

---

## 🟡 BLOK B — Ödeme Entegrasyonu

### B-1 Stripe
- [ ] `.env`'e Stripe test key ekle (`STRIPE_SECRET_KEY=sk_test_...`)
- [ ] Checkout sayfası açılıyor mu? (`/checkout/starter`)
- [ ] Test kart 4242 4242 4242 4242 → webhook → analiz başlıyor mu?
- [ ] Başarı sayfası `/thank-you` çalışıyor mu?

### B-2 PayPal Sandbox
- [ ] PayPal sandbox credentials `.env`'e ekle
- [x] PayPal credentials eklendi (konigsmassage)
- [x] Webhook handler mevcut (payments/router.ts)

### B-3 E-posta Bildirimleri
- [x] SMTP: smtp.hostinger.com (guezelwebdesign credentials)
- [x] Ödeme başarısı → email (sendPaymentSuccessEmail)
- [x] Analiz tamamlandı → email (sendAnalysisCompleteEmail)
- [x] Kayıt → hoş geldin email (shared-backend signup hook)

---

## 🟢 BLOK C — VPS Deploy

### C-1 Hazırlık
- [x] `GOOGLE_CLIENT_ID` — backend/.env ve frontend/.env.local/production'a eklendi
- [ ] Backend `.env` production değerleri — JWT_SECRET + DB credentials VPS'te set edilmeli
- [x] Frontend `.env.production` oluşturuldu (`NEXT_PUBLIC_API_URL=https://geoserra.com/api`)
- [x] Admin `.env.production` oluşturuldu (`NEXT_PUBLIC_API_URL=https://api.geoserra.com`)
- [ ] SSL sertifikası (Let's Encrypt / Cloudflare) — VPS'te

### C-2 Nginx
- [x] `/api/*` → backend:8095 proxy (api.geoserra.com subdomain)
- [x] `/assets/*` → backend:8095 proxy (+ 30d cache, immutable)
- [x] `/reports/*` → backend:8095 proxy
- [x] Frontend → Next.js:3071 proxy
- [x] Admin → Next.js:3072 proxy
- [x] HTTPS redirect

### C-3 PM2
- [x] `ecosystem.config.js` oluştur (backend + frontend + admin)
- [ ] `pm2 start ecosystem.config.js`
- [ ] `pm2 save && pm2 startup`

### C-4 Python Ortamı (VPS)
- [ ] `setup-python.sh` çalıştır
- [ ] `PYTHON_BIN=./python/venv/bin/python` `.env`'de
- [ ] `logo-small.png` `backend/python/` altında var mı?

---

## 🔵 BLOK D — İçerik & SEO Son Kontrol

### D-1 Metadata Kontrolü
- [x] Her sayfa `<title>` ve `description` doğru (8 sayfa doğrulandı)
- [x] OG image layout.tsx metadata images alanına eklendi (`/og-image.png`)
- [x] pricing, analyze, hakkimizda, iletisim sayfaları OG image aldı
- [x] `sitemap.xml` erişilebilir — 8 URL, tüm sayfalar var
- [x] `robots.txt` doğru — AI botlara Allow, /checkout /report /api Disallow

### D-2 JSON-LD Schema
- [x] Organization + WebSite + SearchAction schema layout.tsx içinde
- [x] FAQPage schema pricing sayfasına eklendi (5 soru-cevap)
- [x] Offer/ItemList schema pricing sayfasında (Starter/Pro/Expert)

### D-3 Admin Panel
- [x] Sidebar: Dashboard / Analizler / Implementation / Ayarlar — hepsi 200
- [x] Analiz listesi /analyses endpoint ile doluyor
- [x] Admin settings → SMTP test gönder butonu kodu mevcut (sendSmtpTest)
- [x] Backend: `POST /admin/site-settings/test-email` endpoint eklendi

---

## Öncelik Sırası

1. **A-1** Light mode audit (bugün)
2. **C-1 + C-2** VPS hazırlık (GOOGLE_CLIENT_ID alınca)
3. **B-1** Stripe test
4. **A-2** /hesabim analizler
5. **C-3** PM2 + deploy

