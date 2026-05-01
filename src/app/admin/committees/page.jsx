'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, X, Check, Users } from 'lucide-react';

export default function AdminCommittees() {
  const [committees, setCommittees] = useState([]);
  const [boardMembers, setBoardMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
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
        if (Array.isArray(data)) {
          setCommittees(data);
        } else {
          setCommittees([]);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const fetchBoardMembers = () => {
    fetch('/api/board')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setBoardMembers(data);
      });
  };

  const handleSave = async () => {
    const isNew = !editingId || editingId === 'new';
    const url = isNew ? '/api/committees' : `/api/committees/${editingId}`;
    const method = isNew ? 'POST' : 'PUT';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setEditingId(null);
        setFormData({ 
          name: '', description: '', vision: '', mission: '', workingPaperUrl: '', 
          bannerUrl: '', applicationMessage: '', applicationEmail: '', divanMembers: [], 
          adminMember: null, secretaryMember: null, pressMember: null, members: [] 
        });
        fetchCommittees();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileUpload = async (e, type = 'workingPaper') => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadData,
      });
      const data = await res.json();
      if (data.url) {
        if (type === 'banner') {
          setFormData({ ...formData, bannerUrl: data.url });
        } else {
          setFormData({ ...formData, workingPaperUrl: data.url });
        }
      }
    } catch (err) {
      console.error('Upload failed', err);
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
    } else if (current.length < 2) {
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
      bannerUrl: committee.bannerUrl || '',
    });
  };

  if (loading && committees.length === 0) return <div>Yükleniyor...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="section-title">Komiteler</h1>
        <button className="btn btn-primary" onClick={() => { 
          setEditingId('new'); 
          setFormData({ 
            name: '', description: '', vision: '', mission: '', workingPaperUrl: '', 
            bannerUrl: '', applicationMessage: '', applicationEmail: '', divanMembers: [], 
            adminMember: null, secretaryMember: null, pressMember: null, members: [] 
          }); 
        }}>
          <Plus size={18} /> Yeni Komite Ekle
        </button>
      </div>

      {editingId && (
        <div className="glass card" style={{ marginBottom: '2rem' }}>
          <h3>{editingId === 'new' ? 'Yeni Komite' : 'Komiteyi Düzenle'}</h3>
          <div className="admin-form" style={{ marginTop: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="form-group">
                <label>Komite Adı</label>
                <input className="form-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Başvuru Mail Adresi (Opsiyonel)</label>
                <input className="form-input" placeholder="orn: ekonomi@galcal.com" value={formData.applicationEmail} onChange={e => setFormData({...formData, applicationEmail: e.target.value})} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div className="form-group">
                <label>Başvuru Linki (Google Form vb.) - Boş bırakılırsa genel link kullanılır</label>
                <input className="form-input" placeholder="https://docs.google.com/forms/..." value={formData.applicationUrl} onChange={e => setFormData({...formData, applicationUrl: e.target.value})} />
              </div>
            </div>

            <div className="form-group" style={{ border: '1px dashed var(--glass-border)', padding: '1.5rem', borderRadius: '12px', background: 'rgba(255,255,255,0.02)' }}>
              <label style={{ display: 'block', marginBottom: '1rem', fontWeight: 'bold' }}>Komite Banner (Önerilen Oran 3:1)</label>
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', width: '240px', height: '80px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--glass-border)' }}>
                  {formData.bannerUrl ? (
                    <>
                      <img src={formData.bannerUrl} alt="Banner Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button 
                        onClick={() => setFormData({ ...formData, bannerUrl: '' })}
                        style={{ position: 'absolute', top: '5px', right: '5px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        title="Bannerı Kaldır"
                      >
                        <X size={14} />
                      </button>
                    </>
                  ) : (
                    <span style={{ opacity: 0.4, fontSize: '0.8rem' }}>Görsel Yok</span>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <input type="file" className="form-input" onChange={e => handleFileUpload(e, 'banner')} accept="image/*" style={{ marginBottom: '0.5rem' }} />
                  <p style={{ fontSize: '0.7rem', opacity: 0.6 }}>Yüklenen görseller otomatik olarak optimize edilir.</p>
                </div>
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '2rem' }}>
              <label>Açıklama</label>
              <textarea className="form-input" style={{ minHeight: '120px' }} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>

            <div className="form-group">
              <label>Başvuru Mesajı (Popup'ta görünecek)</label>
              <textarea className="form-input" style={{ minHeight: '80px' }} placeholder="Başvurmak için mail atın..." value={formData.applicationMessage} onChange={e => setFormData({...formData, applicationMessage: e.target.value})} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
              <div className="form-group">
                <label>Vizyon</label>
                <textarea className="form-input" style={{ minHeight: '80px' }} value={formData.vision} onChange={e => setFormData({...formData, vision: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Misyon</label>
                <textarea className="form-input" style={{ minHeight: '80px' }} value={formData.mission} onChange={e => setFormData({...formData, mission: e.target.value})} />
              </div>
            </div>

            <div style={{ border: '1px solid rgba(197, 160, 89, 0.1)', padding: '2rem', borderRadius: '12px', marginBottom: '2rem', background: 'rgba(197, 160, 89, 0.02)' }}>
              <h4 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                <Users size={20} /> Komite Ekibi Yönetimi
              </h4>
              
              <div className="form-group" style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.75rem' }}>Divanlar (Yönetim Kurulundan En Fazla 2 Kişi Seçin)</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.5rem', maxHeight: '150px', overflowY: 'auto', padding: '0.5rem', background: 'rgba(0,0,0,0.1)', borderRadius: '8px' }}>
                  {boardMembers.map(bm => (
                    <div 
                      key={bm._id} 
                      onClick={() => toggleDivanMember(bm._id)}
                      style={{ 
                        padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem',
                        background: formData.divanMembers?.includes(bm._id) ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                        color: formData.divanMembers?.includes(bm._id) ? 'black' : 'inherit',
                        border: '1px solid rgba(255,255,255,0.1)',
                        transition: 'all 0.2s'
                      }}
                    >
                      {bm.name}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem' }}>
                <div className="form-group">
                  <label>Admin</label>
                  <select className="form-input" value={formData.adminMember || ''} onChange={e => setFormData({...formData, adminMember: e.target.value || null})}>
                    <option value="">Seçiniz...</option>
                    {boardMembers.map(bm => <option key={bm._id} value={bm._id}>{bm.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Sekreter</label>
                  <select className="form-input" value={formData.secretaryMember || ''} onChange={e => setFormData({...formData, secretaryMember: e.target.value || null})}>
                    <option value="">Seçiniz...</option>
                    {boardMembers.map(bm => <option key={bm._id} value={bm._id}>{bm.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Basın</label>
                  <select className="form-input" value={formData.pressMember || ''} onChange={e => setFormData({...formData, pressMember: e.target.value || null})}>
                    <option value="">Seçiniz...</option>
                    {boardMembers.map(bm => <option key={bm._id} value={bm._id}>{bm.name}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '2rem', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
              <label>Çalışma Kağıdı (PDF / Görsel)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                <input type="file" className="form-input" onChange={handleFileUpload} style={{ flex: 1 }} />
                {formData.workingPaperUrl && (
                   <button 
                    onClick={() => setFormData({ ...formData, workingPaperUrl: '' })}
                    className="btn"
                    style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.5rem' }}
                   >
                    <X size={18} />
                   </button>
                )}
              </div>
              {formData.workingPaperUrl && <p style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '0.5rem' }}>Mevcut Dosya: {formData.workingPaperUrl}</p>}
            </div>

            <div style={{ display: 'flex', gap: '1rem', borderTop: '1px solid var(--glass-border)', paddingTop: '2rem' }}>
              <button className="btn btn-primary" style={{ padding: '1rem 2.5rem' }} onClick={handleSave}><Check size={18} /> Kaydet</button>
              <button className="btn" style={{ padding: '1rem 2.5rem' }} onClick={() => setEditingId(null)}><X size={18} /> İptal</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {committees.map(c => (
          <div key={c._id} className="glass" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ fontSize: '1.2rem' }}>{c.name}</h4>
              <p style={{ opacity: 0.7, fontSize: '0.9rem' }}>{c.description.substring(0, 100)}...</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }} onClick={() => startEdit(c)}>
                <Edit2 size={18} />
              </button>
              <button className="btn" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }} onClick={() => handleDelete(c._id)}>
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
