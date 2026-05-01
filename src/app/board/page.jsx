'use client';

import { useState, useEffect } from 'react';
import { ShieldCheck, User } from 'lucide-react';

export default function Board() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/board')
      .then(res => {
        if (!res.ok) throw new Error('Sunucu hatası: ' + res.status);
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setMembers(data);
        } else {
          throw new Error('API geçersiz veri döndürdü');
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Yükleme hatası:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <div className="glass card" style={{ textAlign: 'center' }}>
        <h2 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Yükleniyor...</h2>
        <p style={{ opacity: 0.7 }}>Yönetim kurulu üyeleri getiriliyor.</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <div className="glass card" style={{ textAlign: 'center', borderColor: '#ff4d4d' }}>
        <h2 style={{ color: '#ff4d4d', marginBottom: '1rem' }}>Bağlantı Hatası</h2>
        <p style={{ opacity: 0.7, marginBottom: '1.5rem' }}>{error}</p>
        <button onClick={() => window.location.reload()} className="btn btn-primary">Yeniden Dene</button>
      </div>
    </div>
  );

  return (
    <div className="container">
      <header style={{ marginBottom: '4rem', textAlign: 'center' }}>
        <h1 className="section-title">Yönetim Kurulu</h1>
        <p style={{ opacity: 0.8, fontSize: '1.2rem' }}>Çalıştayı düzenleyen ve koordine eden ana ekip.</p>
      </header>

      {members.length === 0 ? (
        <div className="glass" style={{ padding: '3rem', textAlign: 'center' }}>
          <p>Henüz ekip üyesi eklenmemiş.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2.5rem' }}>
          {members.map((member) => (
            <div key={member._id} className="glass card" style={{ 
              textAlign: 'center', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '400px'
            }}>
              <div style={{ 
                width: '180px', 
                height: '180px', 
                borderRadius: '50%', 
                background: 'linear-gradient(135deg, var(--primary), #ec4899)',
                padding: '4px',
                marginBottom: '1.5rem'
              }}>
                <div style={{ 
                  width: '100%', 
                  height: '100%', 
                  borderRadius: '50%', 
                  overflow: 'hidden',
                  background: 'var(--bg-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {member.photoUrl ? (
                    <img src={member.photoUrl} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <User size={64} color="var(--primary)" style={{ opacity: 0.5 }} />
                  )}
                </div>
              </div>
              <h2 style={{ fontSize: '1.4rem', marginBottom: '0.25rem' }}>{member.name}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: '600' }}>
                <ShieldCheck size={18} />
                <span>{member.role}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
