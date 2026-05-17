'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, X, Check, Users, Image as ImageIcon, FileText, Send, ShieldCheck, Download, Sparkles, AlertCircle } from 'lucide-react';

export default function AdminCommittees() {
  const [committees, setCommittees] = useState([]);
  const [boardMembers, setBoardMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [formData, setFormData] = useState({
    name: '', 
    description: '', 
    vision: '', 
    mission: '', 
    workingPaperUrl: '', 
    bannerUrl: '',
    applicationMessage: '',
    applicationEmail: '',
    applicationUrl: '',
    divanMembers: [],
    adminMember: null,
    secretaryMember: null,
    pressMember: null,
    members: []
  });

  useEffect(() => {
    fetchCommittees();
    fetchBoardMembers();
  }, []);

  const fetchCommittees = () => {
    setLoading(true);
    fetch('/api/committees')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCommittees(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const fetchBoardMembers = () => {
    fetch('/api/board').then(res => res.json()).then(data => {
      if (Array.isArray(data)) setBoardMembers(data);
    });
  };

  const handleSave = async () => {
    if (!formData.name || !formData.description || !formData.vision || !formData.mission) {
      setStatus({ type: 'error', message: 'Lütfen zorunlu alanları (Ad, Açıklama, Vizyon, Misyon) doldurun.' });
      return;
    }

    const isNew = !editingId || editingId === 'new';
    const url = isNew ? '/api/committees' : `/api/committees/${editingId}`;
    const method = isNew ? 'POST' : 'PUT';

    setStatus({ type: 'loading', message: 'Kaydediliyor...' });

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (res.ok) {
        setStatus({ type: 'success', message: 'Komite başarıyla kaydedildi!' });
        setTimeout(() => {
          setEditingId(null);
          setStatus({ type: '', message: '' });
          fetchCommittees();
        }, 1500);
      } else {
        setStatus({ type: 'error', message: result.error || 'Bir hata oluştu.' });
        if (res.status === 401) window.location.href = '/admin-login';
      }
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: 'Sunucuyla bağlantı kurulamadı.' });
    }
  };

  const handleFileUpload = async (e, type = 'workingPaper') => {
    const file = e.target.files[0];
    if (!file) return;
    setStatus({ type: 'loading', message: 'Dosya yükleniyor...' });
    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: uploadData });
      const data = await res.json();
      if (data.url) {
        setFormData({ ...formData, [type === 'banner' ? 'bannerUrl' : 'workingPaperUrl']: data.url });
        setStatus({ type: 'success', message: 'Dosya başarıyla yüklendi!' });
        setTimeout(() => setStatus({ type: '', message: '' }), 2000);
      }
    } catch (err) {
      console.error('Upload failed', err);
      setStatus({ type: 'error', message: 'Dosya yüklenemedi.' });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bu komiteyi silmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetch(`/api/committees/${id}`, { method: 'DELETE' });
      if (res.ok) fetchCommittees();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleDivanMember = (memberId) => {
    const current = formData.divanMembers || [];
    if (current.includes(memberId)) {
      setFormData({ ...formData, divanMembers: current.filter(id => id !== memberId) });
    } else {
      setFormData({ ...formData, divanMembers: [...current, memberId] });
    }
  };

  const startEdit = (committee) => {
    setEditingId(committee._id);
    setFormData({
      ...committee,
      divanMembers: committee.divanMembers?.map(m => typeof m === 'object' ? m._id : m) || [],
      adminMember: typeof committee.adminMember === 'object' ? committee.adminMember?._id : committee.adminMember,
      secretaryMember: typeof committee.secretaryMember === 'object' ? committee.secretaryMember?._id : committee.secretaryMember,
      pressMember: typeof committee.pressMember === 'object' ? committee.pressMember?._id : committee.pressMember,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading && committees.length === 0) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <div className="animate-pulse-slow" style={{ color: 'var(--primary)', fontWeight: '800' }}>YÜKLENİYOR...</div>
    </div>
  );

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem' }}>
        <div>
          <h1 className="gradient-text" style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>Komite Merkezi</h1>
          <p style={{ opacity: 0.5, letterSpacing: '1px' }}>AKADEMİK ÜTOPYALARINIZI BURADAN YÖNETİN</p>
        </div>
        {!editingId && (
          <button className="btn btn-primary" style={{ padding: '1rem 2.5rem' }} onClick={() => { 
            setEditingId('new'); 
            setFormData({ name: '', description: '', vision: '', mission: '', workingPaperUrl: '', bannerUrl: '', applicationMessage: '', applicationEmail: '', applicationUrl: '', divanMembers: [], adminMember: null, secretaryMember: null, pressMember: null, members: [] }); 
          }}>
            <Plus size={20} /> Yeni Komite
          </button>
        )}
      </header>

      {editingId ? (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
          {/* Status Bar */}
          {status.message && (
            <div style={{ 
              position: 'fixed', top: '100px', right: '2rem', zIndex: 1000,
              padding: '1.2rem 2rem', borderRadius: '16px', backdropFilter: 'blur(20px)',
              background: status.type === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)',
              color: status.type === 'error' ? '#ff6b6b' : '#63ff90',
              border: `1px solid ${status.type === 'error' ? '#ef4444' : '#22c55e'}`,
              display: 'flex', alignItems: 'center', gap: '1rem', fontWeight: '700',
              boxShadow: '0 20px 40px rgba(0,0,0,0.4)', animation: 'slideIn 0.3s ease'
            }}>
              {status.type === 'error' ? <AlertCircle size={24} /> : <Sparkles size={24} />}
              {status.message}
            </div>
          )}

          <div className="glass" style={{ padding: '4rem', marginBottom: '5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '2rem' }}>
              <h2 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '1.2rem', fontWeight: '800' }}>
                {editingId === 'new' ? <Sparkles color="var(--primary)" /> : <Edit2 color="var(--primary)" />}
                {editingId === 'new' ? 'YENİ ÜTOPYA KUR' : 'KOMİTEYİ GÜNCELLE'}
              </h2>
              <button onClick={() => setEditingId(null)} className="btn btn-outline" style={{ padding: '0.8rem', borderRadius: '50%' }}>
                <X size={24} />
              </button>
            </div>

            {/* SECTION 1: TEMEL */}
            <div className="admin-section">
              <h3><FileText size={20} /> 1. TEMEL KİMLİK</h3>
              <div className="form-grid">
                <div className="form-group full">
                  <label>Komite Tam Adı *</label>
                  <input className="form-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Örn: Ekonomi ve Sosyal Konsey" />
                </div>
                <div className="form-group full">
                  <label>Komite Hikayesi / Açıklaması *</label>
                  <textarea className="form-input" rows="6" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Bu komitenin ruhunu ve amacını anlatın..." />
                </div>
              </div>
            </div>

            {/* SECTION 2: VİZYON */}
            <div className="admin-section">
              <h3><Sparkles size={20} /> 2. VİZYON & MİSYON *</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Gelecek Vizyonu</label>
                  <textarea className="form-input" rows="4" value={formData.vision} onChange={e => setFormData({...formData, vision: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Akademik Misyon</label>
                  <textarea className="form-input" rows="4" value={formData.mission} onChange={e => setFormData({...formData, mission: e.target.value})} />
                </div>
              </div>
            </div>

            {/* SECTION 3: EKİP */}
            <div className="admin-section" style={{ background: 'rgba(var(--primary-rgb), 0.03)', padding: '2rem', borderRadius: '24px' }}>
              <h3><Users size={20} /> 3. KOMİTE YETKİLİLERİ</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label><ShieldCheck size={16} /> Admin (Başkan)</label>
                  <select className="form-input" value={formData.adminMember || ''} onChange={e => setFormData({...formData, adminMember: e.target.value || null})}>
                    <option value="">Seçiniz...</option>
                    {boardMembers.map(bm => <option key={bm._id} value={bm._id}>{bm.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label><FileText size={16} /> Sekreter</label>
                  <select className="form-input" value={formData.secretaryMember || ''} onChange={e => setFormData({...formData, secretaryMember: e.target.value || null})}>
                    <option value="">Seçiniz...</option>
                    {boardMembers.map(bm => <option key={bm._id} value={bm._id}>{bm.name}</option>)}
                  </select>
                </div>
                <div className="form-group full">
                  <label>Divan Üyelerini Seçin</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.5rem' }}>
                    {boardMembers.map(bm => (
                      <div 
                        key={bm._id} 
                        onClick={() => toggleDivanMember(bm._id)} 
                        style={{ 
                          padding: '0.8rem 1.5rem', borderRadius: '100px', cursor: 'pointer', fontSize: '0.85rem',
                          background: formData.divanMembers?.includes(bm._id) ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                          color: formData.divanMembers?.includes(bm._id) ? 'black' : 'white',
                          transition: '0.3s', fontWeight: '800', border: '1px solid var(--border-light)'
                        }}
                      >
                        {bm.name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ACTION FOOTER */}
            <div style={{ display: 'flex', gap: '2rem', marginTop: '5rem' }}>
              <button className="btn btn-primary" style={{ flex: 2, padding: '1.5rem' }} onClick={handleSave}>
                <Check size={24} /> KOMİTEYİ SİSTEME KAYDET
              </button>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setEditingId(null)}>İptal Et</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="utopia-grid">
          {committees.map(c => (
            <div key={c._id} className="glass card" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '800' }}>{c.name}</h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => startEdit(c)} className="btn-icon"><Edit2 size={18} /></button>
                  <button onClick={() => handleDelete(c._id)} className="btn-icon delete"><Trash2 size={18} /></button>
                </div>
              </div>
              <p style={{ opacity: 0.6, fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '2rem', flex: 1 }}>{c.description}</p>
              <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1.5rem', display: 'flex', gap: '1.5rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--primary)' }}>{c.divanMembers?.length || 0} DİVAN</div>
                <div style={{ fontSize: '0.8rem', fontWeight: '800', opacity: 0.5 }}>{c.adminMember ? 'BAŞKAN ATANDI' : 'BAŞKAN YOK'}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .admin-section { margin-bottom: 5rem; }
        .admin-section h3 { font-size: 1rem; color: var(--primary); letter-spacing: 3px; font-weight: 800; display: flex; align-items: center; gap: 0.8rem; margin-bottom: 2.5rem; text-transform: uppercase; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
        .form-group.full { grid-column: 1 / -1; }
        .form-group label { display: block; margin-bottom: 0.8rem; font-weight: 800; font-size: 0.85rem; opacity: 0.7; text-transform: uppercase; letter-spacing: 1px; }
        
        .btn-icon { background: rgba(255,255,255,0.05); border: 1px solid var(--border-light); color: white; padding: 0.8rem; border-radius: 12px; cursor: pointer; transition: 0.3s; }
        .btn-icon:hover { background: var(--primary); color: black; }
        .btn-icon.delete:hover { background: #ef4444; color: white; }

        @keyframes slideIn { from { transform: translateX(50px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @media (max-width: 768px) { .form-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
