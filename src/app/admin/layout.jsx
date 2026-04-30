'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Settings, Users, ClipboardList, LogOut, LayoutDashboard } from 'lucide-react';

export default function AdminLayout({ children }) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' });
    router.push('/admin-login');
  };

  return (
    <div className="container" style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2rem', paddingBottom: '4rem' }}>
      <aside>
        <div className="glass" style={{ padding: '1.5rem', position: 'sticky', top: '100px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <h3 style={{ marginBottom: '1rem', paddingLeft: '0.5rem', opacity: 0.7, fontSize: '0.9rem', textTransform: 'uppercase' }}>Menü</h3>
          
          <Link href="/admin" className="btn" style={{ width: '100%', justifyContent: 'flex-start', background: 'none' }}>
            <LayoutDashboard size={18} /> Genel Durum
          </Link>
          
          <Link href="/admin/settings" className="btn" style={{ width: '100%', justifyContent: 'flex-start', background: 'none' }}>
            <Settings size={18} /> Site Ayarları
          </Link>
          
          <Link href="/admin/committees" className="btn" style={{ width: '100%', justifyContent: 'flex-start', background: 'none' }}>
            <ClipboardList size={18} /> Komiteler
          </Link>
          
          <Link href="/admin/board" className="btn" style={{ width: '100%', justifyContent: 'flex-start', background: 'none' }}>
            <Users size={18} /> Yönetim Kurulu
          </Link>

          <hr style={{ margin: '1rem 0', border: 'none', borderTop: '1px solid var(--glass-border)' }} />

          <button onClick={handleLogout} className="btn" style={{ width: '100%', justifyContent: 'flex-start', background: 'none', color: '#ef4444' }}>
            <LogOut size={18} /> Çıkış Yap
          </button>
        </div>
      </aside>

      <section>
        {children}
      </section>
    </div>
  );
}
