'use client';

import { X, Send, Mail, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';

const ModalCountdown = ({ date }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      const target = new Date(date).getTime();
      const now = new Date().getTime();
      const distance = target - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [date]);

  return (
    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', background: 'rgba(197, 160, 89, 0.1)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid rgba(197, 160, 89, 0.2)' }}>
      <Clock size={16} color="var(--primary)" />
      <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>Son Başvuruya: </span>
      <span style={{ fontSize: '1rem', color: 'var(--primary)', fontWeight: '800' }}>
        {timeLeft.days} Gün {timeLeft.hours} Saat
      </span>
    </div>
  );
};

export default function ApplicationModal({ isOpen, onClose, committeeName, message, email, url, deadline, expiredMessage }) {
  if (!isOpen) return null;

  const isExpired = deadline ? new Date(deadline).getTime() < new Date().getTime() : false;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }} onClick={onClose}>
      <div className="glass card" style={{
        maxWidth: '500px',
        width: '100%',
        padding: '2.5rem',
        position: 'relative',
        animation: 'modalFadeIn 0.3s ease-out',
        border: isExpired ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid var(--glass-border)'
      }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{
          position: 'absolute',
          top: '1.5rem',
          right: '1.5rem',
          background: 'none',
          border: 'none',
          color: 'var(--text)',
          cursor: 'pointer',
          opacity: 0.6
        }}>
          <X size={24} />
        </button>

        <div style={{ textAlign: 'center' }}>
          <div style={{
            background: isExpired ? '#ef4444' : 'linear-gradient(135deg, var(--primary), #b38f4d)',
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem'
          }}>
            <Send size={30} color={isExpired ? 'white' : 'black'} />
          </div>
          
          <h2 style={{ marginBottom: '1rem', fontSize: '1.8rem', color: isExpired ? '#ef4444' : 'inherit' }}>
            {isExpired ? 'Başvurular Kapandı' : `${committeeName} Başvuru`}
          </h2>

          {isExpired ? (
            <p style={{ opacity: 0.9, lineHeight: '1.6', marginBottom: '2rem', fontSize: '1.1rem', color: '#ef4444', fontWeight: '500' }}>
              {expiredMessage || 'Başvuru süresi dolmuştur.'}
            </p>
          ) : (
            <div style={{ marginBottom: '2rem' }}>
              <p style={{ 
                opacity: 0.9, 
                lineHeight: '1.6', 
                marginBottom: '1rem',
                fontSize: '1.05rem' 
              }}>
                {message || 'Bu komiteye başvurmak için aşağıdaki formu doldurabilirsiniz.'}
              </p>
              
              {deadline && (
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '0.5rem' }}>
                  <ModalCountdown date={deadline} />
                </div>
              )}
            </div>
          )}

          {!isExpired && (
            <a 
              href={url || '#'} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn btn-primary" 
              style={{ 
                width: '100%', 
                fontSize: '1rem', 
                display: 'inline-flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '0.5rem' 
              }}
            >
              Başvuru Formuna Git <Send size={18} />
            </a>
          )}

          <button className="btn" onClick={onClose} style={{ marginTop: '1.5rem', width: '100%', border: '1px solid rgba(255,255,255,0.1)' }}>
            Kapat
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes modalFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
