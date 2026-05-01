'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Calendar, MapPin, Users, Target, Rocket, Send, Clock } from 'lucide-react';
import ApplicationModal from '@/components/ApplicationModal';

const Countdown = ({ date, expiredMessage, happeningMessage, durationDays }) => {
  const [status, setStatus] = useState({ timeLeft: null, isExpired: false, isHappening: false });

  useEffect(() => {
    const timer = setInterval(() => {
      const target = new Date(date).getTime();
      const now = new Date().getTime();
      const distance = target - now;
      
      const durationMs = (durationDays || 3) * 24 * 60 * 60 * 1000;
      const endOfWorkshop = target + durationMs;

      if (now >= target && now < endOfWorkshop) {
        setStatus({ isExpired: false, isHappening: true, timeLeft: null });
      } else if (now >= endOfWorkshop) {
        setStatus({ isExpired: true, isHappening: false, timeLeft: null });
      } else {
        setStatus({
          isExpired: false,
          isHappening: false,
          timeLeft: {
            days: Math.floor(distance / (1000 * 60 * 60 * 24)),
            hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((distance % (1000 * 60)) / 1000),
          }
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [date, durationDays]);

  if (status.isHappening) {
    return (
      <div className="glass" style={{ padding: '1rem 2.5rem', borderRadius: '50px', display: 'inline-flex', alignItems: 'center', gap: '0.75rem', border: '1px solid var(--primary)', color: 'var(--primary)', animation: 'pulse-gold 2s infinite' }}>
        <Rocket size={20} /> <span style={{ fontWeight: '700', fontSize: '1.2rem' }}>{happeningMessage || 'Etkinlik şu anda gerçekleşiyor!'}</span>
      </div>
    );
  }

  if (status.isExpired) {
    return (
      <div className="glass" style={{ padding: '0.5rem 1.5rem', borderRadius: '50px', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', border: '1px solid rgba(255, 255, 255, 0.1)', opacity: 0.6 }}>
        <span>Etkinlik Sona Erdi</span>
      </div>
    );
  }

  if (!status.timeLeft) return null;

  return (
    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem', flexWrap: 'wrap' }}>
      {[
        { label: 'Gün', value: status.timeLeft.days },
        { label: 'Saat', value: status.timeLeft.hours },
        { label: 'Dak', value: status.timeLeft.minutes },
        { label: 'Sn', value: status.timeLeft.seconds }
      ].map((item, idx) => (
        <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className="glass" style={{ 
            width: 'clamp(60px, 12vw, 80px)', 
            height: 'clamp(60px, 12vw, 80px)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontSize: 'clamp(1.2rem, 4vw, 2rem)', 
            fontWeight: '800',
            borderRadius: '12px',
            color: 'var(--primary)',
            marginBottom: '0.5rem',
            border: '1px solid rgba(197, 160, 89, 0.2)',
            boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
          }}>
            {item.value}
          </div>
          <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6 }}>{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export default function Home() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    fetch('/api/settings', { signal: controller.signal })
      .then(res => {
        if (!res.ok) throw new Error('Sunucu hatası: ' + res.status);
        return res.json();
      })
      .then(data => {
        setSettings(data);
        setLoading(false);
        clearTimeout(timeoutId);
      })
      .catch((err) => {
        console.error('Veri yükleme hatası:', err);
        setError(err.name === 'AbortError' ? 'İstek zaman aşımına uğradı' : err.message);
        setLoading(false);
      });

    return () => clearTimeout(timeoutId);
  }, []);

  if (loading) return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <div className="glass card" style={{ textAlign: 'center' }}>
        <h2 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Yükleniyor...</h2>
        <p style={{ opacity: 0.7 }}>Lütfen bekleyin, veriler getiriliyor.</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <div className="glass card" style={{ textAlign: 'center', borderColor: '#ff4d4d' }}>
        <h2 style={{ color: '#ff4d4d', marginBottom: '1rem' }}>Bağlantı Hatası</h2>
        <p style={{ opacity: 0.7, marginBottom: '1.5rem' }}>Veritabanına bağlanılamadı. Lütfen internet bağlantınızı veya MongoDB ayarlarınızı kontrol edin.</p>
        <button onClick={() => window.location.reload()} className="btn btn-primary">Yeniden Dene</button>
      </div>
    </div>
  );

  return (
    <div className="container" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Floating Lights Effect */}
      <div className="animate-float" style={{ position: 'absolute', top: '10%', left: '5%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(197, 160, 89, 0.08) 0%, transparent 70%)', borderRadius: '50%', zIndex: -1 }} />
      <div className="animate-float" style={{ position: 'absolute', bottom: '20%', right: '10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(197, 160, 89, 0.05) 0%, transparent 70%)', borderRadius: '50%', zIndex: -1, animationDelay: '-5s' }} />

      {/* Hero Section */}
      <section style={{ 
        minHeight: '85vh', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center', 
        textAlign: 'center',
        padding: '4rem 0',
        position: 'relative'
      }}>
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
        
        <h1 className="section-title gradient-text" style={{ maxWidth: '900px', margin: '0 auto 2rem auto', fontSize: 'clamp(2.5rem, 8vw, 4.5rem)' }}>
          {settings?.workshopName || 'Lise Çalıştayı'}
        </h1>
        
        <p style={{ 
          fontSize: '1.25rem', 
          opacity: 0.7, 
          maxWidth: '700px', 
          margin: '0 auto 2.5rem auto',
          lineHeight: '1.8'
        }}>
          {settings?.shortDescription || 'Geleceğin liderlerini yetiştiren, akademik derinliğe sahip prestijli bir platform.'}
        </p>

        {/* Countdown Timer (Workshop Start) */}
        {settings?.workshopStartDate && (
          <Countdown 
            date={settings.workshopStartDate} 
            happeningMessage={settings.workshopHappeningMessage}
            durationDays={settings.workshopDurationDays}
          />
        )}
        
        <div style={{ marginTop: '3rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/committees" className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem', borderRadius: '50px' }}>
            Komiteleri Keşfet <ArrowRight size={20} />
          </Link>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn" 
            style={{ 
              padding: '1rem 2.5rem', 
              fontSize: '1.1rem', 
              background: 'var(--glass-bg)', 
              color: 'var(--text)',
              border: '1px solid var(--glass-border)',
              borderRadius: '50px',
              transition: 'var(--transition)'
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
        deadline={settings?.applicationDeadline}
        expiredMessage={settings?.deadlineExpiredMessage}
      />
    </div>
  );
}
