import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kullanım Şartları — GeoSerra',
  description: 'GeoSerra hizmet kapsamı, ücretsiz analiz limiti, ödeme ve iade şartları.',
};

export default function TermsPage() {
  return (
    <main className="min-h-screen py-20 md:py-28">
      <div className="container max-w-3xl">
        <div className="rounded-3xl border border-border bg-card p-8 md:p-10">
          <h1 className="text-3xl font-bold text-white">Kullanım Şartları</h1>
          <div className="mt-8 space-y-8 text-sm leading-7 text-muted-foreground">
            <section>
              <h2 className="mb-2 text-lg font-semibold text-cyan-400">Hizmet Kapsamı</h2>
              <p>GeoSerra, web siteleri için GEO, SEO, performans ve AI görünürlük odaklı analiz raporları sunar. Hizmet çıktıları bilgilendirme amaçlıdır.</p>
            </section>
            <section>
              <h2 className="mb-2 text-lg font-semibold text-cyan-400">Ücretsiz Analiz Limiti</h2>
              <p>Ücretsiz analiz özelliği aynı domain için sınırlıdır. Sistem kötüye kullanım tespit ettiğinde yeni ücretsiz analiz taleplerini reddedebilir.</p>
            </section>
            <section>
              <h2 className="mb-2 text-lg font-semibold text-cyan-400">Ödeme & İade</h2>
              <p>Ücretli raporlar ödeme onayından sonra işleme alınır. Dijital hizmet niteliği nedeniyle rapor oluşturulduktan sonra iade değerlendirmesi vaka bazlı yapılır.</p>
            </section>
            <section>
              <h2 className="mb-2 text-lg font-semibold text-cyan-400">Sorumluluk Reddi</h2>
              <p>GeoSerra raporları tavsiye ve önceliklendirme içerir. Tüm uygulama kararları kullanıcı veya hizmeti uygulayan ekip tarafından verilir. Üçüncü taraf platform sonuçları zaman içinde değişebilir.</p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
