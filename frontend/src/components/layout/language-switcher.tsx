'use client';

import { useRef, useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLocaleStore } from '@/stores/locale-store';
import { cn } from '@/lib/utils';

const LOCALES = [
  { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
] as const;

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocaleStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const current = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-border/80 hover:bg-muted hover:text-foreground"
      >
        <span>{current.flag}</span>
        <span className="font-mono uppercase">{current.code}</span>
        <ChevronDown size={12} className={cn('transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1.5 min-w-[130px] rounded-xl border border-border bg-popover py-1 shadow-xl">
          {LOCALES.map((l) => (
            <button
              key={l.code}
              onClick={() => { setLocale(l.code); setOpen(false); }}
              className={cn(
                'flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors hover:bg-muted',
                locale === l.code ? 'font-semibold text-foreground' : 'text-muted-foreground',
              )}
            >
              <span className="text-base">{l.flag}</span>
              <span>{l.label}</span>
              {locale === l.code && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
