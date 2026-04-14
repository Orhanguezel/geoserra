'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, AlertCircle, Eye, EyeOff, Shield } from 'lucide-react';
import { t } from '@/lib/t';
import { useLocaleStore } from '@/stores/locale-store';
import { submitImplementationRequest } from '@/lib/api';

type UIState = 'idle' | 'submitting' | 'success' | 'error';

export function ImplementationClient() {
  const locale = useLocaleStore((s) => s.locale);
  const [uiState, setUiState] = useState<UIState>('idle');
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({
    email: '', domain: '', notes: '',
    cpanel_host: '', cpanel_user: '', cpanel_pass: '',
  });

  function set(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setUiState('submitting');
    try {
      await submitImplementationRequest({
        email: form.email,
        domain: form.domain,
        notes: form.notes || undefined,
        cpanel_host: form.cpanel_host || undefined,
        cpanel_user: form.cpanel_user || undefined,
        cpanel_pass: form.cpanel_pass || undefined,
      });
      setUiState('success');
    } catch {
      setUiState('error');
    }
  }

  return (
    <main className="min-h-screen py-20 md:py-28">
      <div className="container max-w-xl">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold md:text-4xl">{t('implementation.title', {}, locale)}</h1>
          <p className="mt-3 text-muted-foreground">{t('implementation.subtitle', {}, locale)}</p>
          <p className="mt-2 text-sm text-muted-foreground">{t('implementation.description', {}, locale)}</p>
        </div>

        <AnimatePresence mode="wait">
          {uiState === 'success' ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-10 text-center space-y-4"
            >
              <CheckCircle2 size={48} className="mx-auto text-emerald-400" />
              <p className="font-semibold">{t('implementation.success', {}, locale)}</p>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
                <Field label={t('implementation.email_label', {}, locale)}>
                  <input type="email" value={form.email} onChange={set('email')} required
                    className="input-field" placeholder="siz@ornek.com" />
                </Field>
                <Field label={t('implementation.domain_label', {}, locale)}>
                  <input type="text" value={form.domain} onChange={set('domain')} required
                    className="input-field" placeholder="siteniz.com" />
                </Field>
                <Field label={t('implementation.notes_label', {}, locale)}>
                  <textarea value={form.notes} onChange={set('notes')} rows={3}
                    className="input-field resize-none" />
                </Field>
              </div>

              {/* cPanel section */}
              <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Shield size={16} className="text-primary" />
                  <h3 className="font-semibold text-sm">{t('implementation.cpanel_section', {}, locale)}</h3>
                </div>
                <p className="text-xs text-amber-400 bg-amber-400/10 rounded-lg px-3 py-2">
                  {t('implementation.cpanel_warning', {}, locale)}
                </p>
                <Field label={t('implementation.cpanel_host', {}, locale)}>
                  <input type="text" value={form.cpanel_host} onChange={set('cpanel_host')}
                    className="input-field" placeholder="cpanel.siteniz.com" />
                </Field>
                <Field label={t('implementation.cpanel_user', {}, locale)}>
                  <input type="text" value={form.cpanel_user} onChange={set('cpanel_user')}
                    className="input-field" placeholder="kullanici_adi" />
                </Field>
                <Field label={t('implementation.cpanel_pass', {}, locale)}>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={form.cpanel_pass}
                      onChange={set('cpanel_pass')}
                      className="input-field pr-10"
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </Field>
              </div>

              {uiState === 'error' && (
                <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  <AlertCircle size={14} /> {t('implementation.error', {}, locale)}
                </div>
              )}

              <button
                type="submit"
                disabled={uiState === 'submitting'}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60 transition-all"
              >
                {uiState === 'submitting' && <Loader2 size={16} className="animate-spin" />}
                {t('implementation.submit', {}, locale)}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}
