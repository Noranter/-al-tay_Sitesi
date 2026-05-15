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
            <div key={member._id} className="glass card member-card-wrapper" style={{ 
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
                background: 'linear-gradient(135deg, var(--primary), #b38f4d)',
                padding: '4px',
                marginBottom: '2rem',
                boxShadow: '0 15px 35px rgba(0,0,0,0.3)',
                transition: 'transform 0.4s ease'
              }} className="member-image-container">
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
                    <User size={64} color="var(--primary)" style={{ opacity: 0.3 }} />
                  )}
                </div>
              </div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '0.75rem', letterSpacing: '-0.5px' }}>{member.name}</h2>
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: '0.5rem', 
                padding: '0 1rem'
              }}>
                {member.roles?.map(role => (
                  <div key={role._id} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.4rem', 
                    color: 'var(--primary)', 
                    fontWeight: '700',
                    background: 'rgba(197, 160, 89, 0.1)',
                    padding: '4px 12px',
                    borderRadius: '30px',
                    fontSize: '0.75rem',
                    border: '1px solid rgba(197, 160, 89, 0.2)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    <ShieldCheck size={14} />
                    <span>{role.name}</span>
                  </div>
                ))}
                {(!member.roles || member.roles.length === 0) && (
                  <span style={{ opacity: 0.5, fontSize: '0.8rem italic' }}>Yönetim Kurulu Üyesi</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      <style jsx>{`
        .member-card-wrapper:hover .member-image-container {
          transform: scale(1.05) rotate(2deg);
        }
        .member-card-wrapper {
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .member-card-wrapper:hover {
          transform: translateY(-10px);
          background: rgba(255, 255, 255, 0.05) !important;
        }
      `}</style>
    </div>
  );
}
