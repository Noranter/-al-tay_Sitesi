'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, X, Check } from 'lucide-react';

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

            <div className="form-group">
              <label>Komite Banner (Önerilen Oran 3:1)</label>
              <input type="file" className="form-input" onChange={e => handleFileUpload(e, 'banner')} accept="image/*" />
              {formData.bannerUrl && (
                <div style={{ marginTop: '1rem' }}>
                  <img src={formData.bannerUrl} alt="Banner Preview" style={{ width: '200px', height: '66px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--primary)' }} />
                  <p style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>Yüklendi: {formData.bannerUrl}</p>
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Açıklama</label>
              <textarea className="form-input" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>

            <div className="form-group">
              <label>Başvuru Mesajı (Popup'ta görünecek)</label>
              <textarea className="form-input" placeholder="Başvurmak için mail atın..." value={formData.applicationMessage} onChange={e => setFormData({...formData, applicationMessage: e.target.value})} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="form-group">
                <label>Vizyon</label>
                <input className="form-input" value={formData.vision} onChange={e => setFormData({...formData, vision: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Misyon</label>
                <input className="form-input" value={formData.mission} onChange={e => setFormData({...formData, mission: e.target.value})} />
              </div>
            </div>

            <div style={{ border: '1px solid rgba(255,255,255,0.1)', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
              <h4 style={{ marginBottom: '1rem' }}>Komite Ekibi (Yönetim Kurulundan Seçin)</h4>
              
              <div className="form-group">
                <label>Divanlar (En fazla 2 kişi)</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {boardMembers.map(bm => (
                    <div 
                      key={bm._id} 
                      onClick={() => toggleDivanMember(bm._id)}
                      style={{ 
                        padding: '0.4rem 0.8rem', borderRadius: '20px', cursor: 'pointer', fontSize: '0.8rem',
                        background: formData.divanMembers?.includes(bm._id) ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                        color: formData.divanMembers?.includes(bm._id) ? 'white' : 'inherit',
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}
                    >
                      {bm.name}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label>Admin (1 Kişi)</label>
                  <select className="form-input" value={formData.adminMember || ''} onChange={e => setFormData({...formData, adminMember: e.target.value || null})}>
                    <option value="">Seçiniz...</option>
                    {boardMembers.map(bm => <option key={bm._id} value={bm._id}>{bm.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Sekreter (1 Kişi)</label>
                  <select className="form-input" value={formData.secretaryMember || ''} onChange={e => setFormData({...formData, secretaryMember: e.target.value || null})}>
                    <option value="">Seçiniz...</option>
                    {boardMembers.map(bm => <option key={bm._id} value={bm._id}>{bm.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Basın (1 Kişi)</label>
                  <select className="form-input" value={formData.pressMember || ''} onChange={e => setFormData({...formData, pressMember: e.target.value || null})}>
                    <option value="">Seçiniz...</option>
                    {boardMembers.map(bm => <option key={bm._id} value={bm._id}>{bm.name}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Çalışma Kağıdı Yükle (PDF veya Görsel)</label>
              <input type="file" className="form-input" onChange={handleFileUpload} />
              {formData.workingPaperUrl && <p style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>Yüklendi: {formData.workingPaperUrl}</p>}
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn btn-primary" onClick={handleSave}><Check size={18} /> Kaydet</button>
              <button className="btn" onClick={() => setEditingId(null)}><X size={18} /> İptal</button>
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
