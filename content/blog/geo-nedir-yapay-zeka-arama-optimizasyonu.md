---
title: "GEO Nedir? Yapay Zeka Arama Motorları için SEO"
description: "Generative Engine Optimization (GEO), ChatGPT, Gemini ve Perplexity gibi AI arama motorlarında görünürlük kazanmak için uygulanan optimizasyon sürecidir. Klasik SEO'dan farkları ve nasıl uygulanacağı."
date: "2026-04-15"
author: "Orhan Güzel"
authorUrl: "https://github.com/Orhanguezel"
category: "GEO Rehberi"
tags: ["GEO", "AI arama", "ChatGPT SEO", "Perplexity", "generative engine optimization"]
slug: "geo-nedir-yapay-zeka-arama-optimizasyonu"
image: "/og-image.png"
readTime: "6 dk"
---

## GEO (Generative Engine Optimization) Nedir?

Generative Engine Optimization — kısaca **GEO** — web sitelerinin ChatGPT, Google Gemini, Perplexity AI ve Bing Copilot gibi yapay zeka destekli arama motorlarında **alıntılanabilir** hale getirilmesi sürecidir.

Klasik SEO, Google'ın 10 mavi link sıralamasını hedefler. GEO ise farklı bir soruyu yanıtlar: "Bir AI modeli, kullanıcıya sorum yanıt üretirken benim içeriğimi kaynak olarak gösterir mi?"

## Klasik SEO ile GEO Arasındaki Fark

| Özellik | Klasik SEO | GEO |
|---------|-----------|-----|
| Hedef | Google sıralaması | AI alıntılanması |
| Temel sinyal | Backlink, keyword | E-E-A-T, schema, citability |
| Ölçüm | Sıralama pozisyonu | AI görünürlük skoru |
| İçerik formatı | Keyword odaklı | Soru-cevap, yapılandırılmış |
| Teknik gereksinim | sitemap, robots.txt | llms.txt, JSON-LD, HSTS |

## Neden GEO Artık Zorunlu?

2025 itibarıyla Google aramalarının **%30'u** AI Overviews ile başlıyor. ChatGPT'nin aylık aktif kullanıcı sayısı 200 milyonu geçti. Perplexity günlük milyonlarca arama işliyor.

Bu sistemlerin ortak özelliği: Web sayfalarından içerik derleyip özetliyor. Siteniz bu sistemlerin "güvenilir kaynak" olarak gördüğü kriterleri karşılamıyorsa, rakipleriniz alıntılanırken siz görünmez kalırsınız.

## GEO'nun Altı Temel Bileşeni

### 1. AI Citability (Alıntılanabilirlik)
`llms.txt` dosyası oluşturun — AI tarayıcılara siteniz hakkında yapılandırılmış bilgi sunar. `robots.txt` ile GPTBot, ClaudeBot ve PerplexityBot'a erişim izni verin.

### 2. Brand Authority Signals
Schema.org `Organization` markup'ına `sameAs` bağlantıları ekleyin: LinkedIn, GitHub, YouTube, X/Twitter. Wikipedia'da marka sayfası oluşturmak yüksek puan sağlar.

### 3. Content Quality & E-E-A-T
Google'ın E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) kriterleri AI sistemleri için de geçerli. Yazar bilgisi, `Person` schema, gerçek müşteri deneyimleri içeriğinizi öne çıkarır.

### 4. Technical Foundations
TTFB 200ms altında, LCP 2.5s altında, CLS 0.1 altında olmalı. HSTS, CSP ve Permissions-Policy header'ları güvenlik sinyali olarak değerlendirilir.

### 5. Structured Data
`FAQPage`, `Product`, `Organization`, `Article`, `BreadcrumbList` JSON-LD schema'ları AI sistemlerinin içeriği doğru kategorize etmesini sağlar.

### 6. Platform Optimization
Canonical URL, hreflang, sitemap.xml ve robots.txt tutarlı olmalı. `llms.txt` dosyası standart haline gelmekte olan yeni bir sinyal.

## GEO Skoru Nasıl Hesaplanır?

GeoSerra, altı kategorinin ağırlıklı ortalamasıyla 0-100 arası bir GEO skoru üretir:

- **AI Citability:** %25
- **Brand Authority:** %20
- **E-E-A-T:** %20
- **Technical:** %15
- **Structured Data:** %10
- **Platform:** %10

Sektör ortalaması 45-55 bandında. 75+ skor, AI sistemlerinde düzenli alıntılanma için yeterli bir eşik.

## GEO Optimizasyonuna Nereden Başlamalı?

1. **llms.txt oluşturun** — sitenizin `/llms.txt` adresinde brand tanımı ve önemli URL'ler bulunmalı
2. **Organization schema ekleyin** — sameAs dizisiyle sosyal varlıklarınızı bağlayın
3. **H1 ve başlıkları soruya göre yazın** — "GEO nedir?" gibi doğrudan soru formatı alıntılanma oranını artırır
4. **FAQPage JSON-LD ekleyin** — AI sistemleri bu format'ı doğrudan kullanır
5. **Teknik temeli güçlendirin** — Lighthouse 90+ performans skoru hedefleyin

[GeoSerra ile ücretsiz GEO analizinizi yapın](/analyze) — 2 dakikada sitenizin mevcut GEO skoru ve öncelikli iyileştirme önerileri.

---

*Bu makale GeoSerra ekibi tarafından hazırlanmıştır. Yazar: [Orhan Güzel](https://github.com/Orhanguezel)*
