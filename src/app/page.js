'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Calendar, MapPin, Users, Target, Rocket, Send } from 'lucide-react';
import ApplicationModal from '@/components/ApplicationModal';

export default function Home() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        setSettings(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="container">Yükleniyor...</div>;

  return (
    <div className="container">
      {/* Hero Section */}
      <section style={{ 
        minHeight: '80vh', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center', 
        textAlign: 'center',
        padding: '4rem 0',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle at center, rgba(197, 160, 89, 0.05) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: -1
        }} />

        <span style={{ 
          color: 'var(--primary)', 
          fontWeight: '700', 
          textTransform: 'uppercase', 
          letterSpacing: '0.4em',
          fontSize: '0.9rem',
          marginBottom: '1.5rem',
          display: 'block'
        }}>
          {settings?.dateAndLocation || '2026 | İstanbul'}
        </span>
        
        <h1 className="section-title" style={{ maxWidth: '900px', margin: '0 auto 2rem auto' }}>
          {settings?.workshopName || 'Lise Çalıştayı'}
        </h1>
        
        <p style={{ 
          fontSize: '1.25rem', 
          opacity: 0.7, 
          maxWidth: '700px', 
          margin: '0 auto 3rem auto',
          lineHeight: '1.8'
        }}>
          {settings?.shortDescription || 'Geleceğin liderlerini yetiştiren, akademik derinliğe sahip prestijli bir platform.'}
        </p>
        

        <div style={{ marginTop: '2rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/committees" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
            Komiteleri Keşfet <ArrowRight size={20} />
          </Link>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn" 
            style={{ 
              padding: '1rem 2rem', 
              fontSize: '1.1rem', 
              background: 'rgba(255,255,255,0.05)', 
              color: 'white',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            Hemen Başvur <Send size={20} />
          </button>
        </div>
      </section>

      {/* Why Join Section */}
      <section className="glass" style={{ padding: '3rem', marginTop: '2rem', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '2rem' }}>Neden Katılmalısın?</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem' }}>
          {settings?.highlights && settings.highlights.length > 0 ? (
            settings.highlights.map((h, idx) => (
              <div key={idx}>
                {h.isNumeric ? (
                  <h2 style={{ color: 'var(--primary)', fontSize: '2.5rem' }}>{h.value}</h2>
                ) : null}
                <p style={{ 
                  fontSize: h.isNumeric ? '1rem' : '1.2rem', 
                  fontWeight: h.isNumeric ? 'normal' : '600',
                  marginTop: h.isNumeric ? '0' : '1rem'
                }}>{h.title}</p>
                {!h.isNumeric && h.value && (
                  <p style={{ opacity: 0.7, fontSize: '0.9rem', marginTop: '0.5rem' }}>{h.value}</p>
                )}
              </div>
            ))
          ) : (
            <>
              <div>
                <h2 style={{ color: 'var(--primary)', fontSize: '2.5rem' }}>4</h2>
                <p>Akademik Komite</p>
              </div>
              <div>
                <h2 style={{ color: 'var(--primary)', fontSize: '2.5rem' }}>100+</h2>
                <p>Delege Katılımı</p>
              </div>
              <div>
                <h2 style={{ color: 'var(--primary)', fontSize: '2.5rem' }}>3</h2>
                <p>Günlük Etkinlik</p>
              </div>
              <div>
                <h2 style={{ color: 'var(--primary)', fontSize: '2.5rem' }}>∞</h2>
                <p>Deneyim ve Network</p>
              </div>
            </>
          )}
        </div>
      </section>

      <ApplicationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        committeeName={settings?.workshopName || 'GalÇal'}
        message={settings?.globalApplicationMessage}
        email={settings?.globalApplicationEmail}
        url={settings?.globalApplicationUrl}
      />
    </div>
  );
}
