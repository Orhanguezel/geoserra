'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { implApi, type ImplStatus } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const STATUS_LABELS: Record<ImplStatus, string> = {
  pending: 'Bekleyen',
  in_progress: 'İşlemde',
  done: 'Tamamlandı',
};

const STATUS_COLORS: Record<ImplStatus, string> = {
  pending: 'bg-yellow-500/20 text-yellow-300',
  in_progress: 'bg-blue-500/20 text-blue-300',
  done: 'bg-green-500/20 text-green-300',
};

const PAGE_SIZE = 20;

export default function ImplementationPage() {
  const [status, setStatus] = useState<ImplStatus | ''>('');
  const [page, setPage] = useState(0);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['admin-impl', status, page],
    queryFn: () =>
      implApi.list({
        status: (status as ImplStatus) || undefined,
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      }).then((r) => ({
        data: r.data,
        total: parseInt((r as any).headers?.['x-total-count'] ?? String(r.data.length), 10),
      })),
    placeholderData: (prev) => prev,
  });

  const totalPages = Math.ceil((data?.total ?? 0) / PAGE_SIZE);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-white">Implementation Talepleri</h1>

      {/* Filtre */}
      <div className="flex items-center gap-3">
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value as ImplStatus | ''); setPage(0); }}
          className="rounded-lg border border-white/10 bg-[hsl(222,47%,11%)] py-2 pl-3 pr-8 text-sm text-white outline-none focus:border-violet-500"
        >
          <option value="">Tüm Durumlar</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => (
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
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-400">Domain</th>
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
                    Talep bulunamadı
                  </td>
                </tr>
              )}
              {data?.data.map((req) => (
                <tr
                  key={req.id}
                  className={`transition-colors hover:bg-white/5 ${isFetching ? 'opacity-60' : ''}`}
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/implementation/${req.id}`}
                      className="font-medium text-violet-300 hover:text-violet-200 hover:underline"
                    >
                      {req.domain}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{req.email}</td>
                  <td className="px-4 py-3 text-slate-300">{req.package_slug ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[req.status as ImplStatus] ?? 'bg-white/10 text-white'}`}>
                      {STATUS_LABELS[req.status as ImplStatus] ?? req.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400">{formatDate(req.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sayfalama */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">Toplam {data?.total ?? 0} sonuç</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-sm text-slate-300 transition-colors hover:bg-white/5 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
              Önceki
            </button>
            <span className="text-sm text-slate-400">{page + 1} / {totalPages}</span>
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
