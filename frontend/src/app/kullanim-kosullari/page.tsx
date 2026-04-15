import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kullanım Koşulları — GeoSerra',
  description: 'GeoSerra platformuna ait kullanım koşulları ve hizmet sözleşmesi.',
};

export default function TermsPage() {
  return (
    <div className="container py-16 max-w-3xl">
      <h1 className="mb-2 text-3xl font-bold text-foreground">Kullanım Koşulları</h1>
      <p className="mb-10 text-sm text-muted-foreground">Son güncelleme: Nisan 2026</p>

      <div className="prose prose-invert max-w-none space-y-8 text-muted-foreground">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">1. Hizmetin Tanımı</h2>
          <p>GeoSerra, web sitelerinin yapay zeka görünürlüğünü (GEO) ve arama motoru optimizasyonunu (SEO) analiz eden bir SaaS platformudur. Platform; ChatGPT, Gemini ve Perplexity gibi AI motorlarındaki görünürlüğü ölçer, Lighthouse performans skorları üretir ve uygulanabilir öneriler sunar.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">2. Hesap Sorumlulukları</h2>
          <p>Hesabınızın güvenliğinden siz sorumlusunuz. Şifrenizi kimseyle paylaşmayın. GeoSerra, yetkisiz erişimden kaynaklanan zararlardan sorumlu tutulamaz.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">3. Ödeme ve İptal</h2>
          <p>Ücretli planlar aylık veya yıllık olarak faturalandırılır. İptal işlemi mevcut dönem sonunda geçerli olur. Kısmi iade yapılmaz.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">4. Kullanım Sınırları</h2>
          <p>Ücretsiz plan ayda 3 analiz hakkı içerir. Starter plan 50, Pro plan 200, Expert plan sınırsız analiz hakkı sunar. Platform, spam veya kötüye kullanım amacıyla kullanılamaz.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">5. Fikri Mülkiyet</h2>
          <p>GeoSerra'nın yazılımı, tasarımı ve içerikleri telif hakkı ile korunmaktadır. Analiz raporları size aittir; ancak platform altyapısı kopyalanamaz veya tersine mühendislik uygulanamaz.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">6. Sorumluluk Sınırı</h2>
          <p>GeoSerra, analiz sonuçlarının doğruluğunu garanti etmez. Platform "olduğu gibi" sunulmaktadır. Herhangi bir kayıp veya zarardan GeoSerra sorumlu tutulamaz.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">7. İletişim</h2>
          <p>Sorularınız için: <a href="mailto:info@geoserra.com" className="text-primary hover:underline">info@geoserra.com</a></p>
        </section>
      </div>
    </div>
  );
}
