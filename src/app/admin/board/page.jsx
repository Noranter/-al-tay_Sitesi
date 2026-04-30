'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, X, Check, User } from 'lucide-react';

export default function AdminBoard() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({ name: '', role: '', photoUrl: '', order: 0 });

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = () => {
    setLoading(true);
    fetch('/api/board')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setMembers(data);
        } else {
          console.error('API did not return an array:', data);
          setMembers([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Fetch error:', err);
        setLoading(false);
      });
  };

  const handleSave = async () => {
    try {
      const res = await fetch('/api/board', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setShowAdd(false);
        setFormData({ name: '', role: '', photoUrl: '', order: 0 });
        fetchMembers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileUpload = async (e) => {
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
        setFormData({ ...formData, photoUrl: data.url });
      }
    } catch (err) {
      console.error('Upload failed', err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bu üyeyi silmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetch(`/api/board/${id}`, { method: 'DELETE' });
      if (res.ok) fetchMembers();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading && members.length === 0) return <div>Yükleniyor...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="section-title">Yönetim Kurulu</h1>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          <Plus size={18} /> Yeni Üye Ekle
        </button>
      </div>

      {showAdd && (
        <div className="glass card" style={{ marginBottom: '2rem' }}>
          <h3>Yeni Yönetim Kurulu Üyesi</h3>
          <div className="admin-form" style={{ marginTop: '1.5rem' }}>
            <div className="form-group">
              <label>İsim Soyisim</label>
              <input className="form-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Görev / Rol</label>
              <input className="form-input" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Fotoğraf Yükle</label>
              <input type="file" className="form-input" onChange={handleFileUpload} accept="image/*" />
              {formData.photoUrl && <p style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>Yüklendi: {formData.photoUrl}</p>}
            </div>
            <div className="form-group">
              <label>Sıralama (Opsiyonel)</label>
              <input type="number" className="form-input" value={formData.order} onChange={e => setFormData({...formData, order: parseInt(e.target.value)})} />
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn btn-primary" onClick={handleSave}><Check size={18} /> Kaydet</button>
              <button className="btn" onClick={() => setShowAdd(false)}><X size={18} /> İptal</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        {members.map(m => (
          <div key={m._id} className="glass card" style={{ textAlign: 'center', position: 'relative' }}>
            <button 
              onClick={() => handleDelete(m._id)} 
              style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
            >
              <Trash2 size={16} />
            </button>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--primary)', margin: '0 auto 1rem', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {m.photoUrl ? <img src={m.photoUrl} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={32} color="white" />}
            </div>
            <h4 style={{ fontSize: '1rem' }}>{m.name}</h4>
            <p style={{ opacity: 0.7, fontSize: '0.85rem' }}>{m.role}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
