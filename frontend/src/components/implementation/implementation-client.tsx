'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, AlertCircle, Eye, EyeOff, Shield, ClipboardList, Wrench, FileCheck, Lock, Clock, CheckCheck } from 'lucide-react';
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
      <div className="container max-w-3xl">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold md:text-4xl">{t('implementation.title', {}, locale)}</h1>
          <p className="mt-3 text-muted-foreground">{t('implementation.subtitle', {}, locale)}</p>
          <p className="mt-2 text-sm text-muted-foreground">{t('implementation.description', {}, locale)}</p>
        </div>

        {/* Ne Yapıyoruz */}
        <div className="mb-8 rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-4 text-base font-semibold">{t('impl_info.what_title', {}, locale)}</h2>
          <p className="text-sm leading-7 text-muted-foreground">
            {t('impl_info.what_desc', {}, locale)}
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {(['service1', 'service2', 'service3', 'service4', 'service5', 'service6', 'service7', 'service8'] as const).map((key) => (
              <div key={key} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <CheckCheck size={14} className="mt-0.5 shrink-0 text-emerald-400" />
                {t(`impl_info.${key}`, {}, locale)}
              </div>
            ))}
          </div>
        </div>

        {/* Süreç Adımları */}
        <div className="mb-8 rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-5 text-base font-semibold">{t('impl_info.how_title', {}, locale)}</h2>
          <div className="space-y-5">
            {[
              { icon: ClipboardList, step: '1', key: 'step1', color: 'text-emerald-400' },
              { icon: FileCheck, step: '2', key: 'step2', color: 'text-cyan-400' },
              { icon: Wrench, step: '3', key: 'step3', color: 'text-amber-400' },
              { icon: CheckCircle2, step: '4', key: 'step4', color: 'text-violet-400' },
            ].map(({ icon: Icon, step, key, color }) => (
              <div key={step} className="flex gap-4">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted ${color}`}>
                  <Icon size={16} />
                </div>
                <div>
                  <p className="text-sm font-semibold">{step}. {t(`impl_info.${key}_title`, {}, locale)}</p>
                  <p className="mt-1 text-sm text-muted-foreground leading-6">{t(`impl_info.${key}_desc`, {}, locale)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SLA & Güvenlik */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-3 flex items-center gap-2">
              <Clock size={16} className="text-emerald-400" />
              <h3 className="text-sm font-semibold">{t('impl_info.sla_title', {}, locale)}</h3>
            </div>
            <ul className="space-y-2 text-xs text-muted-foreground">
              {(['sla1', 'sla2', 'sla3', 'sla4'] as const).map((key) => (
                <li key={key}>
                  <span className="font-medium text-foreground">{t(`impl_info.${key}_label`, {}, locale)}</span>{' '}
                  {t(`impl_info.${key}_value`, {}, locale)}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
            <div className="mb-3 flex items-center gap-2">
              <Lock size={16} className="text-emerald-400" />
              <h3 className="text-sm font-semibold">{t('impl_info.security_title', {}, locale)}</h3>
            </div>
            <ul className="space-y-2 text-xs text-muted-foreground">
              {(['sec1', 'sec2', 'sec3', 'sec4'] as const).map((key) => (
                <li key={key}>{t(`impl_info.${key}`, {}, locale)}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="max-w-xl mx-auto">

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
