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
    <div className="container" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '3rem', paddingBottom: '4rem', paddingTop: '2rem' }}>
      <aside>
        <div className="glass card" style={{ padding: '1.5rem', position: 'sticky', top: '100px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ padding: '0 0.5rem 1rem 0.5rem', borderBottom: '1px solid var(--glass-border)', marginBottom: '0.5rem' }}>
            <h3 style={{ color: 'var(--primary)', fontSize: '1.1rem', fontWeight: '800' }}>Admin Panel</h3>
            <p style={{ fontSize: '0.75rem', opacity: 0.6 }}>İçerik Yönetim Sistemi</p>
          </div>
          
          <Link href="/admin" className="btn" style={{ width: '100%', justifyContent: 'flex-start', background: 'none', padding: '0.75rem 1rem' }}>
            <LayoutDashboard size={18} /> Genel Durum
          </Link>
          
          <Link href="/admin/settings" className="btn" style={{ width: '100%', justifyContent: 'flex-start', background: 'none', padding: '0.75rem 1rem' }}>
            <Settings size={18} /> Site Ayarları
          </Link>
          
          <Link href="/admin/committees" className="btn" style={{ width: '100%', justifyContent: 'flex-start', background: 'none', padding: '0.75rem 1rem' }}>
            <ClipboardList size={18} /> Komiteler
          </Link>
          
          <Link href="/admin/board" className="btn" style={{ width: '100%', justifyContent: 'flex-start', background: 'none', padding: '0.75rem 1rem' }}>
            <Users size={18} /> Yönetim Kurulu
          </Link>

          <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
            <button onClick={handleLogout} className="btn" style={{ width: '100%', justifyContent: 'flex-start', background: 'rgba(239, 68, 68, 0.05)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
              <LogOut size={18} /> Çıkış Yap
            </button>
          </div>
        </div>
      </aside>

      <section>
        {children}
      </section>
    </div>
  );
}
