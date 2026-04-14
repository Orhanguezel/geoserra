export interface PackageDefinition {
  slug: 'starter' | 'pro' | 'expert';
  name: { tr: string; en: string };
  description: { tr: string; en: string };
  price_usd: number;
  price_usd_cents: number;
  features: { tr: string[]; en: string[] };
}

export const PACKAGES: Record<string, PackageDefinition> = {
  starter: {
    slug: 'starter',
    name: { tr: 'Başlangıç Rapor', en: 'Starter Report' },
    description: {
      tr: '8 kategori tam analiz, PDF rapor, 30 aksiyon maddesi',
      en: '8 category full analysis, PDF report, 30 action items',
    },
    price_usd: 29,
    price_usd_cents: 2900,
    features: {
      tr: [
        'Technical SEO tam analiz',
        'Performance & Core Web Vitals',
        'On-Page SEO kontrolü',
        'DNS / E-posta güvenlik (SPF, DMARC)',
        'Schema markup kontrolü',
        'AI crawler erişim analizi',
        '30+ aksiyon maddesi',
        'PDF rapor (e-posta ile)',
      ],
      en: [
        'Technical SEO full audit',
        'Performance & Core Web Vitals',
        'On-Page SEO check',
        'DNS / Email security (SPF, DMARC)',
        'Schema markup audit',
        'AI crawler access analysis',
        '30+ action items',
        'PDF report (via email)',
      ],
    },
  },
  pro: {
    slug: 'pro',
    name: { tr: 'Pro Rapor', en: 'Pro Report' },
    description: {
      tr: 'Starter + Schema JSON-LD oluşturma, AI visibility tam analiz',
      en: 'Starter + Schema JSON-LD generation, full AI visibility analysis',
    },
    price_usd: 59,
    price_usd_cents: 5900,
    features: {
      tr: [
        'Starter paketteki her şey',
        'AI Citability skoru',
        'Marka mention analizi',
        'Schema JSON-LD önerileri',
        'Keyword tutarlılık analizi',
        'llms.txt AI erişim analizi',
        'Rakip karşılaştırması (1 rakip)',
        'İçerik E-E-A-T değerlendirmesi',
      ],
      en: [
        'Everything in Starter',
        'AI Citability score',
        'Brand mention analysis',
        'Schema JSON-LD recommendations',
        'Keyword consistency analysis',
        'llms.txt AI access analysis',
        'Competitor comparison (1 competitor)',
        'Content E-E-A-T evaluation',
      ],
    },
  },
  expert: {
    slug: 'expert',
    name: { tr: 'Uzman Rapor', en: 'Expert Report' },
    description: {
      tr: 'Pro + 1 saatlik teknik implementasyon dahil',
      en: 'Pro + 1 hour technical implementation included',
    },
    price_usd: 99,
    price_usd_cents: 9900,
    features: {
      tr: [
        'Pro paketteki her şey',
        '1 saat teknik implementasyon',
        'robots.txt optimizasyonu',
        'Sitemap oluşturma/güncelleme',
        'Temel schema kurulumu',
        'Öncelikli destek (48 saat)',
      ],
      en: [
        'Everything in Pro',
        '1 hour technical implementation',
        'robots.txt optimization',
        'Sitemap creation/update',
        'Basic schema setup',
        'Priority support (48h)',
      ],
    },
  },
};
