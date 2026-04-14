'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Loader2, AlertCircle } from 'lucide-react';
import { t } from '@/lib/t';
import { useLocaleStore } from '@/stores/locale-store';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '');

export function StripePayPage() {
  const searchParams = useSearchParams();
  const clientSecret = searchParams.get('secret') ?? '';
  const analysisId = searchParams.get('id') ?? '';
  const locale = useLocaleStore((s) => s.locale);

  if (!clientSecret) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">{t('common.error', {}, locale)}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-20 md:py-28">
      <div className="container max-w-md">
        <h1 className="mb-8 text-center text-2xl font-bold">{t('checkout.complete_payment', {}, locale)}</h1>
        <div className="rounded-2xl border border-border bg-card p-6">
          <Elements
            stripe={stripePromise}
            options={{ clientSecret, appearance: { theme: 'night', variables: { colorPrimary: '#7C3AED' } } }}
          >
            <CheckoutForm analysisId={analysisId} />
          </Elements>
        </div>
      </div>
    </main>
  );
}

function CheckoutForm({ analysisId }: { analysisId: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const locale = useLocaleStore((s) => s.locale);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError('');
    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/thank-you?id=${analysisId}`,
      },
    });
    if (stripeError) {
      setError(stripeError.message ?? t('common.error', {}, locale));
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle size={14} /> {error}
        </div>
      )}
      <button
        type="submit"
        disabled={loading || !stripe}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : null}
        {t('checkout.confirm_payment', {}, locale)}
      </button>
    </form>
  );
}
