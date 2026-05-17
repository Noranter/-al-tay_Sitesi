'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, Target } from 'lucide-react';

export default function Committees() {
  const [committees, setCommittees] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Typewriter States
  const [displayPrefix, setDisplayPrefix] = useState('');
  const [committeeIndex, setCommitteeIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(150);

  useEffect(() => {
    Promise.all([
      fetch('/api/committees').then(res => res.json()),
      fetch('/api/settings').then(res => res.json())
    ]).then(([committeesData, settingsData]) => {
      if (Array.isArray(committeesData)) setCommittees(committeesData);
      if (settingsData) setSettings(settingsData);
      setLoading(false);
    }).catch((err) => {
      console.error('Fetch error:', err);
      setLoading(false);
    });
  }, []);

  // Typewriter Logic
  useEffect(() => {
    if (committees.length === 0) return;

    const handleType = () => {
      const baseName = committees[committeeIndex]?.name || '';
      const cleanName = baseName.replace(/komitesi/gi, '').trim().toUpperCase();
      
      if (!isDeleting) {
        setDisplayPrefix(cleanName.substring(0, displayPrefix.length + 1));
        setTypingSpeed(100);
        if (displayPrefix === cleanName) {
          setTimeout(() => setIsDeleting(true), 2500);
        }
      } else {
        setDisplayPrefix(cleanName.substring(0, displayPrefix.length - 1));
        setTypingSpeed(50);
        if (displayPrefix === '') {
          setIsDeleting(false);
          setCommitteeIndex((prev) => (prev + 1) % committees.length);
        }
      }
    };

    const timer = setTimeout(handleType, typingSpeed);
    return () => clearTimeout(timer);
  }, [displayPrefix, isDeleting, committeeIndex, committees]);

  const getOfficials = (committee) => {
    const officials = [];
    if (committee.adminMember) officials.push(committee.adminMember);
    if (committee.secretaryMember) officials.push(committee.secretaryMember);
    if (committee.pressMember) officials.push(committee.pressMember);
    if (committee.divanMembers) officials.push(...committee.divanMembers);
    
    // Unique by ID and filter only those with photos
    const uniqueOfficials = Array.from(new Map(officials.map(item => [item._id, item])).values());
    return uniqueOfficials.filter(o => o.photoUrl);
  };

  if (loading) return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <div className="animate-pulse-slow" style={{ color: 'var(--primary)', fontWeight: '800', letterSpacing: '4px' }}>YÜKLENİYOR...</div>
    </div>
  );

  return (
    <div style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh' }}>
      {/* Background Decor */}
      <div className="utopia-glow-bg" />
      
      {/* Dynamic Typewriter Background Text */}
      <div className="utopia-bg-typewriter">
        <span style={{ color: 'white' }}>{displayPrefix}</span>
        <span className="cursor">|</span>
        <span style={{ opacity: displayPrefix ? 1 : 0.5, transition: '0.5s' }}> ÜTOPYASI</span>
      </div>

      <div className="container" style={{ position: 'relative', zIndex: 10 }}>
        <header style={{ padding: '10rem 0 6rem', textAlign: 'center' }}>
          <h1 className="gradient-text" style={{ fontSize: 'clamp(3.5rem, 10vw, 6rem)', marginBottom: '1.5rem', lineHeight: '0.9' }}>
            {settings?.committeesPageTitle || 'Ütopik Komiteler'}
          </h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '1.3rem', maxWidth: '750px', margin: '0 auto', lineHeight: '1.8' }}>
            {settings?.committeesPageSubtitle || 'Geleceğin çözümlerini bugünün fikirleriyle inşa eden akademik yapılarımız.'}
          </p>
        </header>

        {committees.length === 0 ? (
          <div className="glass" style={{ padding: '5rem', textAlign: 'center', marginBottom: '10rem' }}>
            <p style={{ fontSize: '1.2rem', opacity: 0.5, marginBottom: '2rem' }}>Henüz bir komite tanımlanmadı.</p>
            <Link href="/" className="btn btn-primary">Ana Sayfaya Dön</Link>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
            gap: '3rem', 
            paddingBottom: '15rem'
          }}>
            {committees.map((committee, i) => {
              const officials = getOfficials(committee);
              return (
                <div key={committee._id} className="glass glass-hover" style={{ 
                  padding: '4rem 3rem', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  height: '100%',
                  position: 'relative'
                }}>
                  {/* Officials Avatars Stack */}
                  <div style={{ 
                    position: 'absolute', 
                    top: '2.5rem', 
                    right: '2.5rem', 
                    display: 'flex', 
                    flexDirection: 'row-reverse',
                    alignItems: 'center' 
                  }}>
                    {officials.slice(0, 4).map((official, idx) => (
                      <div key={official._id} style={{ 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '50%', 
                        border: '2px solid var(--bg-dark)',
                        marginLeft: '-12px',
                        overflow: 'hidden',
                        background: 'var(--bg-card)',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                        position: 'relative',
                        zIndex: 10 - idx
                      }} title={`${official.name}`}>
                        <img src={official.photoUrl} alt={official.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ))}
                    {officials.length > 4 && (
                      <div style={{ 
                        width: '40px', height: '40px', borderRadius: '50%', 
                        background: 'var(--primary)', color: '#000', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.7rem', fontWeight: '800', border: '2px solid var(--bg-dark)',
                        marginLeft: '-12px', zIndex: 5
                      }}>
                        +{officials.length - 4}
                      </div>
                    )}
                  </div>

                  <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ 
                      width: '55px', height: '55px', borderRadius: '16px', 
                      background: 'rgba(var(--primary-rgb), 0.1)', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '1px solid rgba(var(--primary-rgb), 0.2)',
                      color: 'var(--primary)'
                    }}>
                      <BookOpen size={28} />
                    </div>
                    <span style={{ fontSize: '0.8rem', fontWeight: '800', letterSpacing: '3px', opacity: 0.4, textTransform: 'uppercase' }}>0{i+1}</span>
                  </div>

                  <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '1.5rem', color: '#fff' }}>{committee.name}</h2>
                  
                  <p style={{ 
                    color: 'var(--text-dim)', 
                    fontSize: '1.05rem', 
                    lineHeight: '1.8', 
                    flexGrow: 1, 
                    marginBottom: '3rem',
                    display: '-webkit-box', 
                    WebkitLineClamp: 4, 
                    WebkitBoxOrient: 'vertical', 
                    overflow: 'hidden'
                  }}>
                    {committee.description}
                  </p>

                  <Link href={`/committees/${committee._id}`} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                    Detayları Keşfet <ArrowRight size={20} />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style jsx>{`
        .utopia-glow-bg {
          position: fixed;
          top: 0; left: 0; width: 100%; height: 100%;
          background: radial-gradient(circle at 50% 50%, rgba(var(--primary-rgb), 0.05) 0%, transparent 70%);
          z-index: 0;
          pointer-events: none;
        }
        .utopia-bg-typewriter {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: clamp(1.5rem, 8vw, 6rem);
          font-weight: 900;
          color: white;
          opacity: 0.025;
          z-index: 0;
          pointer-events: none;
          font-family: 'Outfit', sans-serif;
          text-align: center;
          width: 95%;
          text-transform: uppercase;
          white-space: nowrap;
        }
        .cursor {
          animation: blink 1s infinite;
          color: var(--primary);
        }
        @keyframes blink {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
