import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gizlilik Politikası — GeoSerra',
  description: 'GeoSerra gizlilik politikası, toplanan veriler, kullanım amacı ve KVKK hakları.',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen py-20 md:py-28">
      <div className="container max-w-3xl">
        <div className="rounded-3xl border border-border bg-card p-8 md:p-10">
          <h1 className="text-3xl font-bold text-white">Gizlilik Politikası</h1>
          <div className="mt-8 space-y-8 text-sm leading-7 text-muted-foreground">
            <section>
              <h2 className="mb-2 text-lg font-semibold text-emerald-400">Toplanan Veriler</h2>
              <p>GeoSerra; analiz talebi sırasında URL, e-posta adresi, ödeme bilgilerine ait işlem referansları ve oluşturulan analiz sonuçlarını işler.</p>
            </section>
            <section>
              <h2 className="mb-2 text-lg font-semibold text-emerald-400">Kullanım Amacı</h2>
              <p>Toplanan veriler ücretsiz veya ücretli GEO SEO analizinin sunulması, PDF rapor oluşturulması, destek süreçlerinin yürütülmesi ve hizmet kalitesinin artırılması amacıyla kullanılır.</p>
            </section>
            <section>
              <h2 className="mb-2 text-lg font-semibold text-emerald-400">Veri Güvenliği</h2>
              <p>Veriler erişim kontrolü, sunucu güvenliği ve üçüncü taraf ödeme altyapıları üzerinden korunur. Kart verileri doğrudan GeoSerra sunucularında tutulmaz.</p>
            </section>
            <section>
              <h2 className="mb-2 text-lg font-semibold text-emerald-400">KVKK Hakları</h2>
              <p>Kullanıcılar kişisel verilerine erişme, düzeltme, silme ve işleme amacına itiraz etme haklarına sahiptir. Bu talepler destek kanalımız üzerinden değerlendirilebilir.</p>
            </section>
            <section>
              <h2 className="mb-2 text-lg font-semibold text-emerald-400">İletişim</h2>
              <p>Gizlilik ile ilgili tüm talepler için <a className="text-primary hover:underline" href="mailto:info@geoserra.com">info@geoserra.com</a> adresi üzerinden bizimle iletişime geçebilirsiniz.</p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
