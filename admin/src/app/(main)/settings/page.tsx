'use client';

import { useState, useEffect, useRef } from 'react';
import { Save, Mail, Globe, DollarSign, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { settingsApi } from '@/lib/api';

interface Settings {
  'price.starter': number;
  'price.pro': number;
  'price.expert': number;
  'contact.support_email': string;
  'site.name': string;
  'site.meta_description': string;
}

const DEFAULTS: Settings = {
  'price.starter': 29,
  'price.pro': 59,
  'price.expert': 99,
  'contact.support_email': 'support@geoserra.com',
  'site.name': 'GeoSerra — AI & SEO Analiz',
  'site.meta_description': "Web sitenizin ChatGPT, Gemini ve Perplexity'deki görünürlüğünü analiz edin.",
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    settingsApi.get()
      .then((res) => {
        if (!mountedRef.current) return;
        const remote = res.data as Record<string, unknown>;
        setSettings((prev) => ({
          ...prev,
          ...(remote['price.starter'] !== undefined && { 'price.starter': Number(remote['price.starter']) }),
          ...(remote['price.pro'] !== undefined && { 'price.pro': Number(remote['price.pro']) }),
          ...(remote['price.expert'] !== undefined && { 'price.expert': Number(remote['price.expert']) }),
          ...(remote['contact.support_email'] !== undefined && { 'contact.support_email': String(remote['contact.support_email']) }),
          ...(remote['site.name'] !== undefined && { 'site.name': String(remote['site.name']) }),
          ...(remote['site.meta_description'] !== undefined && { 'site.meta_description': String(remote['site.meta_description']) }),
        }));
      })
      .catch(() => { /* use defaults if endpoint fails */ })
      .finally(() => { if (mountedRef.current) setFetching(false); });

    return () => { mountedRef.current = false; };
  }, []);

  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setLoading(true);
    try {
      await settingsApi.bulkUpsert(
        Object.entries(settings).map(([key, value]) => ({ key, value }))
      );
      toast.success('Ayarlar başarıyla kaydedildi');
    } catch {
      toast.error('Kayıt başarısız');
    } finally {
      setLoading(false);
    }
  }

  if (fetching) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-emerald-500" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <Globe className="text-emerald-500" />
            Sistem Ayarları
          </h1>
          <p className="text-muted-foreground mt-1">Platform genelindeki fiyatları, şifreleri ve iletişim bilgilerini yönetin.</p>
        </div>
        <Link href="/" className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-white transition-colors">
          <ArrowLeft size={14} /> Geri Dön
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Fiyatlandırma Ayarları */}
        <section className="rounded-3xl border border-white/5 bg-[#0f1420] p-8 space-y-6 shadow-xl">
          <div className="flex items-center gap-3 pb-4 border-b border-white/5">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
              <DollarSign size={20} />
            </div>
            <div>
              <h2 className="font-bold text-white">Paket Fiyatları</h2>
              <p className="text-xs text-muted-foreground">Analiz paketlerinin USD bazlı fiyatları</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <PriceInput
              label="Starter"
              value={settings['price.starter']}
              onChange={(v) => update('price.starter', v)}
            />
            <PriceInput
              label="Pro"
              value={settings['price.pro']}
              onChange={(v) => update('price.pro', v)}
            />
            <PriceInput
              label="Expert"
              value={settings['price.expert']}
              onChange={(v) => update('price.expert', v)}
            />
          </div>
        </section>

        {/* İletişim */}
        <section className="rounded-3xl border border-white/5 bg-[#0f1420] p-8 space-y-6 shadow-xl">
          <div className="flex items-center gap-3 pb-4 border-b border-white/5">
            <div className="h-10 w-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-500 border border-cyan-500/20">
              <Mail size={20} />
            </div>
            <div>
              <h2 className="font-bold text-white">Email & Bildirimler</h2>
              <p className="text-xs text-muted-foreground">Destek e-posta adresi</p>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block">Destek E-posta Adresi</label>
            <input
              type="email"
              value={settings['contact.support_email']}
              onChange={(e) => update('contact.support_email', e.target.value)}
              className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-cyan-500/30 transition-all"
            />
          </div>
        </section>

        {/* Site Bilgileri */}
        <section className="rounded-3xl border border-white/5 bg-[#0f1420] p-8 space-y-6 shadow-xl md:col-span-2">
          <div className="flex items-center gap-3 pb-4 border-b border-white/5">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20">
              <Globe size={20} />
            </div>
            <div>
              <h2 className="font-bold text-white">Platform Kimliği</h2>
              <p className="text-xs text-muted-foreground">Marka adı ve meta bilgiler</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block">Platform Adı</label>
              <input
                type="text"
                value={settings['site.name']}
                onChange={(e) => update('site.name', e.target.value)}
                className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-emerald-500/30 transition-all"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block">Meta Açıklama (Default)</label>
              <textarea
                rows={3}
                value={settings['site.meta_description']}
                onChange={(e) => update('site.meta_description', e.target.value)}
                className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm text-white outline-none resize-none focus:border-emerald-500/30 transition-all"
              />
            </div>
          </div>
        </section>
      </div>

      {/* Global Save Button */}
      <div className="fixed bottom-10 right-10 z-50">
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 px-8 py-4 font-bold text-white shadow-2xl shadow-emerald-500/40 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
          {loading ? 'Kaydediliyor...' : 'Tüm Değişiklikleri Uygula'}
        </button>
      </div>
    </div>
  );
}

function PriceInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center block">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">$</span>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full bg-white/5 border border-white/5 rounded-xl pl-6 pr-3 py-3 text-sm text-white font-bold outline-none focus:border-emerald-500/30 transition-all text-center"
        />
      </div>
    </div>
  );
}
