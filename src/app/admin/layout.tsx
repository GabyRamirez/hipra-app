'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Users, FileText, LogOut, LayoutDashboard, ChevronRight } from 'lucide-react';
import Image from 'next/image';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    // Basic logout logic: clear cookie (simple way for now)
    document.cookie = 'admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    router.push('/admin/login');
  };

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { name: 'Treballadors', icon: Users, path: '/admin/workers' },
    { name: 'Resultats', icon: FileText, path: '/admin/results' },
  ];

  if (pathname === '/admin/login') {
    return <div className="min-h-screen bg-brand-bg">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-brand-bg flex">
      {/* Sidebar */}
      <aside className="w-64 bg-brand-navy text-white flex flex-col fixed inset-y-0 left-0 z-20">
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          <div className="bg-white p-1 rounded-lg">
             <Image src="/logo.png" alt="Logo" width={100} height={32} className="w-auto h-6" />
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 mt-4">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-brand-red text-white shadow-lg' 
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5" />
                  <span className="font-semibold text-sm">{item.name}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-all cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-semibold text-sm">Sortir</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8 relative">
        <div className="mesh-bg opacity-50" />
        <div className="relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
}
