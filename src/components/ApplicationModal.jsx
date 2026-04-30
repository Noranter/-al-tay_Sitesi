'use client';

import { X, Send, Mail } from 'lucide-react';

export default function ApplicationModal({ isOpen, onClose, committeeName, message, email, url }) {
  if (!isOpen) return null;

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
        animation: 'modalFadeIn 0.3s ease-out'
      }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{
          position: 'absolute',
          top: '1.5rem',
          right: '1.5rem',
          background: 'none',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          opacity: 0.6
        }}>
          <X size={24} />
        </button>

        <div style={{ textAlign: 'center' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--primary), #b38f4d)',
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem'
          }}>
            <Send size={30} color="black" />
          </div>
          
          <h2 style={{ marginBottom: '1rem', fontSize: '1.8rem' }}>{committeeName} Başvuru</h2>
          
          <p style={{ 
            opacity: 0.9, 
            lineHeight: '1.6', 
            marginBottom: '2rem',
            fontSize: '1.05rem' 
          }}>
            {message || 'Bu komiteye başvurmak için aşağıdaki formu doldurabilirsiniz.'}
          </p>

          {url ? (
            <a href={url} target="_blank" className="btn btn-primary" style={{ width: '100%', fontSize: '1rem' }}>
              Başvuru Formuna Git <Send size={18} />
            </a>
          ) : (
            <div className="glass" style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.75rem',
              background: 'rgba(255, 255, 255, 0.05)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                <Mail size={20} />
                <span style={{ fontWeight: '600' }}>İletişim E-postası:</span>
              </div>
              <a href={`mailto:${email}`} style={{ 
                fontSize: '1.2rem', 
                color: 'white', 
                textDecoration: 'none',
                fontWeight: 'bold',
                borderBottom: '2px solid var(--primary)'
              }}>
                {email || 'iletisim@galcal.com'}
              </a>
            </div>
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
