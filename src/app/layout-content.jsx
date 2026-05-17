'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X, Sun, Moon } from 'lucide-react';

export default function RootLayoutContent({ children }) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin') && pathname !== '/admin-login';
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(err => console.error('Settings fetch error:', err));

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Ana Sayfa', href: '/' },
    { name: 'Komiteler', href: '/committees' },
    { name: 'Yönetim Kurulu', href: '/board' },
  ];

  return (
    <>
      <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          {/* Logo Area */}
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {settings?.showFaviconInNavbar && settings?.faviconUrl && (
              <img 
                src={settings.faviconUrl} 
                alt="Logo" 
                style={{ 
                  width: `${settings.navbarLogoSize || 32}px`, 
                  height: `${settings.navbarLogoSize || 32}px`, 
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 0 8px rgba(var(--primary-rgb), 0.3))'
                }} 
              />
            )}
            <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary)', letterSpacing: '-1px' }}>
              {settings?.siteName || 'GalÇal'}
            </span>
          </Link>
          
          {/* Desktop Nav */}
          <ul style={{ display: 'flex', listStyle: 'none', gap: '2.5rem', alignItems: 'center' }} className="desktop-nav">
            {navLinks.map(link => (
              <li key={link.href}>
                <Link 
                  href={link.href} 
                  style={{ 
                    color: pathname === link.href ? 'var(--primary)' : 'var(--text-dim)',
                    textDecoration: 'none',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    transition: 'var(--transition)'
                  }}
                >
                  {link.name}
                </Link>
              </li>
            ))}
            {isAdminPage && (
              <li>
                <Link href="/admin" className="btn btn-primary" style={{ padding: '0.5rem 1.2rem', fontSize: '0.8rem' }}>Panel</Link>
              </li>
            )}
          </ul>

          {/* Mobile Toggle */}
          <button 
            className="mobile-btn" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'none' }}
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh', 
          background: 'var(--bg-dark)', zIndex: 999, display: 'flex', flexDirection: 'column', 
          justifyContent: 'center', alignItems: 'center', gap: '2rem' 
        }}>
          {navLinks.map(link => (
            <Link 
              key={link.href}
              href={link.href} 
              onClick={() => setIsMenuOpen(false)}
              style={{ fontSize: '2rem', fontWeight: '800', color: 'white', textDecoration: 'none' }}
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}

      <main style={{ paddingTop: 'var(--nav-height)' }}>
        {children}
      </main>

      <footer style={{ padding: '5rem 0', borderTop: '1px solid var(--border-light)', marginTop: '4rem' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>{settings?.workshopName || 'GalÇal 2026'}</h2>
            <p style={{ opacity: 0.5, maxWidth: '500px', margin: '0 auto' }}>{settings?.shortDescription}</p>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '2rem' }}>
            <a href={settings?.instagramUrl} target="_blank" style={{ color: 'white', opacity: 0.6, textDecoration: 'none' }}>Instagram</a>
            <Link href="/committees" style={{ color: 'white', opacity: 0.6, textDecoration: 'none' }}>Komiteler</Link>
            <Link href="/board" style={{ color: 'white', opacity: 0.6, textDecoration: 'none' }}>Yönetim Kurulu</Link>
          </div>
          <p style={{ fontSize: '0.8rem', opacity: 0.3 }}>© 2026 Galatasaray Lisesi Çalıştayı. Tüm hakları saklıdır.</p>
        </div>
      </footer>

      <style jsx>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-btn { display: block !important; }
        }
      `}</style>
    </>
  );
}
