'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';
import { getMyAnalyses, type MyAnalysis } from '@/lib/api';
import { User, Mail, Shield, ExternalLink, FileText, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';

const STATUS_LABEL: Record<string, string> = {
  free: 'Ücretsiz',
  pending: 'Bekliyor',
  processing: 'İşleniyor',
  completed: 'Tamamlandı',
  failed: 'Hatalı',
};

const STATUS_COLOR: Record<string, string> = {
  free: 'text-blue-400 bg-blue-400/10',
  pending: 'text-amber-400 bg-amber-400/10',
  processing: 'text-cyan-400 bg-cyan-400/10',
  completed: 'text-emerald-400 bg-emerald-400/10',
  failed: 'text-red-400 bg-red-400/10',
};

export function AccountClient() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);

  const [analyses, setAnalyses] = useState<MyAnalysis[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (hydrated && !user) router.replace('/giris');
  }, [hydrated, user, router]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    getMyAnalyses(page)
      .then((data) => {
        setAnalyses(data.items);
        setTotal(data.total);
        setPages(data.pages);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, page]);

  if (!hydrated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }
  if (!user) return null;

  const initials = user.full_name
    ? user.full_name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
    : user.email[0].toUpperCase();

  return (
    <div className="container py-12">
      <h1 className="mb-8 text-2xl font-bold text-foreground">Hesabım</h1>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Profil kartı */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-xl font-bold">
              {initials}
            </div>
            <h2 className="text-base font-semibold text-foreground">{user.full_name || '—'}</h2>
            <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Mail size={12} />
              <span className="truncate">{user.email}</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Shield size={12} />
              {user.role === 'admin' ? 'Yönetici' : 'Üye'}
            </div>
            <div className="mt-4 border-t border-border pt-4">
              <div className="text-xs text-muted-foreground">Toplam Analiz</div>
              <div className="text-2xl font-bold text-foreground">{total}</div>
            </div>
          </div>
        </div>

        {/* Analiz listesi */}
        <div className="lg:col-span-3">
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">Analizlerim</h2>
              <Link
                href="/analyze"
                className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-600 transition-colors"
              >
                + Yeni Analiz
              </Link>
            </div>

            {loading ? (
              <div className="flex h-40 items-center justify-center">
                <RefreshCw size={20} className="animate-spin text-muted-foreground" />
              </div>
            ) : analyses.length === 0 ? (
              <div className="flex h-40 flex-col items-center justify-center gap-3 text-center">
                <p className="text-sm text-muted-foreground">Henüz analiz yapmadınız.</p>
                <Link href="/analyze" className="text-sm text-emerald-400 hover:underline">
                  İlk analizinizi başlatın →
                </Link>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-xs text-muted-foreground">
                        <th className="pb-3 font-medium">Domain</th>
                        <th className="pb-3 font-medium">Paket</th>
                        <th className="pb-3 font-medium">GEO</th>
                        <th className="pb-3 font-medium">Durum</th>
                        <th className="pb-3 font-medium">Tarih</th>
                        <th className="pb-3 font-medium text-right">İşlem</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {analyses.map((a) => (
                        <tr key={a.id} className="hover:bg-muted/30 transition-colors">
                          <td className="py-3">
                            <div className="font-medium text-foreground">{a.domain}</div>
                            <div className="text-xs text-muted-foreground truncate max-w-[180px]">{a.url}</div>
                          </td>
                          <td className="py-3 text-xs text-muted-foreground capitalize">{a.package_slug}</td>
                          <td className="py-3">
                            {a.geo_score != null ? (
                              <span className="font-mono font-semibold text-emerald-400">{a.geo_score}</span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="py-3">
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[a.status] ?? ''}`}>
                              {STATUS_LABEL[a.status] ?? a.status}
                            </span>
                          </td>
                          <td className="py-3 text-xs text-muted-foreground">
                            {new Date(a.created_at).toLocaleDateString('tr-TR')}
                          </td>
                          <td className="py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                href={`/analyze?id=${a.id}`}
                                className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors"
                                title="Görüntüle"
                              >
                                <ExternalLink size={12} />
                              </Link>
                              {a.pdf_ready && (
                                <a
                                  href={`/api/v1/analyze/${a.id}/download`}
                                  className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                                  title="PDF İndir"
                                >
                                  <FileText size={12} />
                                </a>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Sayfalama */}
                {pages > 1 && (
                  <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                    <span className="text-xs text-muted-foreground">{total} analiz</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-border disabled:opacity-40 hover:bg-muted transition-colors"
                      >
                        <ChevronLeft size={14} />
                      </button>
                      <span className="text-xs text-muted-foreground">{page} / {pages}</span>
                      <button
                        onClick={() => setPage((p) => Math.min(pages, p + 1))}
                        disabled={page === pages}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-border disabled:opacity-40 hover:bg-muted transition-colors"
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
