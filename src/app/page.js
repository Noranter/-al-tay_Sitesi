'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link'; // EKSİK OLAN IMPORT BURADAYDI
import { ShieldCheck, ChevronRight, Globe, Sparkles, Zap, Star, Users, Award, BookOpen, Fingerprint, ArrowRight } from 'lucide-react';
import ApplicationModal from '../components/ApplicationModal';

// --- COUNTDOWN COMPONENT ---
const Countdown = ({ date, title, happeningMessage, durationDays }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isHappening, setIsHappening] = useState(false);

  useEffect(() => {
    if (!date) return;
    const timer = setInterval(() => {
      const start = new Date(date).getTime();
      const now = new Date().getTime();
      const end = start + (durationDays || 3) * 24 * 60 * 60 * 1000;

      if (now >= start && now <= end) {
        setIsHappening(true);
        clearInterval(timer);
      } else {
        const difference = start - now;
        if (difference > 0) {
          setTimeLeft({
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60)
          });
        }
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [date, durationDays]);

  if (!date) return null;

  return (
    <div style={{ textAlign: 'center', width: '100%', maxWidth: '700px', margin: '0 auto' }}>
      <div style={{ 
        display: 'inline-block', 
        padding: '10px 30px', 
        background: 'rgba(var(--primary-rgb), 0.1)', 
        borderRadius: '100px', 
        marginBottom: '2rem',
        border: '1px solid rgba(var(--primary-rgb), 0.2)'
      }}>
        <h3 style={{ fontSize: '0.8rem', color: 'var(--primary)', margin: 0, letterSpacing: '4px', textTransform: 'uppercase', fontWeight: '800' }}>
          {isHappening ? 'Süreç Devam Ediyor' : (title || 'Başlangıca Geri Sayım')}
        </h3>
      </div>
      
      {isHappening ? (
        <div className="glass" style={{ padding: '3rem 6rem', borderRadius: '40px' }}>
          <h2 className="gradient-text" style={{ margin: 0, fontSize: '2.5rem', fontWeight: '900' }}>
            ✨ {happeningMessage || 'ETKİNLİK ŞU ANDA GERÇEKLEŞİYOR!'} ✨
          </h2>
        </div>
      ) : (
        <div className="countdown-container">
          {[
            { label: 'GÜN', value: timeLeft.days },
            { label: 'SAAT', value: timeLeft.hours },
            { label: 'DAKİKA', value: timeLeft.minutes },
            { label: 'SANİYE', value: timeLeft.seconds }
          ].map((item, i) => (
            <div key={i} className="countdown-box">
              <span className="count-num">{String(item.value).padStart(2, '0')}</span>
              <span className="count-unit">{item.label}</span>
            </div>
          ))}
        </div>
      )}
      <style jsx>{`
        .countdown-container { display: flex; justify-content: center; gap: 2rem; padding: 1rem; }
        .countdown-box { display: flex; flex-direction: column; align-items: center; }
        .count-num { font-size: clamp(2.5rem, 6vw, 4.5rem); font-weight: 900; color: #fff; line-height: 1; font-family: 'Outfit', sans-serif; text-shadow: 0 0 30px rgba(var(--primary-rgb), 0.3); }
        .count-unit { font-size: 0.75rem; color: var(--primary); font-weight: 800; letter-spacing: 3px; margin-top: 0.5rem; }
        @media (max-width: 600px) { .countdown-container { gap: 1rem; } .count-num { font-size: 2.2rem; } }
      `}</style>
    </div>
  );
};

// --- MAIN HOME PAGE ---
export default function Home() {
  const [settings, setSettings] = useState(null);
  const [committees, setCommittees] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeCommittee, setActiveCommittee] = useState(null);

  useEffect(() => {
    fetch('/api/settings').then(res => res.json()).then(data => setSettings(data));
    fetch('/api/committees').then(res => res.json()).then(data => setCommittees(data));
  }, []);

  const featureIcons = [<Fingerprint size={40} />, <Zap size={40} />, <Users size={40} />, <Globe size={40} />];

  return (
    <div style={{ position: 'relative' }}>
      <div className="utopia-glow-bg" />

      <div className="container">
        {/* HERO SECTION */}
        <section style={{ minHeight: '95vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', position: 'relative', zIndex: 10 }}>
          <h1 className="gradient-text utopian-headline">
            {settings?.workshopName || 'Geleceği İnşa Et'}
          </h1>
          <p className="utopian-subline">
            {settings?.shortDescription || 'Gelenekle geleceğin buluştuğu noktada, yeni nesil bir ütopya deneyimi.'}
          </p>
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '8rem' }}>
            <button onClick={() => setIsModalOpen(true)} className="btn btn-primary utopian-btn">Hemen Başvur <ChevronRight size={22} /></button>
            <a href="/committees" className="btn btn-outline" style={{ padding: '1.2rem 4rem' }}>Keşfet</a>
          </div>
          <div className="animate-float">
            {settings && <Countdown date={settings.workshopStartDate} title="Yolculuğun Başlamasına" happeningMessage={settings.workshopHappeningMessage} durationDays={settings.workshopDurationDays} />}
          </div>
        </section>

        {/* --- SWINGING COMMITTEE SECTION --- */}
        {committees.length > 0 && (
          <section style={{ padding: '10rem 0', position: 'relative', overflow: 'visible' }}>
            <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
              <h2 style={{ fontSize: '1rem', color: 'var(--primary)', letterSpacing: '6px', textTransform: 'uppercase', marginBottom: '1rem' }}>Komitelerimizi Tanıyın</h2>
            </header>

            <div className="swing-container">
              <div className="anchor-sidebar">
                {committees.map((c) => (
                  <div 
                    key={c._id} 
                    className="swing-wrapper"
                    onMouseEnter={() => setActiveCommittee(c._id)}
                    onMouseLeave={() => setActiveCommittee(null)}
                    onClick={(e) => {
                      if (e.target.closest('a')) return;
                      setActiveCommittee(activeCommittee === c._id ? null : c._id);
                    }}
                  >
                    <div className={`swing-card ${activeCommittee === c._id ? 'pulled' : ''}`}>
                      <div className="rope" />
                      <div className="card-inner glass">
                        <div className="card-front">
                          <BookOpen size={24} />
                          <span>{c.name}</span>
                        </div>
                        {activeCommittee === c._id && (
                          <div className="card-content">
                            <h3>{c.name} Ütopyası</h3>
                            <p>{c.description}</p>
                            <Link href={`/committees/${c._id}`} className="mini-link">Detayları Gör <ArrowRight size={14} /></Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* REASONS SECTION */}
        <section style={{ paddingBottom: '15rem' }}>
          <header style={{ textAlign: 'center', marginBottom: '6rem' }}>
            <h2 style={{ fontSize: '1rem', color: 'var(--primary)', letterSpacing: '6px', textTransform: 'uppercase', marginBottom: '1rem' }}>{settings?.highlightsTitle || 'Neden Bizimle Olmalısın?'}</h2>
            <div style={{ width: '60px', height: '2px', background: 'var(--primary)', margin: '0 auto' }} />
          </header>
          <div className="utopia-reason-grid">
            {settings?.highlights && settings.highlights.length > 0 ? (
              settings.highlights.map((item, i) => {
                const isNumeric = /^\d+/.test(item.value);
                return (
                  <div key={i} className="reason-tile">
                    <div className="tile-icon-bg">{featureIcons[i % featureIcons.length]}</div>
                    <div className="tile-content">
                      <div className="tile-header">
                        {isNumeric ? <span className="tile-stat">{item.value}</span> : <span className="tile-title">{item.value}</span>}
                      </div>
                      <p className="tile-desc">{item.title}</p>
                    </div>
                    <div className="tile-border" />
                  </div>
                );
              })
            ) : null}
          </div>
        </section>
      </div>

      <style jsx>{`
        .utopia-glow-bg { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: radial-gradient(circle at 10% 10%, rgba(var(--primary-rgb), 0.05) 0%, transparent 50%), radial-gradient(circle at 90% 90%, rgba(100, 255, 218, 0.03) 0%, transparent 50%); z-index: 0; pointer-events: none; }
        .utopian-headline { font-size: clamp(4rem, 15vw, 9rem); line-height: 0.8; margin-bottom: 2.5rem; max-width: 1300px; filter: drop-shadow(0 0 30px rgba(var(--primary-rgb), 0.2)); }
        .utopian-subline { font-size: clamp(1.2rem, 3vw, 1.8rem); max-width: 900px; margin: 0 auto 5rem; color: var(--text-dim); font-weight: 300; letter-spacing: -0.5px; }
        
        .swing-container { min-height: 400px; position: relative; width: 100%; max-width: 1000px; margin: 0 auto; }
        .anchor-sidebar { display: flex; flex-direction: column; gap: 1.5rem; align-items: flex-start; width: 100%; }
        .swing-wrapper { width: max-content; padding: 10px 100px 10px 0; cursor: pointer; position: relative; }
        .swing-card { position: relative; transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1); left: 0; z-index: 5; display: inline-flex; }
        .rope { position: absolute; left: 0; top: 50%; width: 0; height: 1px; background: rgba(var(--primary-rgb), 0.5); transition: 0.8s; }
        .card-inner { padding: 1.5rem 2.5rem; border-radius: 100px; display: flex; align-items: center; gap: 1rem; border-left: 5px solid var(--primary); white-space: nowrap; transition: 0.8s; }
        
        .swing-card.pulled { left: 80px; transform: scale(1.05); z-index: 50; }
        .swing-card.pulled .card-inner { border-radius: 30px; padding: 3rem; white-space: normal; background: rgba(var(--primary-rgb), 0.05); width: 100%; max-width: 600px; }
        .card-front { display: flex; align-items: center; gap: 1rem; font-weight: 800; font-size: 1.1rem; }
        
        .card-content { margin-top: 1.5rem; animation: fadeUp 0.5s forwards; max-width: 500px; }
        .card-content h3 { color: var(--primary); margin-bottom: 1rem; font-size: 1.5rem; }
        .card-content p { font-size: 0.95rem; color: var(--text-dim); line-height: 1.6; margin-bottom: 1.5rem; }
        .mini-link { color: var(--primary); text-decoration: none; font-size: 0.8rem; font-weight: 800; display: flex; align-items: center; gap: 0.5rem; }

        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

        .utopia-reason-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(45%, 1fr)); gap: 4rem; }
        .reason-tile { position: relative; padding: 4rem; display: flex; align-items: center; gap: 3rem; transition: var(--transition); }
        .tile-icon-bg { color: var(--primary); opacity: 0.8; transform: scale(1.5); }
        .tile-content { flex: 1; }
        .tile-stat { font-size: 5rem; font-weight: 900; color: var(--primary); line-height: 1; display: block; }
        .tile-title { font-size: 2.2rem; font-weight: 800; color: #fff; line-height: 1.2; display: block; margin-bottom: 0.5rem; }
        .tile-desc { font-size: 1.1rem; color: var(--text-dim); line-height: 1.8; max-width: 400px; }
        .tile-border { position: absolute; bottom: 0; left: 0; width: 0; height: 2px; background: linear-gradient(90deg, var(--primary), transparent); transition: 0.6s; }
        .reason-tile:hover .tile-border { width: 100%; }
        .reason-tile:hover { transform: translateX(15px); }

        @media (max-width: 900px) {
          .utopia-reason-grid { grid-template-columns: 1fr; gap: 2rem; }
          .reason-tile { padding: 2rem; flex-direction: column; align-items: flex-start; gap: 1.5rem; }
          
          /* Mobile Swing Fixes */
          .swing-wrapper { width: 100%; padding: 5px 0; }
          .swing-card { width: 100%; display: flex; }
          .card-inner { padding: 1.2rem 1.5rem; }
          .swing-card.pulled { left: 0; transform: scale(1); z-index: 50; width: 100%; }
          .swing-card.pulled .card-inner { 
            border-radius: 20px; 
            padding: 1.5rem; 
            width: 100%; 
            max-width: 100%; 
            flex-direction: column; 
            align-items: flex-start; 
            background: rgba(var(--primary-rgb), 0.1); 
            border-left: 3px solid var(--primary);
          }
          .swing-card.pulled .card-front { margin-bottom: 1rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 1rem; width: 100%; }
          .card-content { max-width: 100%; }
          .card-content h3 { font-size: 1.2rem; }
          .card-content p { font-size: 0.9rem; }
        }
      `}</style>

      <ApplicationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)} 
        committeeName="Çalıştay"
        message={settings?.globalApplicationMessage}
        email={settings?.globalApplicationEmail}
        url={settings?.globalApplicationUrl}
        deadline={settings?.applicationDeadline}
        expiredMessage={settings?.deadlineExpiredMessage}
      />
    </div>
  );
}
