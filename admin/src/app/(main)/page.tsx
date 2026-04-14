'use client';

import { useQuery } from '@tanstack/react-query';
import { statsApi, analysesApi, implApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import {
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  Wrench,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';

function StatCard({
  label,
  value,
  icon: Icon,
  color = 'violet',
}: {
  label: string;
  value: number | undefined;
  icon: React.ElementType;
  color?: 'violet' | 'green' | 'red' | 'yellow' | 'blue';
}) {
  const colors = {
    violet: 'text-violet-400 bg-violet-500/10',
    green: 'text-green-400 bg-green-500/10',
    red: 'text-red-400 bg-red-500/10',
    yellow: 'text-yellow-400 bg-yellow-500/10',
    blue: 'text-blue-400 bg-blue-500/10',
  };
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{label}</p>
        <div className={`rounded-lg p-2 ${colors[color]}`}>
          <Icon className={`h-4 w-4 ${colors[color].split(' ')[0]}`} />
        </div>
      </div>
      <p className="mt-2 text-2xl font-bold text-white">
        {value ?? '—'}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    free: 'bg-slate-500/20 text-slate-300',
    pending: 'bg-yellow-500/20 text-yellow-300',
    processing: 'bg-blue-500/20 text-blue-300',
    completed: 'bg-green-500/20 text-green-300',
    failed: 'bg-red-500/20 text-red-300',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${map[status] ?? 'bg-white/10 text-white'}`}>
      {status}
    </span>
  );
}

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => statsApi.get().then((r) => r.data),
    refetchInterval: 30_000,
  });

  const { data: recentAnalyses } = useQuery({
    queryKey: ['admin-analyses-recent'],
    queryFn: () => analysesApi.list({ limit: 5, order: 'desc' }).then((r) => r.data),
  });

  const { data: pendingImpl } = useQuery({
    queryKey: ['admin-impl-pending'],
    queryFn: () => implApi.list({ status: 'pending', limit: 5 }).then((r) => r.data),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Dashboard</h1>
        <span className="text-xs text-slate-500">Her 30 sn. güncellenir</span>
      </div>

      {/* Stat kartları */}
      {statsLoading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-white/5" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          <StatCard label="Toplam Analiz" value={stats?.total_analyses} icon={Search} color="violet" />
          <StatCard label="Tamamlanan" value={stats?.completed_analyses} icon={CheckCircle2} color="green" />
          <StatCard label="Başarısız" value={stats?.failed_analyses} icon={XCircle} color="red" />
          <StatCard label="İşlemde / Bekleyen" value={stats?.pending_analyses} icon={Clock} color="yellow" />
          <StatCard label="Ücretli Analiz" value={stats?.paid_analyses} icon={DollarSign} color="blue" />
          <StatCard label="Bekleyen Implementation" value={stats?.pending_implementations} icon={Wrench} color="yellow" />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Son Analizler */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Son Analizler</h2>
            <Link href="/analyses" className="text-xs text-violet-400 hover:text-violet-300">
              Tümünü gör →
            </Link>
          </div>
          <div className="space-y-2">
            {recentAnalyses?.length === 0 && (
              <p className="py-4 text-center text-sm text-slate-500">Analiz yok</p>
            )}
            {recentAnalyses?.map((a) => (
              <Link
                key={a.id}
                href={`/analyses/${a.id}`}
                className="flex items-center justify-between rounded-lg px-3 py-2 transition-colors hover:bg-white/5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm text-white">{a.url}</p>
                  <p className="truncate text-xs text-slate-500">{a.email}</p>
                </div>
                <div className="ml-3 flex flex-shrink-0 flex-col items-end gap-1">
                  <StatusBadge status={a.status} />
                  <span className="text-xs text-slate-500">{formatDate(a.created_at)}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Bekleyen Implementation */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Bekleyen Implementation</h2>
            <Link href="/implementation" className="text-xs text-violet-400 hover:text-violet-300">
              Tümünü gör →
            </Link>
          </div>
          <div className="space-y-2">
            {pendingImpl?.length === 0 && (
              <p className="py-4 text-center text-sm text-slate-500">Bekleyen talep yok</p>
            )}
            {pendingImpl?.map((req) => (
              <Link
                key={req.id}
                href={`/implementation/${req.id}`}
                className="flex items-center justify-between rounded-lg px-3 py-2 transition-colors hover:bg-white/5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm text-white">{req.domain}</p>
                  <p className="truncate text-xs text-slate-500">{req.email} · {req.package_slug}</p>
                </div>
                <span className="ml-3 flex-shrink-0 text-xs text-slate-500">{formatDate(req.created_at)}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
