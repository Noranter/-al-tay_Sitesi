'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';

export default function Committees() {
  const [committees, setCommittees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/committees')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCommittees(data);
        } else {
          console.error('API did not return an array:', data);
          setCommittees([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Fetch error:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="container">Yükleniyor...</div>;

  return (
    <div className="container">
      <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <h1 className="section-title">Akademik Komiteler</h1>
        <p style={{ opacity: 0.8, fontSize: '1.2rem' }}>Çalıştayımız bünyesinde yer alan 4 ana komite ve detayları.</p>
      </header>

      {committees.length === 0 ? (
        <div className="glass" style={{ padding: '3rem', textAlign: 'center' }}>
          <p>Henüz komite eklenmemiş.</p>
          <Link href="/admin" className="btn btn-primary" style={{marginTop: '1rem'}}>Admin Panelinden Ekle</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          {committees.map((committee) => (
            <div key={committee._id} className="glass card" style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '1.25rem',
              height: '100%' 
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h2 style={{ fontSize: '1.5rem' }}>{committee.name}</h2>
                <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '0.5rem', borderRadius: '8px' }}>
                  <BookOpen size={20} color="var(--primary)" />
                </div>
              </div>
              <p style={{ opacity: 0.8, fontSize: '0.95rem', flexGrow: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {committee.description}
              </p>
              <Link href={`/committees/${committee._id}`} className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: '1rem' }}>
                Detayları Gör <ArrowRight size={18} />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
