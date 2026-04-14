'use client';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { t } from '@/lib/t';
import { useLocaleStore } from '@/stores/locale-store';

export default function ThankYouPage() {
  const locale = useLocaleStore((s) => s.locale);
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  return (
    <main className="flex min-h-screen items-center justify-center py-20">
      <div className="container max-w-md text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-10 space-y-6"
        >
          <CheckCircle2 size={56} className="mx-auto text-emerald-400" />
          <div>
            <h1 className="text-2xl font-bold">{t('thank_you.title', {}, locale)}</h1>
            <p className="mt-2 text-primary font-medium">{t('thank_you.subtitle', {}, locale)}</p>
            <p className="mt-3 text-sm text-muted-foreground">{t('thank_you.description', {}, locale)}</p>
          </div>
          <div className="flex flex-col gap-3">
            {id && (
              <Link
                href={`/report/${id}`}
                className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-all"
              >
                {t('thank_you.check_status', {}, locale)} <ArrowRight size={14} />
              </Link>
            )}
            <Link
              href="/"
              className="rounded-xl border border-border px-6 py-2.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              {t('thank_you.back_home', {}, locale)}
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
