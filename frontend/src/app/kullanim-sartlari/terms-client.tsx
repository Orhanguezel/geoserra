'use client';

import { t } from '@/lib/t';
import { useLocaleStore } from '@/stores/locale-store';

export function TermsClient() {
  const locale = useLocaleStore((s) => s.locale);

  const sections = [
    { key: 's1', color: 'text-cyan-400' },
    { key: 's2', color: 'text-cyan-400' },
    { key: 's3', color: 'text-cyan-400' },
    { key: 's4', color: 'text-cyan-400' },
    { key: 's5', color: 'text-cyan-400' },
    { key: 's6', color: 'text-cyan-400' },
  ] as const;

  return (
    <main className="min-h-screen py-20 md:py-28">
      <div className="container max-w-3xl">
        <div className="rounded-3xl border border-border bg-card p-8 md:p-10">
          <h1 className="text-3xl font-bold text-foreground">{t('terms.title', {}, locale)}</h1>
          <p className="mt-1 text-xs text-muted-foreground">{t('terms.last_updated', {}, locale)}</p>
          <div className="mt-8 space-y-8 text-sm leading-7 text-muted-foreground">
            {sections.map(({ key, color }) => (
              <section key={key}>
                <h2 className={`mb-2 text-lg font-semibold ${color}`}>
                  {t(`terms.${key}_title`, {}, locale)}
                </h2>
                <p>{t(`terms.${key}_text`, {}, locale)}</p>
              </section>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
