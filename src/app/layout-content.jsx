'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X, Sun, Moon } from 'lucide-react';

export default function RootLayoutContent({ children }) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin') && pathname !== '/admin-login';
  const [isScrolled, setIsScrolled] = useState(false);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const [settings, setSettings] = useState(null);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data) setSettings(data);
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <nav className={`navbar ${isScrolled ? 'glass' : ''}`} style={{ background: isScrolled ? 'var(--glass-bg)' : 'transparent' }}>
        <div className="container navbar-content">
          <Link href="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>
            {settings?.siteName || 'GalÇal 26'}
          </Link>
          
          <ul className="nav-links">
            <li><Link href="/" className="nav-link">Ana Sayfa</Link></li>
            <li><Link href="/committees" className="nav-link">Komiteler</Link></li>
            <li><Link href="/board" className="nav-link">Yönetim Kurulu</Link></li>
            {isAdminPage && <li><Link href="/admin" className="nav-link" style={{color: 'var(--primary)'}}>Panel</Link></li>}
          </ul>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button onClick={toggleTheme} className="btn" style={{ padding: '0.5rem', background: 'none' }}>
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
          </div>
        </div>
      </nav>

      <main style={{ paddingTop: '100px', minHeight: 'calc(100vh - 200px)' }}>
        {children}
      </main>

      <footer className="footer" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '4rem' }}>
        <div className="container">
          <p>© 2026 {settings?.workshopName || 'Lise Çalıştayı'}</p>
          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
            <Link 
              href={settings?.instagramUrl || '#'} 
              target="_blank" 
              className="nav-link"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.8 }}
            >
              Instagram
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}
