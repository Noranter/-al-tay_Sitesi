'use client';

import { useState, useEffect } from 'react';
import { Save, CheckCircle, Globe, Clock, FileText, BarChart3, Mail, MessageSquare, Link, MapPin, Calendar, Image as ImageIcon } from 'lucide-react';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    siteName: '',
    workshopName: '',
    shortDescription: '',
    dateAndLocation: '',
    instagramUrl: '',
    vision: '',
    mission: '',
    committeesPageTitle: '',
    committeesPageSubtitle: '',
    workshopStartDate: '',
    workshopDurationDays: 3,
    applicationDeadline: '',
    deadlineExpiredMessage: '',
    workshopHappeningMessage: '',
    globalApplicationMessage: '',
    globalApplicationEmail: '',
    globalApplicationUrl: '',
    highlightsTitle: '',
    highlights: []
  });
  
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data) {
          setSettings({
            siteName: data.siteName || '',
            workshopName: data.workshopName || '',
            shortDescription: data.shortDescription || '',
            dateAndLocation: data.dateAndLocation || '',
            instagramUrl: data.instagramUrl || '',
            vision: data.vision || '',
            mission: data.mission || '',
            committeesPageTitle: data.committeesPageTitle || '',
            committeesPageSubtitle: data.committeesPageSubtitle || '',
            workshopStartDate: data.workshopStartDate || '',
            workshopDurationDays: data.workshopDurationDays !== undefined ? data.workshopDurationDays : 3,
            applicationDeadline: data.applicationDeadline || '',
            deadlineExpiredMessage: data.deadlineExpiredMessage || '',
            workshopHappeningMessage: data.workshopHappeningMessage || '',
            globalApplicationMessage: data.globalApplicationMessage || '',
            globalApplicationEmail: data.globalApplicationEmail || '',
            globalApplicationUrl: data.globalApplicationUrl || '',
            highlightsTitle: data.highlightsTitle || '',
            highlights: data.highlights || []
          });
        }
        setLoading(false);
      });
  }, []);

  const addHighlight = () => {
    setSettings({
      ...settings,
      highlights: [...settings.highlights, { title: '', value: '', isNumeric: true }]
    });
  };

  const removeHighlight = (index) => {
    const newHighlights = settings.highlights.filter((_, i) => i !== index);
    setSettings({ ...settings, highlights: newHighlights });
  };

  const updateHighlight = (index, field, value) => {
    const newHighlights = [...settings.highlights];
    newHighlights[index][field] = value;
    setSettings({ ...settings, highlights: newHighlights });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus('');
    
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      
      if (res.ok) {
        setStatus('Ayarlar başarıyla kaydedildi!');
        setTimeout(() => setStatus(''), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
      <div className="glass card">Yükleniyor...</div>
    </div>
  );

  const tabs = [
    { id: 'general', label: 'Genel Bilgiler', icon: <Globe size={18} /> },
    { id: 'timing', label: 'Zamanlama', icon: <Clock size={18} /> },
    { id: 'content', label: 'İçerik & Vizyon', icon: <FileText size={18} /> },
    { id: 'stats', label: 'İstatistikler', icon: <BarChart3 size={18} /> },
    { id: 'contact', label: 'İletişim & Başvuru', icon: <Mail size={18} /> },
  ];

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2.5rem' }}>
        <h1 className="section-title" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Sistem Ayarları</h1>
        <p style={{ opacity: 0.6 }}>Web sitesinin tüm dinamik içeriğini ve çalışma mantığını buradan yönetin.</p>
      </header>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '12px',
              border: '1px solid',
              borderColor: activeTab === tab.id ? 'var(--primary)' : 'var(--glass-border)',
              background: activeTab === tab.id ? 'var(--primary)' : 'transparent',
              color: activeTab === tab.id ? 'black' : 'var(--text)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              cursor: 'pointer',
              transition: 'all 0.3s',
              fontWeight: '600',
              fontSize: '0.9rem'
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="glass card" style={{ padding: '3rem', minHeight: '400px' }}>
          
          {/* GENERAL TAB */}
          {activeTab === 'general' && (
            <div style={{ animation: 'fadeIn 0.4s ease' }}>
              <h2 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--primary)' }}>
                <Globe size={24} /> Genel Bilgiler
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div className="form-group">
                  <label>Site İsmi (Logo Alanı)</label>
                  <input className="form-input" value={settings.siteName} onChange={e => setSettings({...settings, siteName: e.target.value})} placeholder="Örn: GalÇal" />
                </div>
                <div className="form-group">
                  <label>Çalıştay Tam İsmi</label>
                  <input className="form-input" value={settings.workshopName} onChange={e => setSettings({...settings, workshopName: e.target.value})} placeholder="Örn: GalÇal 2026 Çalıştayı" />
                </div>
              </div>

              <div style={{ margin: '2rem 0', padding: '2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ImageIcon size={18} color="var(--primary)" /> Favicon & Logo Yönetimi
                </h3>
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ width: '80px', height: '80px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--glass-border)' }}>
                    {settings.faviconUrl ? (
                      <img src={settings.faviconUrl} alt="Favicon" style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
                    ) : (
                      <ImageIcon size={32} style={{ opacity: 0.2 }} />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Site İkonu Yükle (Favicon)</label>
                    <input type="file" className="form-input" onChange={async (e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      const formData = new FormData();
                      formData.append('file', file);
                      const res = await fetch('/api/upload', { method: 'POST', body: formData });
                      const data = await res.json();
                      if (data.url) setSettings({ ...settings, faviconUrl: data.url });
                    }} accept="image/*" />
                  </div>
                  <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                      <input type="checkbox" checked={settings.showFaviconInNavbar} onChange={e => setSettings({...settings, showFaviconInNavbar: e.target.checked})} />
                      Navbarda İsmin Yanında Göster?
                    </label>
                    {settings.showFaviconInNavbar && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>Boyut (px):</span>
                        <input 
                          type="number" 
                          className="form-input" 
                          style={{ width: '80px', padding: '0.4rem' }} 
                          value={settings.navbarLogoSize || 32} 
                          onChange={e => setSettings({...settings, navbarLogoSize: parseInt(e.target.value)})} 
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label>Kısa Slogan / Alt Başlık</label>
                <input className="form-input" value={settings.shortDescription} onChange={e => setSettings({...settings, shortDescription: e.target.value})} />
              </div>
            </div>
          </div>
        )}

          {/* TIMING TAB */}
          {activeTab === 'timing' && (
            <div style={{ animation: 'fadeIn 0.4s ease' }}>
              <h2 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--primary)' }}>
                <Clock size={24} /> Zamanlama ve Tarihler
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div className="form-group">
                  <label><Calendar size={14} /> Çalıştay Başlangıç Tarihi</label>
                  <input type="date" className="form-input" value={settings.workshopStartDate ? new Date(settings.workshopStartDate).toISOString().split('T')[0] : ''} onChange={e => setSettings({...settings, workshopStartDate: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Çalıştay Süresi (Gün)</label>
                  <input type="number" className="form-input" value={settings.workshopDurationDays} onChange={e => setSettings({...settings, workshopDurationDays: parseInt(e.target.value)})} />
                </div>
                <div className="form-group">
                  <label>Son Başvuru Tarihi</label>
                  <input type="date" className="form-input" value={settings.applicationDeadline ? new Date(settings.applicationDeadline).toISOString().split('T')[0] : ''} onChange={e => setSettings({...settings, applicationDeadline: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Başvuru Kapandı Mesajı</label>
                  <input className="form-input" value={settings.deadlineExpiredMessage} onChange={e => setSettings({...settings, deadlineExpiredMessage: e.target.value})} />
                </div>
              </div>
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label><MessageSquare size={14} /> Çalıştay Devam Ediyor Mesajı</label>
                <input className="form-input" value={settings.workshopHappeningMessage} onChange={e => setSettings({...settings, workshopHappeningMessage: e.target.value})} />
              </div>
            </div>
          )}

          {/* CONTENT TAB */}
          {activeTab === 'content' && (
            <div style={{ animation: 'fadeIn 0.4s ease' }}>
              <h2 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--primary)' }}>
                <FileText size={24} /> İçerik ve Vizyon
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                <div className="form-group">
                  <label>Vizyon (Paragraf)</label>
                  <textarea className="form-input" rows="5" value={settings.vision} onChange={e => setSettings({...settings, vision: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Misyon (Paragraf)</label>
                  <textarea className="form-input" rows="5" value={settings.mission} onChange={e => setSettings({...settings, mission: e.target.value})} />
                </div>
              </div>
              <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Komiteler Sayfası Başlıkları</h3>
                <div className="form-group">
                  <label>Ana Başlık</label>
                  <input className="form-input" value={settings.committeesPageTitle} onChange={e => setSettings({...settings, committeesPageTitle: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Alt Açıklama</label>
                  <textarea className="form-input" rows="2" value={settings.committeesPageSubtitle} onChange={e => setSettings({...settings, committeesPageSubtitle: e.target.value})} />
                </div>
              </div>
            </div>
          )}

          {/* STATS TAB */}
          {activeTab === 'stats' && (
            <div style={{ animation: 'fadeIn 0.4s ease' }}>
              <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--primary)' }}>
                <BarChart3 size={24} /> Neden Katılmalısın? (İstatistikler)
              </h2>
              <p style={{ marginBottom: '2rem', opacity: 0.6, fontSize: '0.9rem' }}>Ana sayfadaki sayısal veya sözel vurgu kartlarını buradan yönetin.</p>
              
              <div className="form-group" style={{ marginBottom: '2rem' }}>
                <label>Bölüm Başlığı</label>
                <input className="form-input" value={settings.highlightsTitle || ''} onChange={e => setSettings({...settings, highlightsTitle: e.target.value})} placeholder="Örn: Neden Bizimle Olmalısın?" />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {settings.highlights.map((h, index) => (
                  <div key={index} className="glass" style={{ padding: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'flex-end', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                    <div className="form-group" style={{ flex: 2, marginBottom: 0 }}>
                      <label>Kart Başlığı</label>
                      <input className="form-input" value={h.title} onChange={e => updateHighlight(index, 'title', e.target.value)} placeholder="Örn: Delege Katılımı" />
                    </div>
                    <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                      <label>Değer</label>
                      <input className="form-input" value={h.value} onChange={e => updateHighlight(index, 'value', e.target.value)} placeholder="Örn: 150+" />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0, paddingBottom: '0.75rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                        <input type="checkbox" checked={h.isNumeric} onChange={e => updateHighlight(index, 'isNumeric', e.target.checked)} />
                        Büyük Punto?
                      </label>
                    </div>
                    <button type="button" onClick={() => removeHighlight(index)} style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Sil</button>
                  </div>
                ))}
                <button type="button" className="btn btn-primary" style={{ alignSelf: 'flex-start', background: 'transparent', color: 'var(--primary)', border: '1px solid var(--primary)' }} onClick={addHighlight}>
                  + Yeni Kart Ekle
                </button>
              </div>
            </div>
          )}

          {/* CONTACT TAB */}
          {activeTab === 'contact' && (
            <div style={{ animation: 'fadeIn 0.4s ease' }}>
              <h2 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--primary)' }}>
                <Mail size={24} /> İletişim ve Başvuru
              </h2>
              <div className="form-group">
                <label>Genel Başvuru Mesajı (Pop-up içinde)</label>
                <textarea className="form-input" rows="3" value={settings.globalApplicationMessage} onChange={e => setSettings({...settings, globalApplicationMessage: e.target.value})} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1.5rem' }}>
                <div className="form-group">
                  <label>Resmi İletişim E-postası</label>
                  <input className="form-input" value={settings.globalApplicationEmail} onChange={e => setSettings({...settings, globalApplicationEmail: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Başvuru Formu Linki (Google Form vb.)</label>
                  <input className="form-input" value={settings.globalApplicationUrl} onChange={e => setSettings({...settings, globalApplicationUrl: e.target.value})} placeholder="https://docs.google.com/forms/..." />
                </div>
              </div>
            </div>
          )}

          {/* SAVE BUTTON */}
          <div style={{ marginTop: '4rem', borderTop: '1px solid var(--glass-border)', paddingTop: '2.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <button type="submit" className="btn btn-primary" disabled={saving} style={{ padding: '1rem 3rem', fontSize: '1rem' }}>
              <Save size={20} /> {saving ? 'Kaydediliyor...' : 'Değişiklikleri Uygula'}
            </button>
            {status && (
              <span style={{ color: '#22c55e', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600' }}>
                <CheckCircle size={20} /> {status}
              </span>
            )}
          </div>
        </div>
      </form>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .form-group label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
          font-weight: 600;
          font-size: 0.9rem;
          opacity: 0.8;
        }
        .form-input {
          width: 100%;
          background: rgba(0,0,0,0.2);
          border: 1px solid var(--glass-border);
          padding: 1rem;
          color: white;
          border-radius: 10px;
          transition: all 0.3s;
        }
        .form-input:focus {
          border-color: var(--primary);
          background: rgba(0,0,0,0.3);
          outline: none;
          box-shadow: 0 0 0 3px rgba(197, 160, 89, 0.1);
        }
      `}</style>
    </div>
  );
}
