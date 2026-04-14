'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Activity, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';

const schema = z.object({
  email: z.string().email('Geçerli e-posta girin'),
  password: z.string().min(1, 'Şifre zorunlu'),
});
type Form = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: Form) {
    setLoading(true);
    try {
      const res = await authApi.login(data.email, data.password);
      setUser(res.data.user ?? res.data);
      toast.success('Giriş başarılı');
      router.replace('/');
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message ?? 'Giriş başarısız';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[hsl(222,47%,6%)] px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-600">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">GeoSerra Admin</h1>
          <p className="text-sm text-slate-400">Yönetim paneline giriş yapın</p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 rounded-xl border border-white/10 bg-[hsl(222,47%,11%)] p-6"
        >
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-300">E-posta</label>
            <input
              type="email"
              autoComplete="email"
              {...register('email')}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
              placeholder="admin@geoserra.com"
            />
            {errors.email && (
              <p className="text-xs text-red-400">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-300">Şifre</label>
            <input
              type="password"
              autoComplete="current-password"
              {...register('password')}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="text-xs text-red-400">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-violet-700 disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Giriş Yap
          </button>
        </form>
      </div>
    </div>
  );
}
