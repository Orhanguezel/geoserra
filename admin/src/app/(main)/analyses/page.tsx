'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analysesApi, type AnalysisStatus, type PackageSlug } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

const STATUS_LABELS: Record<string, string> = {
  free: 'Ücretsiz',
  pending: 'Bekleyen',
  processing: 'İşlemde',
  completed: 'Tamamlandı',
  failed: 'Başarısız',
};

const STATUS_COLORS: Record<string, string> = {
  free: 'bg-slate-500/20 text-slate-300',
  pending: 'bg-yellow-500/20 text-yellow-300',
  processing: 'bg-blue-500/20 text-blue-300',
  completed: 'bg-green-500/20 text-green-300',
  failed: 'bg-red-500/20 text-red-300',
};

const PACKAGE_LABELS: Record<string, string> = {
  free: 'Ücretsiz',
  starter: 'Starter ($29)',
  pro: 'Pro ($59)',
  expert: 'Expert ($99)',
};

const PAGE_SIZE = 20;

export default function AnalysesPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<AnalysisStatus | ''>('');
  const [packageSlug, setPackageSlug] = useState<PackageSlug | ''>('');
  const [page, setPage] = useState(0);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['admin-analyses', search, status, packageSlug, page],
    queryFn: () =>
      analysesApi.list({
        search: search || undefined,
        status: (status as AnalysisStatus) || undefined,
        package_slug: (packageSlug as PackageSlug) || undefined,
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
        order: 'desc',
      }).then((r) => ({ data: r.data, total: parseInt(r.headers['x-total-count'] ?? '0', 10) })),
    placeholderData: (prev) => prev,
  });

  const totalPages = Math.ceil((data?.total ?? 0) / PAGE_SIZE);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-white">Analizler</h1>

      {/* Filtreler */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Domain veya email ara..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm text-white placeholder-slate-500 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
          />
        </div>

        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value as AnalysisStatus | ''); setPage(0); }}
          className="rounded-lg border border-white/10 bg-[hsl(222,47%,11%)] py-2 pl-3 pr-8 text-sm text-white outline-none focus:border-violet-500"
        >
          <option value="">Tüm Durumlar</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>

        <select
          value={packageSlug}
          onChange={(e) => { setPackageSlug(e.target.value as PackageSlug | ''); setPage(0); }}
          className="rounded-lg border border-white/10 bg-[hsl(222,47%,11%)] py-2 pl-3 pr-8 text-sm text-white outline-none focus:border-violet-500"
        >
          <option value="">Tüm Paketler</option>
          {Object.entries(PACKAGE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {/* Tablo */}
      <div className="overflow-hidden rounded-xl border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-400">URL</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-400">E-posta</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-400">Paket</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-400">Durum</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-400">Tarih</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading && Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 w-full animate-pulse rounded bg-white/10" />
                    </td>
                  ))}
                </tr>
              ))}
              {!isLoading && data?.data.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    Analiz bulunamadı
                  </td>
                </tr>
              )}
              {data?.data.map((a) => (
                <tr
                  key={a.id}
                  className={`transition-colors hover:bg-white/5 ${isFetching ? 'opacity-60' : ''}`}
                >
                  <td className="px-4 py-3">
                    <Link href={`/analyses/${a.id}`} className="max-w-xs truncate block text-violet-300 hover:text-violet-200 hover:underline">
                      {a.url}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{a.email}</td>
                  <td className="px-4 py-3 text-slate-300">{PACKAGE_LABELS[a.package_slug] ?? a.package_slug}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[a.status] ?? 'bg-white/10 text-white'}`}>
                      {STATUS_LABELS[a.status] ?? a.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400">{formatDate(a.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sayfalama */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Toplam {data?.total ?? 0} sonuç
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-sm text-slate-300 transition-colors hover:bg-white/5 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
              Önceki
            </button>
            <span className="text-sm text-slate-400">
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-sm text-slate-300 transition-colors hover:bg-white/5 disabled:opacity-40"
            >
              Sonraki
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
