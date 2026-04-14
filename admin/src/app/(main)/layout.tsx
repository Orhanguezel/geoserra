import { Sidebar } from '@/components/layout/sidebar';
import { AuthGuard } from '@/components/auth-guard';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
