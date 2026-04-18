export interface PackageDefinition {
  slug: 'starter' | 'pro' | 'expert';
  name: { tr: string; en: string };
  description: { tr: string; en: string };
  price_usd: number;
  price_usd_cents: number;
  features: { tr: string[]; en: string[] };
}

/**
 * GeoSerra Analiz Paketleri
 *
 * Felsefe:
 *   - Free tier (`runFreeAnalysis`): Tüm analizler çalışır, rule-based skor,
 *     Groq AI YOK, PDF YOK. Domain başına 30 gün lock.
 *   - Basic ($5):    Free + PDF + AI-nüanslı findings + executive summary
 *   - Standart ($15): Basic + Schema JSON-LD generation + Delta compare + öncelikli e-mail
 *   - Premium ($50): Standart + rakip analizi + llms.txt gen + 24h destek + aylık 1 re-scan
 *
 * NOT: DB slug'ları (starter/pro/expert) korundu, breaking change yok.
 * Sadece fiyat ve özellikler güncellendi.
 */
export const PACKAGES: Record<string, PackageDefinition> = {
  starter: {
    slug: 'starter',
    name: { tr: 'Basic Rapor', en: 'Basic Report' },
    description: {
      tr: 'PDF rapor + AI-nüanslı bulgular + tam 6 boyutlu analiz',
      en: 'PDF report + AI-enhanced findings + full 6-dimensional analysis',
    },
    price_usd: 5,
    price_usd_cents: 500,
    features: {
      tr: [
        'Tüm 6 boyut skor analizi',
        'AI-nüanslı bulgu açıklamaları (Groq LLM)',
        'Executive summary (size özel paragraf)',
        'Quick wins + medium-term aksiyon planı',
        'AI crawler erişim tablosu (14 bot)',
        '5 AI platform readiness skoru',
        'PDF indirme (e-mail ile gönderim)',
      ],
      en: [
        'All 6 dimensional score analysis',
        'AI-enhanced finding descriptions (Groq LLM)',
        'Executive summary (tailored paragraph)',
        'Quick wins + medium-term action plan',
        'AI crawler access table (14 bots)',
        '5 AI platform readiness scores',
        'PDF download (sent via email)',
      ],
    },
  },
  pro: {
    slug: 'pro',
    name: { tr: 'Standart Rapor', en: 'Standard Report' },
    description: {
      tr: 'Basic + Schema üretimi + Delta karşılaştırma — En çok tercih edilen',
      en: 'Basic + Schema generation + Delta comparison — Most popular',
    },
    price_usd: 15,
    price_usd_cents: 1500,
    features: {
      tr: [
        'Basic pakette olan her şey',
        'Hazır JSON-LD Schema markup kodu (Organization + Person + WebSite)',
        'Strategic initiatives (3. katman aksiyon planı)',
        'Delta karşılaştırma — önceki analizle farkı göster',
        'Keyword tutarlılık analizi (title/meta/H1/body)',
        'llms.txt varlık kontrolü + öneri',
        'Öncelikli e-mail destek (72 saat)',
      ],
      en: [
        'Everything in Basic',
        'Ready-to-use JSON-LD Schema markup code (Organization + Person + WebSite)',
        'Strategic initiatives (3rd-tier action plan)',
        'Delta comparison — show diff with previous analysis',
        'Keyword consistency analysis (title/meta/H1/body)',
        'llms.txt presence check + recommendation',
        'Priority email support (72h)',
      ],
    },
  },
  expert: {
    slug: 'expert',
    name: { tr: 'Premium Rapor', en: 'Premium Report' },
    description: {
      tr: 'Standart + Rakip analizi + llms.txt üretimi + Aylık 1 ücretsiz re-scan',
      en: 'Standard + Competitor analysis + llms.txt generation + 1 free re-scan per month',
    },
    price_usd: 50,
    price_usd_cents: 5000,
    features: {
      tr: [
        'Standart pakette olan her şey',
        '1 rakip karşılaştırması (yan yana skor tablosu)',
        'Hazır llms.txt dosyası (kendi siteniz için üretilir)',
        'İçerik E-E-A-T derinlemesine değerlendirme',
        'Aylık 1 ücretsiz yeniden analiz (delta raporu ile)',
        'Öncelikli destek (24 saat — e-mail + slack)',
        'Rapor özelleştirme talebi (+1 alan eklenebilir)',
      ],
      en: [
        'Everything in Standard',
        '1 competitor comparison (side-by-side score table)',
        'Ready-to-use llms.txt file (generated for your site)',
        'Content E-E-A-T in-depth evaluation',
        '1 free re-analysis per month (with delta report)',
        'Priority support (24h — email + slack)',
        'Custom field request (+1 field can be added)',
      ],
    },
  },
};
