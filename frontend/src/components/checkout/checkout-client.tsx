'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { t } from '@/lib/t';
import { useLocaleStore } from '@/stores/locale-store';
import { useCurrencyStore } from '@/stores/currency-store';
import { startPaidAnalysis } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { PayPalButton } from './paypal-button';

const PACKAGES = {
  starter: { price: 29, color: 'border-border' },
  pro:     { price: 59, color: 'border-primary' },
  expert:  { price: 99, color: 'border-border' },
};

type CheckoutStep = 'form' | 'paying' | 'success' | 'error';

export function CheckoutClient({ packageSlug }: { packageSlug: 'starter' | 'pro' | 'expert' }) {
  const locale = useLocaleStore((s) => s.locale);
  const { currency, rates } = useCurrencyStore();
  const router = useRouter();

  const [url, setUrl] = useState('');
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<CheckoutStep>('form');
  const [errorMsg, setErrorMsg] = useState('');
  const [paypalOrderId, setPaypalOrderId] = useState('');
  const [analysisId, setAnalysisId] = useState('');

  const pkg = PACKAGES[packageSlug];

  async function handleStripe(e: React.FormEvent) {
    e.preventDefault();
    setStep('paying');
    try {
      const data = await startPaidAnalysis({
        url: url.trim(),
        email: email.trim(),
        package: packageSlug,
        payment_provider: 'stripe',
        locale,
      });
      setAnalysisId(data.analysis_id);
      if (!data.client_secret) throw new Error('No client secret');
      router.push(`/checkout/${packageSlug}/pay?secret=${data.client_secret}&id=${data.analysis_id}`);
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message ?? t('common.error', {}, locale));
      setStep('error');
    }
  }

  async function handlePayPalStart() {
    setStep('paying');
    try {
      const data = await startPaidAnalysis({
        url: url.trim(),
        email: email.trim(),
        package: packageSlug,
        payment_provider: 'paypal',
        locale,
      });
      setAnalysisId(data.analysis_id);
      setPaypalOrderId(data.paypal_order_id ?? '');
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message ?? t('common.error', {}, locale));
      setStep('error');
    }
  }

  function handlePayPalSuccess() {
    router.push(`/thank-you?id=${analysisId}`);
  }

  return (
    <main className="min-h-screen py-20 md:py-28">
      <div className="container max-w-lg">
        {/* Package badge */}
        <div className="mb-8 text-center">
          <span className="inline-block rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-sm font-semibold text-primary capitalize">
            {t(`pricing.${packageSlug}.name`, {}, locale)}
          </span>
          <p className="mt-2 text-3xl font-bold">{formatCurrency(pkg.price, currency, rates)}</p>
          <p className="text-sm text-muted-foreground">/ {t('pricing.per_report', {}, locale)}</p>
        </div>

        {step === 'form' && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className={`rounded-2xl border ${pkg.color} bg-card p-6 space-y-4`}>
              <h2 className="font-bold">{t('checkout.details', {}, locale)}</h2>
              <div>
                <label className="mb-1.5 block text-sm font-medium">{t('analyze.url_label', {}, locale)}</label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder={t('analyze.url_placeholder', {}, locale)}
                  required
                  className="w-full rounded-lg border border-border bg-muted/50 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">{t('analyze.email_label', {}, locale)}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('analyze.email_placeholder', {}, locale)}
                  required
                  className="w-full rounded-lg border border-border bg-muted/50 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
                />
              </div>
            </div>

            {/* Payment methods */}
            <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
              <h2 className="font-bold">{t('checkout.payment_method', {}, locale)}</h2>

              {/* Stripe */}
              <form onSubmit={handleStripe}>
                <button
                  type="submit"
                  disabled={!url || !email}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-60"
                >
                  <CreditCard size={16} />
                  {t('checkout.pay_card', {}, locale)}
                </button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
                <div className="relative flex justify-center text-xs text-muted-foreground">
                  <span className="bg-card px-2">{t('common.or', {}, locale)}</span>
                </div>
              </div>

              {/* PayPal */}
              {paypalOrderId ? (
                <PayPalButton
                  orderId={paypalOrderId}
                  onSuccess={handlePayPalSuccess}
                  onError={() => { setErrorMsg(t('common.error', {}, locale)); setStep('error'); }}
                />
              ) : (
                <button
                  onClick={handlePayPalStart}
                  disabled={!url || !email}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-[#FFC439] px-6 py-3 font-semibold text-[#003087] transition-all hover:bg-[#f0b429] disabled:opacity-60"
                >
                  <span className="font-bold italic">Pay</span><span className="font-bold italic text-blue-700">Pal</span>
                  {t('checkout.pay_paypal', {}, locale)}
                </button>
              )}
            </div>
          </motion.div>
        )}

        {step === 'paying' && !paypalOrderId && (
          <div className="rounded-2xl border border-border bg-card p-10 text-center space-y-4">
            <Loader2 size={36} className="mx-auto animate-spin text-primary" />
            <p className="font-semibold">{t('checkout.processing', {}, locale)}</p>
          </div>
        )}

        {step === 'error' && (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center space-y-3">
            <AlertCircle size={36} className="mx-auto text-destructive" />
            <p className="font-semibold">{errorMsg}</p>
            <button
              onClick={() => setStep('form')}
              className="rounded-lg bg-muted px-4 py-2 text-sm hover:bg-muted/80"
            >
              {t('common.retry', {}, locale)}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
