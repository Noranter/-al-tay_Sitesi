'use client';

import { useState, useEffect } from 'react';
import { Save, CheckCircle } from 'lucide-react';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    workshopName: '',
    shortDescription: '',
    dateAndLocation: '',
    vision: '',
    mission: '',
    globalApplicationMessage: '',
    globalApplicationEmail: '',
    highlights: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data) {
          setSettings({
            ...data,
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

  if (loading) return <div>Yükleniyor...</div>;

  return (
    <div>
      <h1 className="section-title">Site Ayarları</h1>
      <p style={{ marginBottom: '2rem', opacity: 0.8 }}>Ana sayfa metinlerini ve genel bilgileri buradan düzenleyin.</p>

      <div className="glass card">
        <form onSubmit={handleSubmit} className="admin-form">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group">
              <label>Site İsmi (Sol Üst Köşe)</label>
              <input 
                className="form-input" 
                value={settings.siteName} 
                onChange={e => setSettings({...settings, siteName: e.target.value})} 
              />
            </div>
            <div className="form-group">
              <label>Çalıştay İsmi (Ana Sayfa Hero)</label>
              <input 
                className="form-input" 
                value={settings.workshopName} 
                onChange={e => setSettings({...settings, workshopName: e.target.value})} 
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group">
              <label>Tarih ve Yer (Örn: 15-17 Mayıs | İstanbul)</label>
              <input 
                className="form-input" 
                value={settings.dateAndLocation} 
                onChange={e => setSettings({...settings, dateAndLocation: e.target.value})} 
              />
            </div>
            <div className="form-group">
              <label>Kısa Açıklama (Slogan)</label>
              <input 
                className="form-input" 
                value={settings.shortDescription} 
                onChange={e => setSettings({...settings, shortDescription: e.target.value})} 
              />
            </div>
            <div className="form-group">
              <label>Instagram Adresi</label>
              <input 
                className="form-input" 
                placeholder="https://instagram.com/kullaniciadi"
                value={settings.instagramUrl} 
                onChange={e => setSettings({...settings, instagramUrl: e.target.value})} 
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group">
              <label>Vizyon (Paragraf)</label>
              <textarea 
                className="form-input" 
                rows="4" 
                value={settings.vision} 
                onChange={e => setSettings({...settings, vision: e.target.value})} 
              />
            </div>
            <div className="form-group">
              <label>Misyon (Paragraf)</label>
              <textarea 
                className="form-input" 
                rows="4" 
                value={settings.mission} 
                onChange={e => setSettings({...settings, mission: e.target.value})} 
              />
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', margin: '2rem 0', paddingTop: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Neden Katılmalısın? (İstatistikler/Özellikler)</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {settings.highlights.map((h, index) => (
                <div key={index} className="glass" style={{ padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'flex-end', background: 'rgba(255,255,255,0.03)' }}>
                  <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                    <label>Başlık</label>
                    <input className="form-input" value={h.title} onChange={e => updateHighlight(index, 'title', e.target.value)} />
                  </div>
                  <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                    <label>Değer (Opsiyonel, örn: 100+)</label>
                    <input className="form-input" value={h.value} onChange={e => updateHighlight(index, 'value', e.target.value)} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0, paddingBottom: '0.5rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input type="checkbox" checked={h.isNumeric} onChange={e => updateHighlight(index, 'isNumeric', e.target.checked)} />
                      Sayısal Gösterim?
                    </label>
                  </div>
                  <button type="button" className="btn" style={{ color: '#ef4444', padding: '0.5rem' }} onClick={() => removeHighlight(index)}>Sil</button>
                </div>
              ))}
              <button type="button" className="btn btn-primary" style={{ alignSelf: 'flex-start' }} onClick={addHighlight}>+ Yeni Bilgi Ekle</button>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', margin: '2rem 0', paddingTop: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Genel Başvuru Ayarları</h3>
            <div className="form-group">
              <label>Genel Başvuru Mesajı</label>
              <textarea 
                className="form-input" 
                rows="3" 
                value={settings.globalApplicationMessage} 
                onChange={e => setSettings({...settings, globalApplicationMessage: e.target.value})} 
              />
            </div>
            <div className="form-group">
              <label>Genel Başvuru E-postası (Opsiyonel)</label>
              <input 
                className="form-input" 
                value={settings.globalApplicationEmail} 
                onChange={e => setSettings({...settings, globalApplicationEmail: e.target.value})} 
              />
            </div>
            <div className="form-group">
              <label>Genel Başvuru Linki (Google Form vb.)</label>
              <input 
                className="form-input" 
                placeholder="https://docs.google.com/forms/..."
                value={settings.globalApplicationUrl} 
                onChange={e => setSettings({...settings, globalApplicationUrl: e.target.value})} 
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <Save size={18} /> {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
            </button>
            {status && <span style={{ color: '#22c55e', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><CheckCircle size={18} /> {status}</span>}
          </div>
        </form>
      </div>
    </div>
  );
}
