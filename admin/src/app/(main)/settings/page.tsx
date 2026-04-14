'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Mail, Save, ShieldCheck, Settings2, ImageIcon, Upload, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { settingsApi, assetsAdminApi, type AssetItem } from '@/lib/api';
import Image from 'next/image';

// ── Asset labels ──────────────────────────────────────────────────────────────
const ASSET_META: Record<string, { label: string; desc: string; width: number; height: number }> = {
  'logo.png':       { label: 'Ana Logo',     desc: '878×238 — header hero, PDF raporu',  width: 220, height: 60 },
  'logo-small.png': { label: 'Küçük Logo',   desc: '440×115 — header, footer navigasyon', width: 140, height: 36 },
  'favicon.png':    { label: 'Favicon',       desc: '174×163 — tarayıcı sekmesi ikonu',   width: 48,  height: 48 },
};

const BACKEND_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8095';

// ── Brand Assets Section ──────────────────────────────────────────────────────
function BrandAssetsSection() {
  const [assets, setAssets] = useState<AssetItem[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);
  const [ts, setTs] = useState(Date.now()); // cache-bust için
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const loadAssets = useCallback(() => {
    assetsAdminApi.list()
      .then((res) => setAssets(res.data))
      .catch(() => toast.error('Görseller yüklenemedi'));
  }, []);

  useEffect(() => { loadAssets(); }, [loadAssets]);

  async function handleUpload(name: string, file: File) {
    setUploading(name);
    try {
      await assetsAdminApi.upload(name, file);
      toast.success(`${ASSET_META[name]?.label ?? name} güncellendi`);
      setTs(Date.now());
      loadAssets();
    } catch {
      toast.error('Yükleme başarısız');
    } finally {
      setUploading(null);
    }
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-[hsl(222,47%,11%)] p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ImageIcon className="h-5 w-5 text-emerald-400" />
          <div>
            <h2 className="font-semibold text-white">Marka Görselleri</h2>
            <p className="text-sm text-slate-400">Logo ve favicon dosyalarını görüntüle ve güncelle</p>
          </div>
        </div>
        <button
          onClick={() => { loadAssets(); setTs(Date.now()); }}
          className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-400 transition hover:border-white/20 hover:text-white"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Yenile
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {Object.entries(ASSET_META).map(([name, meta]) => {
          const asset = assets.find((a) => a.name === name);
          const previewUrl = `${BACKEND_BASE}/assets/${name}?t=${ts}`;
          const isUploading = uploading === name;

          return (
            <div
              key={name}
              className="flex flex-col gap-4 rounded-xl border border-white/5 bg-[hsl(222,47%,8%)] p-5"
            >
              {/* Preview */}
              <div className="flex items-center justify-center rounded-xl border border-white/5 bg-white/3 p-4" style={{ minHeight: 80 }}>
                {asset?.exists ? (
                  <Image
                    src={previewUrl}
                    alt={meta.label}
                    width={meta.width}
                    height={meta.height}
                    className="max-h-16 w-auto object-contain"
                    unoptimized
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-slate-600">
                    <ImageIcon size={32} />
                    <span className="text-xs">Görsel yok</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white text-sm">{meta.label}</span>
                  {asset?.exists
                    ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    : <XCircle className="h-3.5 w-3.5 text-red-400" />
                  }
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{meta.desc}</p>
                {asset?.updated_at && (
                  <p className="text-[10px] text-slate-600 mt-1">
                    {new Date(asset.updated_at).toLocaleString('tr-TR')}
                  </p>
                )}
                <code className="mt-1 block text-[10px] text-slate-600 font-mono">/assets/{name}</code>
              </div>

              {/* Upload */}
              <div>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  className="hidden"
                  ref={(el) => { fileInputRefs.current[name] = el; }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUpload(name, file);
                    e.target.value = '';
                  }}
                />
                <button
                  onClick={() => fileInputRefs.current[name]?.click()}
                  disabled={isUploading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-400 transition hover:bg-emerald-500/20 disabled:opacity-50"
                >
                  <Upload className="h-3.5 w-3.5" />
                  {isUploading ? 'Yükleniyor...' : 'Yeni Görsel Yükle'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const [siteSettings, setSiteSettings] = useState({
    starter_price: '29',
    pro_price: '59',
    expert_price: '99',
    site_name: 'GeoSerra',
    contact_email: 'info@geoserra.com',
  });
  const [smtpEmail, setSmtpEmail] = useState('admin@geoserra.com');
  const [passwords, setPasswords] = useState({
    current_password: '',
    new_password: '',
  });
  const [saving, setSaving] = useState<'site' | 'smtp' | 'password' | null>(null);

  async function handleSaveSiteSettings() {
    setSaving('site');
    try {
      await settingsApi.updateSiteSettings(siteSettings);
      toast.success('Site ayarları kaydedildi');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Site ayarları kaydedilemedi');
    } finally {
      setSaving(null);
    }
  }

  async function handleSmtpTest() {
    setSaving('smtp');
    try {
      await settingsApi.sendSmtpTest(smtpEmail);
      toast.success('SMTP test email gönderildi');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'SMTP test email gönderilemedi');
    } finally {
      setSaving(null);
    }
  }

  async function handleChangePassword() {
    setSaving('password');
    try {
      await settingsApi.changePassword(passwords.current_password, passwords.new_password);
      setPasswords({ current_password: '', new_password: '' });
      toast.success('Şifre güncellendi');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Şifre güncellenemedi');
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Ayarlar</h1>
        <p className="mt-2 text-sm text-slate-400">Marka görselleri, fiyatlandırma, SMTP ve güvenlik ayarları.</p>
      </div>

      {/* Marka Görselleri */}
      <BrandAssetsSection />

      {/* Fiyatlandırma */}
      <section className="rounded-2xl border border-white/10 bg-[hsl(222,47%,11%)] p-6">
        <div className="mb-6 flex items-center gap-3">
          <Settings2 className="h-5 w-5 text-emerald-400" />
          <div>
            <h2 className="font-semibold text-white">Fiyatlandırma</h2>
            <p className="text-sm text-slate-400">Starter, Pro ve Expert paket fiyatlarını güncelleyin.</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Input label="Starter USD" value={siteSettings.starter_price} onChange={(v) => setSiteSettings((s) => ({ ...s, starter_price: v }))} />
          <Input label="Pro USD" value={siteSettings.pro_price} onChange={(v) => setSiteSettings((s) => ({ ...s, pro_price: v }))} />
          <Input label="Expert USD" value={siteSettings.expert_price} onChange={(v) => setSiteSettings((s) => ({ ...s, expert_price: v }))} />
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Input label="Site Adı" value={siteSettings.site_name} onChange={(v) => setSiteSettings((s) => ({ ...s, site_name: v }))} />
          <Input label="İletişim Email" value={siteSettings.contact_email} onChange={(v) => setSiteSettings((s) => ({ ...s, contact_email: v }))} />
        </div>
        <button
          onClick={handleSaveSiteSettings}
          disabled={saving === 'site'}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          {saving === 'site' ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </section>

      {/* SMTP Test */}
      <section className="rounded-2xl border border-white/10 bg-[hsl(222,47%,11%)] p-6">
        <div className="mb-6 flex items-center gap-3">
          <Mail className="h-5 w-5 text-cyan-400" />
          <div>
            <h2 className="font-semibold text-white">SMTP Test</h2>
            <p className="text-sm text-slate-400">Test email göndererek SMTP ayarlarınızı doğrulayın.</p>
          </div>
        </div>
        <div className="max-w-md">
          <Input label="Test Email" value={smtpEmail} onChange={setSmtpEmail} />
        </div>
        <button
          onClick={handleSmtpTest}
          disabled={saving === 'smtp'}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-600 disabled:opacity-60"
        >
          <Mail className="h-4 w-4" />
          {saving === 'smtp' ? 'Gönderiliyor...' : 'Test Email Gönder'}
        </button>
      </section>

      {/* Şifre */}
      <section className="rounded-2xl border border-white/10 bg-[hsl(222,47%,11%)] p-6">
        <div className="mb-6 flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-violet-400" />
          <div>
            <h2 className="font-semibold text-white">Yönetici Şifre Değiştirme</h2>
            <p className="text-sm text-slate-400">Mevcut şifrenizi doğrulayıp yeni şifre belirleyin.</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Mevcut Şifre"
            type="password"
            value={passwords.current_password}
            onChange={(v) => setPasswords((s) => ({ ...s, current_password: v }))}
          />
          <Input
            label="Yeni Şifre"
            type="password"
            value={passwords.new_password}
            onChange={(v) => setPasswords((s) => ({ ...s, new_password: v }))}
          />
        </div>
        <button
          onClick={handleChangePassword}
          disabled={saving === 'password' || !passwords.current_password || !passwords.new_password}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-violet-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-600 disabled:opacity-60"
        >
          <ShieldCheck className="h-4 w-4" />
          {saving === 'password' ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
        </button>
      </section>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-300">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-white/10 bg-[hsl(222,47%,8%)] px-4 py-2.5 text-sm text-white outline-none transition focus:border-emerald-500/50"
      />
    </label>
  );
}
