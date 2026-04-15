'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, AlertCircle, Mail, Clock, MessageSquare, Briefcase, HelpCircle } from 'lucide-react';
import { t } from '@/lib/t';
import { useLocaleStore } from '@/stores/locale-store';
import { api } from '@/lib/api';

type UIState = 'idle' | 'submitting' | 'success' | 'error';

export function ContactClient() {
  const locale = useLocaleStore((s) => s.locale);
  const [uiState, setUiState] = useState<UIState>('idle');
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  function set(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setUiState('submitting');
    try {
      await api.post('/contact', form);
      setUiState('success');
    } catch {
      setUiState('error');
    }
  }

  return (
    <main className="min-h-screen py-20 md:py-28">
      <div className="container max-w-3xl">
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex rounded-2xl bg-primary/10 p-3">
            <Mail size={28} className="text-primary" />
          </div>
          <h1 className="text-3xl font-bold">{t('contact.title', {}, locale)}</h1>
          <p className="mt-3 text-muted-foreground">{t('contact.subtitle', {}, locale)}</p>
        </div>

        {/* Bilgi Kartları */}
        <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Clock, key: 'c1', color: 'text-emerald-400' },
            { icon: MessageSquare, key: 'c2', color: 'text-cyan-400' },
            { icon: Briefcase, key: 'c3', color: 'text-amber-400' },
            { icon: HelpCircle, key: 'c4', color: 'text-violet-400' },
          ].map(({ icon: Icon, key, color }) => (
            <div key={key} className="rounded-2xl border border-border bg-card p-5 space-y-2">
              <div className={`inline-flex rounded-lg bg-muted p-2 ${color}`}><Icon size={16} /></div>
              <h3 className="text-sm font-semibold">{t(`contact_info.${key}_title`, {}, locale)}</h3>
              <p className="text-xs leading-5 text-muted-foreground">{t(`contact_info.${key}_desc`, {}, locale)}</p>
            </div>
          ))}
        </div>

        {/* İletişim Bilgileri */}
        <div className="mb-8 rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-4 text-base font-semibold">{t('contact_info.info_title', {}, locale)}</h2>
          <div className="grid gap-4 sm:grid-cols-3 text-sm">
            <div>
              <p className="font-medium text-foreground">{t('contact_info.email_label', {}, locale)}</p>
              <p className="mt-1 text-muted-foreground">{t('contact_info.email_value', {}, locale)}</p>
              <p className="text-xs text-muted-foreground/70">{t('contact_info.email_note', {}, locale)}</p>
            </div>
            <div>
              <p className="font-medium text-foreground">{t('contact_info.hours_label', {}, locale)}</p>
              <p className="mt-1 text-muted-foreground">{t('contact_info.hours_value', {}, locale)}</p>
              <p className="text-xs text-muted-foreground/70">{t('contact_info.hours_note', {}, locale)}</p>
            </div>
            <div>
              <p className="font-medium text-foreground">{t('contact_info.location_label', {}, locale)}</p>
              <p className="mt-1 text-muted-foreground">{t('contact_info.location_value', {}, locale)}</p>
              <p className="text-xs text-muted-foreground/70">{t('contact_info.location_note', {}, locale)}</p>
            </div>
          </div>
        </div>

        <div className="max-w-lg mx-auto">

        <AnimatePresence mode="wait">
          {uiState === 'success' ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-10 text-center space-y-3"
            >
              <CheckCircle2 size={48} className="mx-auto text-emerald-400" />
              <p className="font-semibold">{t('contact.success', {}, locale)}</p>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit}
              className="rounded-2xl border border-border bg-card p-6 space-y-4"
            >
              <div>
                <label className="mb-1.5 block text-sm font-medium">{t('contact.name_label', {}, locale)}</label>
                <input type="text" value={form.name} onChange={set('name')} required className="input-field" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">{t('contact.email_label', {}, locale)}</label>
                <input type="email" value={form.email} onChange={set('email')} required className="input-field" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">{t('contact.message_label', {}, locale)}</label>
                <textarea value={form.message} onChange={set('message')} required rows={5} className="input-field resize-none" />
              </div>

              {uiState === 'error' && (
                <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  <AlertCircle size={14} /> {t('common.error', {}, locale)}
                </div>
              )}

              <button
                type="submit"
                disabled={uiState === 'submitting'}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60 transition-all"
              >
                {uiState === 'submitting' && <Loader2 size={16} className="animate-spin" />}
                {t('contact.submit', {}, locale)}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
