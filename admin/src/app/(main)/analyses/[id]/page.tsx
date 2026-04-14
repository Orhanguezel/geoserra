'use client';

import { useState } from 'react';
import { use } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { analysesApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Send,
  RefreshCw,
  Loader2,
  Download,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';

const STATUS_COLORS: Record<string, string> = {
  free: 'bg-slate-500/20 text-slate-300',
  pending: 'bg-yellow-500/20 text-yellow-300',
  processing: 'bg-blue-500/20 text-blue-300 animate-pulse',
  completed: 'bg-green-500/20 text-green-300',
  failed: 'bg-red-500/20 text-red-300',
};

export default function AnalysisDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const qc = useQueryClient();
  const router = useRouter();
  const [notes, setNotes] = useState('');
  const [notesEdited, setNotesEdited] = useState(false);

  const { data: analysis, isLoading } = useQuery({
    queryKey: ['admin-analysis', id],
    queryFn: () => analysesApi.get(id).then((r) => r.data),
    onSuccess: (d) => {
      if (!notesEdited) setNotes(d.error_message ?? '');
    },
    refetchInterval: (data) => {
      if (data?.status === 'processing') return 4000;
      return false;
    },
  } as any);

  const resendMutation = useMutation({
    mutationFn: () => analysesApi.resendPdf(id),
    onSuccess: () => {
      toast.success('PDF yeniden gönderildi');
      qc.invalidateQueries({ queryKey: ['admin-analysis', id] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error ?? 'Gönderilemedi');
    },
  });

  const rerunMutation = useMutation({
    mutationFn: () => analysesApi.rerun(id),
    onSuccess: () => {
      toast.success('Analiz yeniden başlatıldı');
      qc.invalidateQueries({ queryKey: ['admin-analysis', id] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error ?? 'Başlatılamadı');
    },
  });

  const updateMutation = useMutation({
    mutationFn: () => analysesApi.update(id, { admin_notes: notes }),
    onSuccess: () => {
      toast.success('Admin notu kaydedildi');
      setNotesEdited(false);
      qc.invalidateQueries({ queryKey: ['admin-analysis', id] });
    },
    onError: () => toast.error('Kaydedilemedi'),
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-violet-400" />
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="py-16 text-center text-slate-400">
        Analiz bulunamadı.{' '}
        <button onClick={() => router.back()} className="text-violet-400 hover:underline">Geri dön</button>
      </div>
    );
  }

  const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8095';
  const pdfUrl = analysis.pdf_path
    ? `${BASE}/reports/${analysis.id}.pdf`
    : null;

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="flex items-center gap-3">
        <Link href="/analyses" className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/5 hover:text-white">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="truncate text-lg font-bold text-white">{analysis.url}</h1>
          <p className="text-sm text-slate-400">{analysis.email}</p>
        </div>
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[analysis.status] ?? 'bg-white/10 text-white'}`}>
          {analysis.status}
        </span>
      </div>

      {/* Aksiyon butonları */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => resendMutation.mutate()}
          disabled={resendMutation.isPending || analysis.status !== 'completed' || !analysis.pdf_path}
          className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-700 disabled:opacity-40"
        >
          {resendMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          PDF Yeniden Gönder
        </button>

        <button
          onClick={() => rerunMutation.mutate()}
          disabled={rerunMutation.isPending || analysis.status === 'processing'}
          className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10 disabled:opacity-40"
        >
          {rerunMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Analizi Yeniden Çalıştır
        </button>

        {pdfUrl && (
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
          >
            <Download className="h-4 w-4" />
            PDF İndir
          </a>
        )}

        <a
          href={analysis.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
        >
          <ExternalLink className="h-4 w-4" />
          Siteyi Aç
        </a>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Detay */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <h2 className="mb-3 text-sm font-semibold text-white">Bilgiler</h2>
          <dl className="space-y-2 text-sm">
            {[
              ['ID', analysis.id],
              ['Paket', analysis.package_slug],
              ['Ödeme Yöntemi', analysis.payment_provider ?? '—'],
              ['Ödeme ID', analysis.payment_id ?? '—'],
              ['PDF Yolu', analysis.pdf_path ?? '—'],
              ['PDF Gönderildi', formatDate(analysis.pdf_sent_at)],
              ['Oluşturulma', formatDate(analysis.created_at)],
              ['Tamamlanma', formatDate(analysis.completed_at)],
            ].map(([label, value]) => (
              <div key={label} className="flex gap-2">
                <dt className="w-32 flex-shrink-0 text-slate-500">{label}</dt>
                <dd className="break-all text-slate-300">{String(value)}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Admin Notu */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <h2 className="mb-3 text-sm font-semibold text-white">Admin Notu</h2>
          <textarea
            value={notes}
            onChange={(e) => { setNotes(e.target.value); setNotesEdited(true); }}
            rows={5}
            placeholder="İç not ekle..."
            className="w-full resize-none rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white placeholder-slate-500 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
          />
          <div className="mt-2 flex justify-end">
            <button
              onClick={() => updateMutation.mutate()}
              disabled={!notesEdited || updateMutation.isPending}
              className="flex items-center gap-2 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-violet-700 disabled:opacity-40"
            >
              {updateMutation.isPending && <Loader2 className="h-3 w-3 animate-spin" />}
              Kaydet
            </button>
          </div>
        </div>
      </div>

      {/* Ham JSON verisi */}
      {(analysis.free_data || analysis.full_data) && (
        <div className="space-y-4">
          {analysis.free_data && (
            <details className="rounded-xl border border-white/10 bg-white/5">
              <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-white hover:bg-white/5">
                Ücretsiz Analiz Verisi (JSON)
              </summary>
              <div className="max-h-96 overflow-y-auto border-t border-white/10 p-4">
                <pre className="text-xs text-slate-400 whitespace-pre-wrap break-all">
                  {JSON.stringify(analysis.free_data, null, 2)}
                </pre>
              </div>
            </details>
          )}
          {analysis.full_data && (
            <details className="rounded-xl border border-white/10 bg-white/5">
              <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-white hover:bg-white/5">
                Tam Analiz Verisi (JSON)
              </summary>
              <div className="max-h-96 overflow-y-auto border-t border-white/10 p-4">
                <pre className="text-xs text-slate-400 whitespace-pre-wrap break-all">
                  {JSON.stringify(analysis.full_data, null, 2)}
                </pre>
              </div>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
