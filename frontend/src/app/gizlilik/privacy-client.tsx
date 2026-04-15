'use client';

import { t } from '@/lib/t';
import { useLocaleStore } from '@/stores/locale-store';

export function PrivacyClient() {
  const locale = useLocaleStore((s) => s.locale);

  const sections = [
    { key: 's1', color: 'text-emerald-400' },
    { key: 's2', color: 'text-emerald-400' },
    { key: 's3', color: 'text-emerald-400' },
    { key: 's4', color: 'text-emerald-400' },
    { key: 's5', color: 'text-emerald-400' },
  ] as const;

  return (
    <main className="min-h-screen py-20 md:py-28">
      <div className="container max-w-3xl">
        <div className="rounded-3xl border border-border bg-card p-8 md:p-10">
          <h1 className="text-3xl font-bold text-foreground">{t('privacy.title', {}, locale)}</h1>
          <p className="mt-1 text-xs text-muted-foreground">{t('privacy.last_updated', {}, locale)}</p>
          <div className="mt-8 space-y-8 text-sm leading-7 text-muted-foreground">
            {sections.map(({ key, color }) => (
              <section key={key}>
                <h2 className={`mb-2 text-lg font-semibold ${color}`}>
                  {t(`privacy.${key}_title`, {}, locale)}
                </h2>
                <p>{t(`privacy.${key}_text`, {}, locale)}</p>
              </section>
            ))}
            <section>
              <h2 className="mb-2 text-lg font-semibold text-emerald-400">
                {t('privacy.s6_title', {}, locale)}
              </h2>
              <p>
                {t('privacy.s6_text', {}, locale)}{' '}
                <a className="text-primary hover:underline" href="mailto:info@geoserra.com">
                  {t('privacy.s6_email', {}, locale)}
                </a>
                {t('privacy.s6_suffix', {}, locale) && (
                  <>{' '}{t('privacy.s6_suffix', {}, locale)}</>
                )}
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
