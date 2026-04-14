'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Search,
  Wrench,
  LogOut,
  Activity,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { authApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/analyses', label: 'Analizler', icon: Search },
  { href: '/implementation', label: 'Implementation', icon: Wrench },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const router = useRouter();

  async function handleLogout() {
    try {
      await authApi.logout();
    } catch {}
    logout();
    router.push('/login');
    toast.success('Çıkış yapıldı');
  }

  return (
    <aside className="flex h-screen w-56 flex-col border-r border-white/10 bg-[hsl(222,47%,9%)]">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2 border-b border-white/10 px-4">
        <Activity className="h-5 w-5 text-violet-400" />
        <span className="text-sm font-semibold text-white">GeoSerra Admin</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-violet-600/20 text-violet-300'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white',
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="border-t border-white/10 p-3">
        <div className="mb-2 truncate px-2 text-xs text-slate-500">{user?.email}</div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-400 transition-colors hover:bg-white/5 hover:text-red-400"
        >
          <LogOut className="h-4 w-4" />
          Çıkış Yap
        </button>
      </div>
    </aside>
  );
}
