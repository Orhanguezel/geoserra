'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, AlertCircle, Mail } from 'lucide-react';
import { t } from '@/lib/t';
import { useLocaleStore } from '@/stores/locale-store';
import { api } from '@/lib/api';

type UIState = 'idle' | 'submitting' | 'success' | 'error';

export default function IletisimPage() {
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
      <div className="container max-w-lg">
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex rounded-2xl bg-primary/10 p-3">
            <Mail size={28} className="text-primary" />
          </div>
          <h1 className="text-3xl font-bold">{t('contact.title', {}, locale)}</h1>
          <p className="mt-3 text-muted-foreground">{t('contact.subtitle', {}, locale)}</p>
        </div>

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
                <textarea value={form.message} onChange={set('message')} required rows={5}
                  className="input-field resize-none" />
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
    </main>
  );
}
