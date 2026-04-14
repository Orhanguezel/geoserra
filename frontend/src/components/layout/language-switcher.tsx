'use client';
import { useLocaleStore } from '@/stores/locale-store';
import { cn } from '@/lib/utils';

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocaleStore();

  return (
    <div className="flex items-center rounded-md border border-border bg-muted p-0.5 text-xs font-medium">
      <button
        className={cn('rounded px-2 py-1 transition-colors', locale === 'tr' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}
        onClick={() => setLocale('tr')}
      >
        TR
      </button>
      <button
        className={cn('rounded px-2 py-1 transition-colors', locale === 'en' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}
        onClick={() => setLocale('en')}
      >
        EN
      </button>
    </div>
  );
}
