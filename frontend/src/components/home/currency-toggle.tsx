'use client';
import { useCurrencyStore } from '@/stores/currency-store';
import { t } from '@/lib/t';
import { useLocaleStore } from '@/stores/locale-store';

const CURRENCIES = ['USD', 'TRY', 'EUR'] as const;

export function CurrencyToggle() {
  const locale = useLocaleStore((s) => s.locale);
  const { currency, setCurrency } = useCurrencyStore();

  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-muted-foreground">{t('pricing.currency_toggle', {}, locale)}</span>
      <div className="flex rounded-lg border border-border bg-muted/50 p-0.5">
        {CURRENCIES.map((c) => (
          <button
            key={c}
            onClick={() => setCurrency(c)}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
              currency === c
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}
