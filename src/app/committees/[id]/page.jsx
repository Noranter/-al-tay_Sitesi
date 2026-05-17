'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { Download, Users, Lightbulb, Target, ArrowLeft, Send, ShieldCheck } from 'lucide-react';
import ApplicationModal from '@/components/ApplicationModal';

export default function CommitteeDetail({ params }) {
  const { id } = use(params);
  const [committee, setCommittee] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/committees/${id}`).then(res => {
        if (!res.ok) throw new Error('Komite bilgileri getirilemedi');
        return res.json();
      }),
      fetch('/api/settings').then(res => res.json())
    ])
    .then(([committeeData, settingsData]) => {
      setCommittee(committeeData);
      setSettings(settingsData);
      setLoading(false);
    })
    .catch((err) => {
      console.error('Yükleme hatası:', err);
      setError(err.message);
      setLoading(false);
    });
  }, [id]);

  if (loading) return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <div className="glass card" style={{ textAlign: 'center' }}>
        <h2 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Yükleniyor...</h2>
        <p style={{ opacity: 0.7 }}>Komite detayları hazırlanıyor.</p>
      </div>
    </div>
  );

  if (error || !committee || committee.error) return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <div className="glass card" style={{ textAlign: 'center', borderColor: '#ff4d4d' }}>
        <h2 style={{ color: '#ff4d4d', marginBottom: '1rem' }}>Bağlantı Hatası</h2>
        <p style={{ opacity: 0.7, marginBottom: '1.5rem' }}>{error || 'Komite bulunamadı.'}</p>
        <button onClick={() => window.location.reload()} className="btn btn-primary">Yeniden Dene</button>
      </div>
    </div>
  );

  return (
    <div className="container">
      <Link href="/committees" className="btn" style={{ marginBottom: '2rem', padding: '0' }}>
        <ArrowLeft size={20} /> Geri Dön
      </Link>

      {committee.bannerUrl && (
        <div style={{ 
          width: '100%', 
          aspectRatio: '3 / 1', 
          borderRadius: '24px', 
          overflow: 'hidden', 
          marginBottom: '3rem',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <img 
            src={committee.bannerUrl} 
            alt={`${committee.name} Banner`} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 2fr))', gap: '3rem' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <h1 className="section-title">{committee.name}</h1>
            <button 
              className="btn btn-primary" 
              style={{ padding: '0.8rem 2rem', fontSize: '1.1rem' }}
              onClick={() => setIsModalOpen(true)}
            >
              <Send size={18} /> Şimdi Başvur
            </button>
          </div>

          <p style={{ fontSize: '1.1rem', lineHeight: '1.8', opacity: 0.9, marginBottom: '2rem' }}>
            {committee.description}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '2.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <Lightbulb size={24} color="var(--primary)" />
                <h3 style={{ fontSize: '1.4rem' }}>Vizyonumuz</h3>
              </div>
              <p style={{ opacity: 0.9, fontSize: '1.1rem', lineHeight: '1.7', borderLeft: '3px solid var(--primary)', paddingLeft: '1.5rem' }}>
                {committee.vision}
              </p>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <Target size={24} color="#ec4899" />
                <h3 style={{ fontSize: '1.4rem' }}>Misyonumuz</h3>
              </div>
              <p style={{ opacity: 0.9, fontSize: '1.1rem', lineHeight: '1.7', borderLeft: '3px solid #ec4899', paddingLeft: '1.5rem' }}>
                {committee.mission}
              </p>
            </div>
          </div>

          {committee.workingPaperUrl && (
            <div style={{ marginTop: '2rem' }}>
              <a href={committee.workingPaperUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '1rem', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}>
                <Download size={20} /> Çalışma Kağıdını İndir (PDF)
              </a>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Specific Team Sections */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <ShieldCheck size={24} color="var(--primary)" />
              <h2 style={{ fontSize: '1.5rem' }}>Komite Ekibi</h2>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Divans */}
              {committee.divanMembers?.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', opacity: 0.6, marginBottom: '0.75rem', letterSpacing: '1px' }}>Divanlar</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    {committee.divanMembers.map(m => (
                      <MemberCard key={m._id} member={m} />
                    ))}
                  </div>
                </div>
              )}

              {/* Admin, Secretary, Press */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {committee.adminMember && (
                  <div>
                    <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', opacity: 0.6, marginBottom: '0.75rem', letterSpacing: '1px' }}>Admin</h4>
                    <MemberCard member={committee.adminMember} />
                  </div>
                )}
                {committee.secretaryMember && (
                  <div>
                    <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', opacity: 0.6, marginBottom: '0.75rem', letterSpacing: '1px' }}>Sekreter</h4>
                    <MemberCard member={committee.secretaryMember} />
                  </div>
                )}
                {committee.pressMember && (
                  <div>
                    <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', opacity: 0.6, marginBottom: '0.75rem', letterSpacing: '1px' }}>Basın</h4>
                    <MemberCard member={committee.pressMember} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Regular Members */}
          {committee.members?.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <Users size={24} color="var(--primary)" />
                <h2 style={{ fontSize: '1.5rem' }}>Komite Üyeleri</h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {committee.members.map((member, idx) => (
                  <div key={idx} className="glass" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', overflow: 'hidden', flexShrink: 0 }}>
                      {member.photoUrl ? <img src={member.photoUrl} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>?</div>}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.95rem' }}>{member.name}</h4>
                      <p style={{ opacity: 0.7, fontSize: '0.8rem' }}>{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <ApplicationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        committeeName={committee.name}
        message={committee.applicationMessage || settings?.globalApplicationMessage}
        email={committee.applicationEmail || settings?.globalApplicationEmail}
        url={committee.applicationUrl || settings?.globalApplicationUrl}
        deadline={settings?.applicationDeadline}
        expiredMessage={settings?.deadlineExpiredMessage}
      />
    </div>
  );
}

// Helper Component for Member Display
function MemberCard({ member }) {
  return (
    <div className="glass" style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <div style={{ width: '45px', height: '45px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: 'var(--primary)' }}>
        {member.photoUrl ? <img src={member.photoUrl} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.9rem' }}>{member.name.charAt(0)}</div>}
      </div>
      <div>
        <h4 style={{ fontSize: '0.95rem' }}>{member.name}</h4>
        <p style={{ opacity: 0.7, fontSize: '0.8rem' }}>{member.role}</p>
      </div>
    </div>
  );
}
