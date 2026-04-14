'use client';

import { useState, use } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { implApi, type ImplStatus } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const STATUS_OPTIONS: { value: ImplStatus; label: string }[] = [
  { value: 'pending', label: 'Bekleyen' },
  { value: 'in_progress', label: 'İşlemde' },
  { value: 'done', label: 'Tamamlandı' },
];

const STATUS_COLORS: Record<ImplStatus, string> = {
  pending: 'bg-yellow-500/20 text-yellow-300',
  in_progress: 'bg-blue-500/20 text-blue-300',
  done: 'bg-green-500/20 text-green-300',
};

export default function ImplDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const qc = useQueryClient();
  const router = useRouter();

  const { data: req, isLoading } = useQuery({
    queryKey: ['admin-impl', id],
    queryFn: () => implApi.get(id).then((r) => r.data),
  });

  const [status, setStatus] = useState<ImplStatus>('pending');
  const [adminNotes, setAdminNotes] = useState('');
  const [initialized, setInitialized] = useState(false);

  if (req && !initialized) {
    setStatus(req.status as ImplStatus);
    setAdminNotes(req.admin_notes ?? '');
    setInitialized(true);
  }

  const mutation = useMutation({
    mutationFn: () => implApi.update(id, { status, admin_notes: adminNotes }),
    onSuccess: () => {
      toast.success('Güncellendi');
      qc.invalidateQueries({ queryKey: ['admin-impl'] });
    },
    onError: () => toast.error('Güncellenemedi'),
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-violet-400" />
      </div>
    );
  }

  if (!req) {
    return (
      <div className="py-16 text-center text-slate-400">
        Talep bulunamadı.{' '}
        <button onClick={() => router.back()} className="text-violet-400 hover:underline">Geri dön</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="flex items-center gap-3">
        <Link href="/implementation" className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/5 hover:text-white">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-white">{req.domain}</h1>
          <p className="text-sm text-slate-400">{req.email}</p>
        </div>
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[req.status as ImplStatus] ?? 'bg-white/10 text-white'}`}>
          {req.status}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Bilgiler */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <h2 className="mb-3 text-sm font-semibold text-white">Talep Bilgileri</h2>
          <dl className="space-y-2 text-sm">
            {[
              ['ID', req.id],
              ['Paket', req.package_slug ?? '—'],
              ['Oluşturulma', formatDate(req.created_at)],
              ['Güncelleme', formatDate(req.updated_at)],
            ].map(([label, value]) => (
              <div key={label} className="flex gap-2">
                <dt className="w-28 flex-shrink-0 text-slate-500">{label}</dt>
                <dd className="break-all text-slate-300">{String(value)}</dd>
              </div>
            ))}
          </dl>

          {req.notes && (
            <div className="mt-4 rounded-lg border border-white/10 bg-white/5 p-3">
              <p className="mb-1 text-xs font-medium text-slate-500">Müşteri Notu</p>
              <p className="whitespace-pre-wrap text-sm text-slate-300">{req.notes}</p>
            </div>
          )}
        </div>

        {/* Durum Güncelleme */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <h2 className="mb-3 text-sm font-semibold text-white">Durum Güncelle</h2>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-400">Durum</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ImplStatus)}
                className="w-full rounded-lg border border-white/10 bg-[hsl(222,47%,8%)] py-2 pl-3 pr-8 text-sm text-white outline-none focus:border-violet-500"
              >
                {STATUS_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-400">Admin Notu</label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={5}
                placeholder="İç not veya müşteriye gönderilecek özet..."
                className="w-full resize-none rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white placeholder-slate-500 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
              />
            </div>

            <button
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-700 disabled:opacity-60"
            >
              {mutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Kaydet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
